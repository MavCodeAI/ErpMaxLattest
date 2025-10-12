import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { useCRM } from "@/hooks/useCRM";
import { Badge } from "@/components/ui/badge";
import AddProviderDialog from "./AddProviderDialog";
import EditProviderDialog from "./EditProviderDialog";

const CRMProviders = () => {
  const { providers, loadingProviders, deleteProvider, updateProvider } = useCRM();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this WhatsApp provider?")) {
      deleteProvider.mutate(id);
    }
  };

  const toggleProviderStatus = (provider: any) => {
    updateProvider.mutate({
      id: provider.id,
      is_active: !provider.is_active,
    });
  };

  const providerTypes = [
    { name: "Meta (Official)", description: "Official WhatsApp Business API" },
    { name: "Wati", description: "Cost-effective WhatsApp platform" },
    { name: "Respond.io", description: "Omnichannel messaging platform" },
    { name: "360dialog", description: "Transparent WhatsApp API pricing" },
    { name: "Gupshup", description: "WhatsApp API with chatbot services" },
    { name: "WasenderAPI", description: "Budget-friendly developer tools" },
    { name: "Authkey", description: "Pay-as-you-go WhatsApp API" },
  ];

  if (loadingProviders) {
    return <div className="text-center py-8">Loading providers...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WhatsApp API Providers</CardTitle>
              <CardDescription>
                Configure and manage your WhatsApp API integrations
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers?.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{provider.name}</h3>
                    <Badge variant={provider.is_active ? "default" : "secondary"}>
                      {provider.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {provider.provider_type}
                  </p>
                  {provider.phone_number && (
                    <p className="text-sm text-muted-foreground">
                      Phone: {provider.phone_number}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleProviderStatus(provider)}
                  >
                    {provider.is_active ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProvider(provider)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(provider.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {(!providers || providers.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No WhatsApp providers configured yet</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Provider
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supported Providers</CardTitle>
          <CardDescription>
            Choose from the following WhatsApp API providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {providerTypes.map((type) => (
              <div key={type.name} className="p-4 border rounded-lg">
                <h4 className="font-semibold">{type.name}</h4>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddProviderDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      {editingProvider && (
        <EditProviderDialog
          provider={editingProvider}
          open={!!editingProvider}
          onOpenChange={(open) => !open && setEditingProvider(null)}
        />
      )}
    </div>
  );
};

export default CRMProviders;
