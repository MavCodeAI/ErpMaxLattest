import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { employeeSchema } from "@/utils/validation";
import { z } from "zod";
import FormErrorBoundary from "@/components/FormErrorBoundary";

interface AddEmployeeDialogProps {
  onAdd: (employee: {
    employee_id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    hire_date: string;
    status: string;
    email?: string;
    phone?: string;
  }) => void;
}

export const AddEmployeeDialog = ({ onAdd }: AddEmployeeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    department: "",
    position: "",
    salary: 0,
    hire_date: new Date().toISOString().split('T')[0],
    status: "Active",
    email: "",
    phone: "",
  });

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      employeeSchema.parse({
        employee_id: formData.employee_id,
        name: formData.name,
        department: formData.department,
        position: formData.position,
        salary: formData.salary,
        hire_date: formData.hire_date,
        status: formData.status,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
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
      employee_id: "",
      name: "",
      department: "",
      position: "",
      salary: 0,
      hire_date: new Date().toISOString().split('T')[0],
      status: "Active",
      email: "",
      phone: "",
    });
    setErrors({});
    setOpen(false);
    setLoading(false);
    
    toast({
      title: "Success",
      description: "Employee added successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID *</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="EMP-001"
                required
                className={errors.employee_id ? "border-red-500" : ""}
              />
              {errors.employee_id && <p className="text-red-500 text-sm">{errors.employee_id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Employee name"
                required
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., IT, Sales, HR"
                required
                className={errors.department ? "border-red-500" : ""}
              />
              {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Manager, Developer"
                required
                className={errors.position ? "border-red-500" : ""}
              />
              {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary (PKR) *</Label>
              <Input
                id="salary"
                type="number"
                min="0"
                step="1000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                required
                className={errors.salary ? "border-red-500" : ""}
              />
              {errors.salary && <p className="text-red-500 text-sm">{errors.salary}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date *</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                required
                className={errors.hire_date ? "border-red-500" : ""}
              />
              {errors.hire_date && <p className="text-red-500 text-sm">{errors.hire_date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding Employee..." : "Add Employee"}
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
