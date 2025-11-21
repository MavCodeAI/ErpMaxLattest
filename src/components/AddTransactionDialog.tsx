import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { transactionSchema } from "@/utils/validation";
import { z } from "zod";

interface AddTransactionDialogProps {
  onAdd: (transaction: {
    transaction_id: string;
    type: string;
    category: string;
    date: string;
    amount: number;
    description?: string;
  }) => void;
}

export const AddTransactionDialog = ({ onAdd }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    transaction_id: "",
    type: "Income",
    category: "",
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: "",
  });

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate a unique transaction ID
  const generateTransactionId = () => {
    const prefix = formData.type === "Income" ? "INC" : "EXP";
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      transactionSchema.parse({
        transaction_id: formData.transaction_id || generateTransactionId(),
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        description: formData.description || undefined,
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
    
    // Generate transaction ID if not provided
    const transactionId = formData.transaction_id || generateTransactionId();
    
    onAdd({
      ...formData,
      transaction_id: transactionId
    });
    
    setFormData({
      transaction_id: "",
      type: "Income",
      category: "",
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: "",
    });
    setErrors({});
    setOpen(false);
    setLoading(false);
    
    toast({
      title: "Success",
      description: "Transaction added successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction_id">Transaction ID (Auto-generated if empty)</Label>
            <Input
              id="transaction_id"
              value={formData.transaction_id}
              onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              placeholder="Leave empty to auto-generate"
              className={errors.transaction_id ? "border-red-500" : ""}
            />
            {errors.transaction_id && <p className="text-red-500 text-sm">{errors.transaction_id}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Sales, Salary, Utilities"
              required
              className={errors.category ? "border-red-500" : ""}
            />
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
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
            <Label htmlFor="amount">Amount (PKR) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional notes..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding Transaction..." : "Add Transaction"}
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