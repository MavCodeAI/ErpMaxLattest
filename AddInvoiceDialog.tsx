import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { EnhancedForm, FormFieldConfig } from "@/components/EnhancedForm";
import { invoiceSchema, InvoiceFormData } from "@/utils/validation";
import { announceToScreenReader } from "@/utils/accessibility";

interface AddInvoiceDialogProps {
  onAdd: (invoice: {
    invoice_id: string;
    customer_name: string;
    date: string;
    total_amount: number;
    status: string;
  }) => void;
}

export const AddInvoiceDialog = ({ onAdd }: AddInvoiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<InvoiceFormData> = {
    invoice_id: `INV-${Date.now().toString().slice(-6)}`,
    customer_name: "",
    date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    status: "Pending",
  };

  const fields: FormFieldConfig<InvoiceFormData>[] = [
    {
      name: "invoice_id",
      label: "Invoice ID",
      type: "text",
      placeholder: "INV-001",
      required: true,
      description: "Unique identifier for the invoice",
      prefix: "INV-",
    },
    {
      name: "customer_name",
      label: "Customer Name",
      type: "text",
      placeholder: "Enter customer name",
      required: true,
      description: "Name of the customer for this invoice",
    },
    {
      name: "date",
      label: "Invoice Date",
      type: "date",
      required: true,
      description: "Date when the invoice was created",
    },
    {
      name: "total_amount",
      label: "Total Amount",
      type: "number",
      placeholder: "0.00",
      required: true,
      description: "Total amount for this invoice",
      prefix: "PKR",
      validation: {
        min: 0.01,
      },
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "Pending", label: "Pending" },
        { value: "Paid", label: "Paid" },
        { value: "Cancelled", label: "Cancelled" },
      ],
      description: "Current status of the invoice",
    },
  ];

  const handleSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true);
    announceToScreenReader("Creating invoice, please wait...", "assertive");
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAdd(data);
      setOpen(false);
      toast.success("Invoice created successfully");
      announceToScreenReader("Invoice created successfully", "polite");
    } catch (error) {
      toast.error("Failed to create invoice");
      announceToScreenReader("Failed to create invoice", "assertive");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async (data: Partial<InvoiceFormData>) => {
    // Auto-save draft to local storage
    localStorage.setItem('invoice-draft', JSON.stringify(data));
    announceToScreenReader("Draft saved", "polite");
  };

  const handleCancel = () => {
    setOpen(false);
    // Clear draft on cancel
    localStorage.removeItem('invoice-draft');
    announceToScreenReader("Invoice creation cancelled", "polite");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      announceToScreenReader("Create new invoice dialog opened", "polite");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2 min-h-[44px]"
          ariaLabel="Create new invoice"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-dialog-title"
        aria-describedby="invoice-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="invoice-dialog-title">Create New Invoice</DialogTitle>
        </DialogHeader>
        
        <div id="invoice-dialog-description" className="sr-only">
          Fill out the form below to create a new invoice. All required fields must be completed.
        </div>
        
        <EnhancedForm
          schema={invoiceSchema}
          fields={fields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onAutoSave={handleAutoSave}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel="Create Invoice"
          cancelLabel="Cancel"
          autoSaveDelay={1500}
          showAutoSaveStatus={true}
          layout="vertical"
        />
      </DialogContent>
    </Dialog>
  );
};
