import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useCRMEnhancements } from "@/hooks/useCRMEnhancements";
import { Plus, Trash2, Zap } from "lucide-react";

interface QuickRepliesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReply?: (content: string) => void;
}

export const QuickRepliesDialog = ({ open, onOpenChange, onSelectReply }: QuickRepliesDialogProps) => {
  const { quickReplies, loadingQuickReplies, addQuickReply, deleteQuickReply } = useCRMEnhancements();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    shortcut: "",
    content: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addQuickReply.mutate(
      { ...formData, is_shared: true },
      {
        onSuccess: () => {
          setFormData({ shortcut: "", content: "", category: "" });
          setShowAdd(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Replies</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAdd(!showAdd)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Quick Reply
            </Button>
          </div>

          {showAdd && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shortcut">Shortcut</Label>
                    <Input
                      id="shortcut"
                      value={formData.shortcut}
                      onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                      required
                      placeholder="/hello"
                    />
                    <p className="text-xs text-muted-foreground">Type this in the message box to use</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reply-category">Category (optional)</Label>
                    <Input
                      id="reply-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="FAQs, Pricing, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reply-content">Reply Content</Label>
                    <Textarea
                      id="reply-content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={3}
                      placeholder="Your quick reply message..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addQuickReply.isPending}>
                      Save Quick Reply
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loadingQuickReplies ? (
            <p className="text-center text-muted-foreground py-8">Loading quick replies...</p>
          ) : quickReplies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No quick replies yet. Create your first quick reply!
            </p>
          ) : (
            <div className="space-y-2">
              {quickReplies.map((reply) => (
                <Card key={reply.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-primary" />
                          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                            {reply.shortcut}
                          </code>
                          {reply.category && (
                            <span className="text-xs text-muted-foreground">• {reply.category}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{reply.content}</p>
                      </div>
                      <div className="flex gap-1">
                        {onSelectReply && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              onSelectReply(reply.content);
                              onOpenChange(false);
                            }}
                          >
                            Use
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteQuickReply.mutate(reply.id)}
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
