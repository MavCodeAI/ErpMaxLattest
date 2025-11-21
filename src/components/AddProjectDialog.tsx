import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { projectSchema } from "@/utils/validation";
import { z } from "zod";

interface AddProjectDialogProps {
  onAdd: (project: {
    project_id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    budget?: number;
    status: string;
  }) => void;
}

export const AddProjectDialog = ({ onAdd }: AddProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    project_id: "",
    name: "",
    description: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    budget: 0,
    status: "Active",
  });

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      projectSchema.parse({
        project_id: formData.project_id,
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        budget: formData.budget,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
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

    // Prepare data for submission, converting empty end_date to null
    const projectData = {
      ...formData,
      end_date: formData.end_date || null,
    };

    onAdd(projectData);
    setFormData({
      project_id: "",
      name: "",
      description: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      budget: 0,
      status: "Active",
    });
    setErrors({});
    setOpen(false);
    setLoading(false);
    
    toast({
      title: "Success",
      description: "Project created successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_id">Project ID *</Label>
            <Input
              id="project_id"
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              placeholder="PRJ-001"
              required
              className={errors.project_id ? "border-red-500" : ""}
            />
            {errors.project_id && <p className="text-red-500 text-sm">{errors.project_id}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Project name"
              required
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project description..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className={errors.start_date ? "border-red-500" : ""}
              />
              {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={errors.end_date ? "border-red-500" : ""}
              />
              {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (PKR)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="1000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              className={errors.budget ? "border-red-500" : ""}
            />
            {errors.budget && <p className="text-red-500 text-sm">{errors.budget}</p>}
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
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating Project..." : "Create Project"}
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