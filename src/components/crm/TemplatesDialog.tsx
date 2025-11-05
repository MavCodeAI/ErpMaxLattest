import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useCRMEnhancements } from "@/hooks/useCRMEnhancements";
import { Plus, Trash2, Search } from "lucide-react";

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate?: (content: string) => void;
}

const categories = ["Greetings", "Order Updates", "Support", "Marketing", "Follow-up"];

export const TemplatesDialog = ({ open, onOpenChange, onSelectTemplate }: TemplatesDialogProps) => {
  const { templates, loadingTemplates, addTemplate, deleteTemplate } = useCRMEnhancements();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "Greetings",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTemplate.mutate(
      { ...formData, variables: null },
      {
        onSuccess: () => {
          setFormData({ name: "", content: "", category: "Greetings" });
          setShowAdd(false);
        },
      }
    );
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Message Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowAdd(!showAdd)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>

          {showAdd && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Welcome Message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="template-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-content">Message Content</Label>
                    <Textarea
                      id="template-content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={4}
                      placeholder="Hi {customer_name}, thank you for your order..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {"{customer_name}"}, {"{order_id}"} for dynamic values
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addTemplate.isPending}>
                      Save Template
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loadingTemplates ? (
            <p className="text-center text-muted-foreground py-8">Loading templates...</p>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {search ? "No templates found" : "No templates yet. Create your first template!"}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          {template.category && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {template.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                      </div>
                      <div className="flex gap-1">
                        {onSelectTemplate && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              onSelectTemplate(template.content);
                              onOpenChange(false);
                            }}
                          >
                            Use
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTemplate.mutate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
