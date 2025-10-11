import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    order_id: "",
    supplier_name: "",
    date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    status: "Pending",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.order_id || !formData.supplier_name || formData.total_amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly.",
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
    setOpen(false);
    
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
              placeholder="PO-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name *</Label>
            <Input
              id="supplier_name"
              value={formData.supplier_name}
              onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              placeholder="Supplier name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Create Order</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
