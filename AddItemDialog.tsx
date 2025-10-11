import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { EnhancedForm, FormFieldConfig } from "@/components/EnhancedForm";
import { itemSchema, ItemFormData } from "@/utils/validation";

interface AddItemDialogProps {
  onAdd: (item: {
    item_id: string;
    name: string;
    category: string;
    stock: number;
    price: number;
    status: string;
  }) => void;
}

export const AddItemDialog = ({ onAdd }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<ItemFormData> = {
    item_id: `ITEM-${Date.now().toString().slice(-6)}`,
    name: "",
    category: "Electronics",
    stock: 0,
    price: 0,
    status: "In Stock",
  };

  const fields: FormFieldConfig<ItemFormData>[] = [
    {
      name: "item_id",
      label: "Item ID",
      type: "text",
      placeholder: "ITEM-001",
      required: true,
      description: "Unique identifier for the item",
      prefix: "ITEM-",
    },
    {
      name: "name",
      label: "Item Name",
      type: "text",
      placeholder: "Enter item name",
      required: true,
      description: "Name of the inventory item",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "Electronics", label: "Electronics" },
        { value: "Furniture", label: "Furniture" },
        { value: "Accessories", label: "Accessories" },
      ],
      description: "Product category",
    },
    {
      name: "stock",
      label: "Initial Stock",
      type: "number",
      placeholder: "0",
      required: true,
      description: "Initial quantity in stock",
      validation: {
        min: 0,
      },
    },
    {
      name: "price",
      label: "Unit Price",
      type: "number",
      placeholder: "0.00",
      required: true,
      description: "Price per unit",
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
        { value: "In Stock", label: "In Stock" },
        { value: "Low Stock", label: "Low Stock" },
        { value: "Out of Stock", label: "Out of Stock" },
      ],
      description: "Current stock status",
      dependencies: [
        {
          field: "stock",
          value: 0,
          action: "require",
        },
      ],
    },
  ];

  const handleSubmit = async (data: ItemFormData) => {
    setIsLoading(true);
    try {
      // Auto-determine status based on stock if not explicitly set
      let status = data.status;
      if (data.stock === 0) {
        status = "Out of Stock";
      } else if (data.stock < 10) {
        status = "Low Stock";
      } else {
        status = "In Stock";
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAdd({ ...data, status });
      setOpen(false);
      toast.success("Item added successfully");
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async (data: Partial<ItemFormData>) => {
    // Auto-save draft to local storage
    localStorage.setItem('item-draft', JSON.stringify(data));
  };

  const handleCancel = () => {
    setOpen(false);
    // Clear draft on cancel
    localStorage.removeItem('item-draft');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        
        <EnhancedForm
          schema={itemSchema}
          fields={fields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onAutoSave={handleAutoSave}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel="Add Item"
          cancelLabel="Cancel"
          autoSaveDelay={1500}
          showAutoSaveStatus={true}
          layout="grid"
          gridColumns={2}
        />
      </DialogContent>
    </Dialog>
  );
};