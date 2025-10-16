import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceItem } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";

interface AddInvoiceDialogProps {
  onAdd: (invoice: any) => void;
}

export const AddInvoiceDialog = ({ onAdd }: AddInvoiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
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

  const [items, setItems] = useState<InvoiceItem[]>([
    { product_name: "", quantity: 1, unit_price: 0, subtotal: 0 }
  ]);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const calculateItemSubtotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount - discount;
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].subtotal = calculateItemSubtotal(
        newItems[index].quantity,
        newItems[index].unit_price
      );
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_name: "", quantity: 1, unit_price: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoice_id || !formData.customer_name) {
      toast({
        title: "Validation Error",
        description: "Invoice ID اور Customer Name ضروری ہیں۔",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => !item.product_name || item.quantity <= 0)) {
      toast({
        title: "Validation Error",
        description: "تمام products کی تفصیلات درست بھریں۔",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const invoiceData = {
        ...formData,
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
      setItems([{ product_name: "", quantity: 1, unit_price: 0, subtotal: 0 }]);
      setDiscount(0);
      setTax(0);
      setOpen(false);
      
      toast({
        title: "کامیابی",
        description: "Invoice کامیابی سے بن گیا۔",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invoice بنانے میں مسئلہ آیا۔",
        variant: "destructive",
      });
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
          <DialogTitle>نیا Invoice بنائیں</DialogTitle>
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
                placeholder="INV-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">تاریخ *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">کسٹمر کی تفصیلات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">نام *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="علی خان"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">فون نمبر</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="0301-1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">ای میل</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="ali@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_address">بلنگ ایڈریس</Label>
                <Input
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  placeholder="لاہور، پاکستان"
                />
              </div>
            </div>
          </div>

          {/* Products/Items */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">پروڈکٹس / خدمات</h3>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/20 rounded-md">
                <div className="col-span-12 md:col-span-5 space-y-2">
                  <Label>پروڈکٹ کا نام *</Label>
                  <Input
                    value={item.product_name}
                    onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                    placeholder="آم کا اچار"
                    required
                  />
                </div>
                <div className="col-span-4 md:col-span-2 space-y-2">
                  <Label>تعداد *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="col-span-4 md:col-span-2 space-y-2">
                  <Label>قیمت (PKR) *</Label>
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
                  <Label>کل</Label>
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
            ))}
          </div>

          {/* Financial Summary */}
          <div className="space-y-3 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax">ٹیکس (%)</Label>
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
                <Label htmlFor="discount">رعایت (PKR)</Label>
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
                  <SelectItem value="Cash">نقد</SelectItem>
                  <SelectItem value="Bank Transfer">بینک ٹرانسفر</SelectItem>
                  <SelectItem value="Easypaisa">Easypaisa</SelectItem>
                  <SelectItem value="JazzCash">JazzCash</SelectItem>
                  <SelectItem value="Card">کارڈ</SelectItem>
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
                  <SelectItem value="Paid">ادا شدہ</SelectItem>
                  <SelectItem value="Unpaid">غیر ادا شدہ</SelectItem>
                  <SelectItem value="Partially Paid">جزوی ادا شدہ</SelectItem>
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
            <Label htmlFor="notes">نوٹس</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="اضافی معلومات..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Invoice بنائیں</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              منسوخ کریں
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
