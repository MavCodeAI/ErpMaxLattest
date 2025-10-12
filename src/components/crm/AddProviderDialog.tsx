import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRM } from "@/hooks/useCRM";

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddProviderDialog = ({ open, onOpenChange }: AddProviderDialogProps) => {
  const { addProvider } = useCRM();
  const [formData, setFormData] = useState({
    name: "",
    provider_type: "",
    api_key: "",
    api_secret: "",
    phone_number: "",
    webhook_url: "",
    is_active: true,
  });

  const providerTypes = [
    "Meta (Official WhatsApp Business API)",
    "Wati",
    "Respond.io",
    "360dialog",
    "Gupshup",
    "WasenderAPI",
    "Authkey",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProvider.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          name: "",
          provider_type: "",
          api_key: "",
          api_secret: "",
          phone_number: "",
          webhook_url: "",
          is_active: true,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add WhatsApp Provider</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Provider Name *</Label>
            <Input
              id="name"
              placeholder="e.g., My WhatsApp Business"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider_type">Provider Type *</Label>
            <Select
              value={formData.provider_type}
              onValueChange={(value) => setFormData({ ...formData, provider_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providerTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key *</Label>
            <Input
              id="api_key"
              type="password"
              placeholder="Enter your API key"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_secret">API Secret (if required)</Label>
            <Input
              id="api_secret"
              type="password"
              placeholder="Enter API secret"
              value={formData.api_secret}
              onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">WhatsApp Phone Number</Label>
            <Input
              id="phone_number"
              placeholder="+92 300 1234567"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              placeholder="https://your-webhook-url.com"
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProvider.isPending}>
              {addProvider.isPending ? "Adding..." : "Add Provider"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProviderDialog;
