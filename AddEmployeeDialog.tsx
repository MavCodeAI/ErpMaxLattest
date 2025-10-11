import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { EnhancedForm, FormFieldConfig } from "@/components/EnhancedForm";
import { RichTextEditor } from "@/components/RichTextEditor";
import { z } from "zod";

// Extended employee schema with notes
const employeeWithNotesSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50, "Phone too long").optional().or(z.literal("")),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  salary: z.number().min(0, "Salary must be positive"),
  status: z.enum(["Active", "Inactive", "On Leave"]),
  hire_date: z.string(),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
});

type EmployeeWithNotesFormData = z.infer<typeof employeeWithNotesSchema>;

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
    notes?: string;
  }) => void;
}

export const AddEmployeeDialog = ({ onAdd }: AddEmployeeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const defaultValues: Partial<EmployeeWithNotesFormData> = {
    employee_id: `EMP-${Date.now().toString().slice(-6)}`,
    name: "",
    email: "",
    phone: "",
    department: "Sales",
    position: "",
    salary: 0,
    status: "Active",
    hire_date: new Date().toISOString().split('T')[0],
    notes: "",
  };

  const fields: FormFieldConfig<EmployeeWithNotesFormData>[] = [
    {
      name: "employee_id",
      label: "Employee ID",
      type: "text",
      placeholder: "EMP-001",
      required: true,
      description: "Unique identifier for the employee",
      prefix: "EMP-",
      className: "md:col-span-1",
    },
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true,
      description: "Employee's full name",
      className: "md:col-span-1",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "employee@company.com",
      description: "Work email address",
      className: "md:col-span-1",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      placeholder: "+92 300 1234567",
      description: "Contact phone number",
      className: "md:col-span-1",
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      required: true,
      options: [
        { value: "Sales", label: "Sales" },
        { value: "Marketing", label: "Marketing" },
        { value: "IT", label: "Information Technology" },
        { value: "HR", label: "Human Resources" },
        { value: "Finance", label: "Finance & Accounting" },
        { value: "Operations", label: "Operations" },
        { value: "Customer Service", label: "Customer Service" },
      ],
      description: "Employee's department",
      className: "md:col-span-1",
    },
    {
      name: "position",
      label: "Position/Title",
      type: "text",
      placeholder: "e.g., Senior Developer",
      required: true,
      description: "Job title or position",
      className: "md:col-span-1",
      dependencies: [
        {
          field: "department",
          value: "IT",
          action: "show",
        },
      ],
    },
    {
      name: "salary",
      label: "Monthly Salary",
      type: "number",
      placeholder: "50000",
      required: true,
      description: "Monthly salary amount",
      prefix: "PKR",
      validation: {
        min: 1,
      },
      className: "md:col-span-1",
    },
    {
      name: "hire_date",
      label: "Hire Date",
      type: "date",
      required: true,
      description: "Employee's joining date",
      className: "md:col-span-1",
    },
    {
      name: "status",
      label: "Employment Status",
      type: "select",
      required: true,
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
        { value: "On Leave", label: "On Leave" },
      ],
      description: "Current employment status",
      className: "md:col-span-2",
    },
  ];

  const handleSubmit = async (data: EmployeeWithNotesFormData) => {
    setIsLoading(true);
    try {
      // Include notes from rich text editor
      const employeeData = { ...data, notes };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAdd(employeeData);
      setOpen(false);
      setNotes("");
      toast.success("Employee added successfully");
    } catch (error) {
      toast.error("Failed to add employee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async (data: Partial<EmployeeWithNotesFormData>) => {
    // Auto-save draft including notes
    const draftData = { ...data, notes };
    localStorage.setItem('employee-draft', JSON.stringify(draftData));
  };

  const handleCancel = () => {
    setOpen(false);
    setNotes("");
    // Clear draft on cancel
    localStorage.removeItem('employee-draft');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <EnhancedForm
            schema={employeeWithNotesSchema.omit({ notes: true })}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onAutoSave={handleAutoSave}
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel="Add Employee"
            cancelLabel="Cancel"
            autoSaveDelay={2000}
            showAutoSaveStatus={true}
            layout="grid"
            gridColumns={2}
          />

          {/* Rich Text Editor for Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Additional Notes
            </label>
            <RichTextEditor
              value={notes}
              onChange={setNotes}
              placeholder="Add any additional notes about the employee (optional)..."
              maxLength={1000}
              showPreview={true}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Add any relevant information about the employee, training requirements, or special notes.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};