import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { itemSchema } from "@/utils/validation";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
}

interface AddItemDialogProps {
  onAdd: (item: {
    item_id: string;
    name: string;
    category: string;
    stock: number;
    price: number;
    status: string;
    description?: string;
    features?: string;
    unit?: string;
    supplier_id?: string;
    tax_rate?: number;
    cost_price?: number;
    min_stock_level?: number;
  }) => void;
}

export const AddItemDialog = ({ onAdd }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    item_id: "",
    name: "",
    category: "Electronics",
    stock: 0,
    price: 0,
    status: "In Stock",
    description: "",
    features: "",
    unit: "Pieces",
    supplier_id: "",
    tax_rate: 0,
    cost_price: 0,
    min_stock_level: 10,
  });

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("id, name");
    if (data) setSuppliers(data);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      itemSchema.parse({
        item_id: formData.item_id,
        name: formData.name,
        category: formData.category,
        stock: formData.stock,
        price: formData.price,
        cost_price: formData.cost_price || undefined,
        status: formData.status,
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Safe number parsing function
  const safeParseFloat = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeParseInt = (value: string): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    const itemData = {
      ...formData,
      supplier_id: formData.supplier_id || undefined,
      description: formData.description || undefined,
      features: formData.features || undefined,
    };

    onAdd(itemData);
    setFormData({
      item_id: "",
      name: "",
      category: "Electronics",
      stock: 0,
      price: 0,
      status: "In Stock",
      description: "",
      features: "",
      unit: "Pieces",
      supplier_id: "",
      tax_rate: 0,
      cost_price: 0,
      min_stock_level: 10,
    });
    setErrors({});
    setOpen(false);
    setLoading(false);

    toast({
      title: "Success",
      description: "Item added successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item_id">Item ID *</Label>
            <Input
              id="item_id"
              value={formData.item_id}
              onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
              placeholder="ITM-001"
              required
              className={errors.item_id ? "border-red-500" : ""}
            />
            {errors.item_id && <p className="text-red-500 text-sm">{errors.item_id}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product name"
              required
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              required
              className={errors.stock ? "border-red-500" : ""}
            />
            {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (PKR)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: safeParseFloat(e.target.value) })}
                className={errors.cost_price ? "border-red-500" : ""}
              />
              {errors.cost_price && <p className="text-red-500 text-sm">{errors.cost_price}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Sale Price (PKR) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit/UoM</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pieces">Pieces</SelectItem>
                  <SelectItem value="Kg">Kg</SelectItem>
                  <SelectItem value="Meter">Meter</SelectItem>
                  <SelectItem value="Liter">Liter</SelectItem>
                  <SelectItem value="Hours">Hours</SelectItem>
                  <SelectItem value="Box">Box</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select
              value={formData.supplier_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, supplier_id: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier (optional)" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_stock_level">Minimum Stock Level *</Label>
            <Input
              id="min_stock_level"
              type="number"
              value={formData.min_stock_level}
              onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })}
              required
              className={errors.stock ? "border-red-500" : ""} // Using stock error since min_stock_level isn't in schema
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Key features (one per line)"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
          </div>
                          <Button
                            type="submit"
                            className="w-full transition-colors"
                            disabled={loading || Object.values(errors).some(Boolean)}
                          >
                            {loading ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Adding Item...
                              </div>
                            ) : (
                              "Add Item"
                            )}
                          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
