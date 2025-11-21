import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItem } from "@/hooks/useInventoryItems";
import { supabase } from "@/integrations/supabase/client";

interface Supplier {
  id: string;
  name: string;
}

interface EditItemDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: Partial<InventoryItem> & { id: string }) => void;
}

export const EditItemDialog = ({ item, open, onOpenChange, onUpdate }: EditItemDialogProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    item_id: "",
    name: "",
    category: "Electronics",
    stock: 0,
    price: 0,
    cost_price: 0,
    status: "In Stock",
    description: "",
    features: "",
    unit: "Pieces",
    supplier_id: "",
    tax_rate: 0,
    min_stock_level: 10,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        item_id: item.item_id,
        name: item.name,
        category: item.category,
        stock: item.stock,
        price: item.price,
        cost_price: item.cost_price || 0,
        status: item.status,
        description: item.description || "",
        features: item.features || "",
        unit: item.unit || "Pieces",
        supplier_id: item.supplier_id || "",
        tax_rate: item.tax_rate || 0,
        min_stock_level: item.min_stock_level || 10,
      });
    }
  }, [item]);

  const fetchSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("id, name");
    if (data) setSuppliers(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      // Prepare data for submission, converting empty optional fields to undefined
      const updateData = {
        ...formData,
        supplier_id: formData.supplier_id || undefined,
        description: formData.description || undefined,
        features: formData.features || undefined,
      };

      onUpdate({ id: item.id, ...updateData });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_item_id">Item ID</Label>
            <Input
              id="edit_item_id"
              value={formData.item_id}
              onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_name">Name</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_stock">Stock</Label>
            <Input
              id="edit_stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_cost_price">Cost Price (PKR)</Label>
              <Input
                id="edit_cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_price">Sale Price (PKR)</Label>
              <Input
                id="edit_price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_unit">Unit/UoM</Label>
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
              <Label htmlFor="edit_tax_rate">Tax Rate (%)</Label>
              <Input
                id="edit_tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_supplier">Supplier</Label>
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
            <Label htmlFor="edit_min_stock_level">Minimum Stock Level</Label>
            <Input
              id="edit_min_stock_level"
              type="number"
              value={formData.min_stock_level}
              onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_features">Features</Label>
            <Textarea
              id="edit_features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Key features (one per line)"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Update</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
