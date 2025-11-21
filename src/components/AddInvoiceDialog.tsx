import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Customer, InvoiceItem } from "@/types/sales";
import { supabase } from "@/integrations/supabase/client";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { usePriceLists } from "@/hooks/usePriceLists";
import { itemSchema, invoiceSchema } from "@/utils/validation";
import { z } from "zod";

interface InvoiceData {
  invoice_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  billing_address: string;
  shipping_address: string;
  date: string;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  invoice_type: string;
  notes: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  created_by: string | undefined;
}

interface AddInvoiceDialogProps {
  onAdd: (invoice: InvoiceData) => Promise<unknown> | void;
  customers: Customer[];
  customersLoading?: boolean;
}

const createInitialFormData = () => ({
  invoice_id: "",
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  billing_address: "",
  shipping_address: "",
  date: new Date().toISOString().split('T')[0],
  payment_method: "Cash",
  payment_status: "Unpaid",
  transaction_id: "",
  invoice_type: "Sale",
  notes: "",
  status: "Pending",
});

const createEmptyItem = (): InvoiceItem => ({
  product_name: "",
  quantity: 1,
  unit_price: 0,
  subtotal: 0,
  product_id: "",
});

export const AddInvoiceDialog = ({ onAdd, customers, customersLoading = false }: AddInvoiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { items: products } = useInventoryItems();
  const { calculatePrice } = usePriceLists();

  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  const [formData, setFormData] = useState(createInitialFormData);

  const [items, setItems] = useState<InvoiceItem[]>([
    createEmptyItem()
  ]);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  // Product selection state - track selected product IDs
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([""]);

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({});

  // Generate unique invoice ID when dialog opens
  useEffect(() => {
    if (open && !formData.invoice_id) {
      const timestamp = Date.now();
      const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const invoiceId = `INV-${timestamp}-${randomDigits}`;
      setFormData(prev => ({ ...prev, invoice_id: invoiceId }));
    }
  }, [open, formData.invoice_id]);

  const calculateItemSubtotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount - discount;
    return { subtotal, taxAmount, total };
  };

  // Check if enough stock is available
  const checkStockAvailability = (productId: string, requestedQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    return product.stock >= requestedQuantity;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newItemErrors: Record<number, Record<string, string>> = {};

    // Validate main form data
    try {
      invoiceSchema.parse({
        invoice_id: formData.invoice_id,
        customer_name: formData.customer_name,
        total_amount: calculateTotals().total,
        status: formData.status,
        date: formData.date,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const fieldName = err.path[0];
          if (fieldName) {
            newErrors[fieldName as string] = err.message;
          }
        });
      }
    }

    // Validate items
    items.forEach((item, index) => {
      if (!item.product_name || item.quantity <= 0) {
        newItemErrors[index] = {
          ...newItemErrors[index],
          product_name: !item.product_name ? "Product is required" : "",
          quantity: item.quantity <= 0 ? "Quantity must be positive" : ""
        };
      }
    });

    setErrors(newErrors);
    setItemErrors(newItemErrors);

    return Object.keys(newErrors).length === 0 && Object.keys(newItemErrors).length === 0;
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem | 'product_id', value: string | number) => {
    const newItems = [...items];
    const newSelectedProductIds = [...selectedProductIds];

    newItems[index] = { ...newItems[index], [field]: value };

    // Handle product selection
    if (field === 'product_id' && typeof value === 'string' && value && selectedStoreId) {
      const product = products.find(p => p.id === value);
      if (product) {
        // Check stock availability
        const availableStock = product.stock;
        const currentQuantity = newItems[index].quantity;

        if (currentQuantity > availableStock) {
          toast({
            title: "Stock Warning",
            description: `Only ${availableStock} units available for ${product.name}`,
            variant: "destructive",
          });
          // Reduce quantity to available stock
          newItems[index].quantity = availableStock;
        }

        // Update product details
        newItems[index].product_name = product.name;

        // Calculate price for store
        const calculatedPrice = calculatePrice(
          Number(product.price),
          selectedStoreId,
          product.id
        );
        newItems[index].unit_price = calculatedPrice;

        // Update selected product IDs to prevent duplicates
        newSelectedProductIds[index] = value;
      }
      setSelectedProductIds(newSelectedProductIds);
    }

    // Handle quantity changes - check stock
    if (field === 'quantity' && typeof value === 'number' && selectedProductIds[index]) {
      const product = products.find(p => p.id === selectedProductIds[index]);
      if (product && value > product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} units available for ${product.name}`,
          variant: "destructive",
        });
        value = product.stock; // Set to maximum available
      }
      newItems[index].quantity = value;
    }

    // Recalculate subtotal
    newItems[index].subtotal = calculateItemSubtotal(
      newItems[index].quantity,
      newItems[index].unit_price
    );

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_name: "", quantity: 1, unit_price: 0, subtotal: 0, product_id: "" }]);
    setSelectedProductIds([...selectedProductIds, ""]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      setSelectedProductIds(selectedProductIds.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!formData.invoice_id || !formData.customer_name || !selectedStoreId) {
        toast({
          title: "Validation Error",
          description: "Invoice ID, Customer Name, and Store selection are required.",
          variant: "destructive",
        });
        return;
      }

      if (items.some(item => !item.product_name || item.quantity <= 0)) {
        toast({
          title: "Validation Error",
          description: "Please fill all product details correctly.",
          variant: "destructive",
        });
        return;
      }

      // Final stock validation before submission
      for (const item of items) {
        if (!checkStockAvailability(item.product_id!, item.quantity)) {
          const product = products.find(p => p.id === item.product_id);
          toast({
            title: "Stock Error",
            description: `Insufficient stock for ${product?.name}. Only ${product?.stock} units available.`,
            variant: "destructive",
          });
          return;
        }
      }

      const { subtotal, taxAmount, total } = calculateTotals();

      const { data: { user } } = await supabase.auth.getUser();

      const invoiceData = {
        ...formData,
        customer_id: selectedStoreId,
        items: items,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discount,
        total_amount: total,
        created_by: user?.id,
      };

      onAdd(invoiceData);

      // Reset form
      setFormData({
        invoice_id: "",
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        billing_address: "",
        shipping_address: "",
        date: new Date().toISOString().split('T')[0],
        payment_method: "Cash",
        payment_status: "Unpaid",
        transaction_id: "",
        invoice_type: "Sale",
        notes: "",
        status: "Pending",
      });
      setItems([{ product_name: "", quantity: 1, unit_price: 0, subtotal: 0, product_id: "" }]);
      setSelectedProductIds([""]);
      setDiscount(0);
      setTax(0);
      setSelectedStoreId("");
      setOpen(false);
      setErrors({});
      setItemErrors({});

      toast({
        title: "Success",
        description: "Invoice created successfully.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: `Failed to create invoice: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_id">Invoice ID *</Label>
              <Input
                id="invoice_id"
                value={formData.invoice_id}
                onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
                placeholder="Automatically generated"
                required
                disabled
                className={errors.invoice_id ? "border-red-500" : ""}
              />
              {errors.invoice_id && <p className="text-red-500 text-sm">{errors.invoice_id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
            </div>
          </div>

          {/* Customer/Store Selection */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Customer / Store Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store">Select Store *</Label>
                <Select
                  value={selectedStoreId}
                  onValueChange={(value) => {
                    setSelectedStoreId(value);
                    const store = customers.find(c => c.id === value);
                    if (store) {
                      setFormData({
                        ...formData,
                        customer_name: store.name,
                        customer_phone: store.phone || "",
                        customer_email: store.email || "",
                        billing_address: store.address || ""
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.phone && `(${customer.phone})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_name">Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Store Name"
                  disabled={!!selectedStoreId}
                  required
                  className={errors.customer_name ? "border-red-500" : ""}
                />
                {errors.customer_name && <p className="text-red-500 text-sm">{errors.customer_name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone Number</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="0301-1234567"
                  pattern="^(\+92|0)[3][0-9]{9}$"
                  title="Please enter a valid Pakistani phone number (03001234567 or +923001234567)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email Address</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="ali@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_address">Billing Address</Label>
                <Input
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  placeholder="Lahore, Pakistan"
                />
              </div>
            </div>
          </div>

          {/* Products/Items */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Products / Services</h3>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => {
              const product = products.find(p => p.id === selectedProductIds[index]);
              const isLowStock = product && product.stock <= (product.min_stock_level || 10);

              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/20 rounded-md border">
                  {isLowStock && (
                    <div className="col-span-12 mb-2">
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Low stock warning: Only {product.stock} units available
                      </div>
                    </div>
                  )}
                  <div className="col-span-12 md:col-span-4 space-y-2">
                    <Label>Product *</Label>
                    <Select
                      value={selectedProductIds[index] || ""}
                      onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                      disabled={!selectedStoreId}
                    >
                      <SelectTrigger className={itemErrors[index]?.product_name ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - Rs {product.price} (Stock: {product.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {itemErrors[index]?.product_name && <p className="text-red-500 text-sm">{itemErrors[index]?.product_name}</p>}
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={product?.stock || 0}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      max={product?.stock || 1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                      className={`${item.quantity > (product?.stock || 0) ? "border-red-500" : ""} ${itemErrors[index]?.quantity ? "border-red-500" : ""}`}
                    />
                    {itemErrors[index]?.quantity && <p className="text-red-500 text-sm">{itemErrors[index]?.quantity}</p>}
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-2">
                    <Label>Price (PKR) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 space-y-2">
                    <Label>Total</Label>
                    <Input
                      type="number"
                      value={item.subtotal.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Summary */}
          <div className="space-y-3 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax">Tax (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (PKR)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-md space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">Rs {totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-semibold">Rs {totals.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-semibold">- Rs {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-primary">Rs {totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Easypaisa">Easypaisa</SelectItem>
                  <SelectItem value="JazzCash">JazzCash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_id">Transaction ID</Label>
              <Input
                id="transaction_id"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                placeholder="TXN-12345"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating Invoice..." : "Create Invoice"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
