import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { purchaseOrderSchema } from "@/utils/validation";
import { z } from "zod";

interface AddPurchaseOrderDialogProps {
  onAdd: (order: {
    order_id: string;
    supplier_name: string;
    date: string;
    total_amount: number;
    status: string;
  }) => void;
}

export const AddPurchaseOrderDialog = ({ onAdd }: AddPurchaseOrderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    order_id: "",
    supplier_name: "",
    date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    status: "Pending",
  });

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate unique order ID when dialog opens
  useEffect(() => {
    if (open && !formData.order_id) {
      const timestamp = Date.now();
      const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const orderId = `PO-${timestamp}-${randomDigits}`;
      setFormData(prev => ({ ...prev, order_id: orderId }));
    }
  }, [open, formData.order_id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      purchaseOrderSchema.parse({
        order_id: formData.order_id,
        supplier_name: formData.supplier_name,
        total_amount: formData.total_amount,
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    onAdd(formData);
    setFormData({
      order_id: "",
      supplier_name: "",
      date: new Date().toISOString().split('T')[0],
      total_amount: 0,
      status: "Pending",
    });
    setErrors({});
    setOpen(false);
    setLoading(false);

    toast({
      title: "Success",
      description: "Purchase order created successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          New Purchase Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order_id">Order ID *</Label>
            <Input
              id="order_id"
              value={formData.order_id}
              onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
              placeholder="Automatically generated"
              required
              className={errors.order_id ? "border-red-500" : ""}
              disabled
            />
            {errors.order_id && <p className="text-red-500 text-sm">{errors.order_id}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name *</Label>
            <Input
              id="supplier_name"
              value={formData.supplier_name}
              onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              placeholder="Supplier name"
              required
              className={errors.supplier_name ? "border-red-500" : ""}
            />
            {errors.supplier_name && <p className="text-red-500 text-sm">{errors.supplier_name}</p>}
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
          <div className="space-y-2">
            <Label htmlFor="total_amount">Total Amount (PKR) *</Label>
            <Input
              id="total_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
              required
              className={errors.total_amount ? "border-red-500" : ""}
            />
            {errors.total_amount && <p className="text-red-500 text-sm">{errors.total_amount}</p>}
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating Order..." : "Create Order"}
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
