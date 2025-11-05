import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Power, PowerOff, Settings, MessageCircle } from "lucide-react";
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
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="h-5 w-5 text-primary" />
                WhatsApp API Providers
              </CardTitle>
              <CardDescription className="mt-1">
                Configure and manage your WhatsApp API integrations
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="hover-scale">
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {providers?.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      provider.is_active ? 'bg-green-500/10' : 'bg-muted'
                    }`}>
                      <MessageCircle className={`h-5 w-5 ${
                        provider.is_active ? 'text-green-500' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {provider.provider_type}
                      </p>
                    </div>
                    <Badge variant={provider.is_active ? "default" : "secondary"} className="ml-2">
                      {provider.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {provider.phone_number && (
                    <p className="text-sm text-muted-foreground mt-2 ml-12 font-mono">
                      📞 {provider.phone_number}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleProviderStatus(provider)}
                    className={`h-9 w-9 p-0 ${
                      provider.is_active ? 'hover:bg-orange-500/10 hover:text-orange-500' : 'hover:bg-green-500/10 hover:text-green-500'
                    }`}
                    title={provider.is_active ? "Deactivate" : "Activate"}
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
                    className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(provider.id)}
                    className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!providers || providers.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-4">No WhatsApp providers configured yet</p>
                <Button onClick={() => setShowAddDialog(true)} className="hover-scale">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Provider
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Supported Providers
          </CardTitle>
          <CardDescription>
            Choose from the following WhatsApp API providers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {providerTypes.map((type) => (
              <div key={type.name} className="p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all">
                <h4 className="font-semibold text-primary">{type.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
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
