import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { usePurchase } from "@/hooks/usePurchase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Parties = () => {
  const { customers, isLoading: customersLoading } = useSales();
  const { suppliers, isLoading: suppliersLoading } = usePurchase();
  const [activeTab, setActiveTab] = useState("customers");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const handleAdd = async () => {
    try {
      const table = activeTab === "customers" ? "customers" : "suppliers";
      const idPrefix = activeTab === "customers" ? "CUS" : "SUP";
      const idField = activeTab === "customers" ? "customer_id" : "supplier_id";
      
      const timestamp = Date.now().toString().slice(-6);
      const generatedId = `${idPrefix}-${timestamp}`;

      const insertData: any = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
      };

      if (activeTab === "customers") {
        insertData.customer_id = generatedId;
      } else {
        insertData.supplier_id = generatedId;
      }

      const { error } = await supabase
        .from(table)
        .insert([insertData]);

      if (error) throw error;

      toast.success(`${activeTab === "customers" ? "Customer" : "Supplier"} added successfully`);
      setIsAddDialogOpen(false);
      resetForm();
      window.location.reload();
    } catch (error: any) {
      toast.error("Failed to add: " + error.message);
    }
  };

  const handleEdit = async () => {
    try {
      const table = activeTab === "customers" ? "customers" : "suppliers";
      
      const { error } = await supabase
        .from(table)
        .update(formData)
        .eq("id", selectedParty.id);

      if (error) throw error;

      toast.success(`${activeTab === "customers" ? "Customer" : "Supplier"} updated successfully`);
      setIsEditDialogOpen(false);
      setSelectedParty(null);
      resetForm();
      window.location.reload();
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this party?")) return;

    try {
      const table = activeTab === "customers" ? "customers" : "suppliers";
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(`${activeTab === "customers" ? "Customer" : "Supplier"} deleted successfully`);
      window.location.reload();
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  const openEditDialog = (party: any) => {
    setSelectedParty(party);
    setFormData({
      name: party.name,
      email: party.email || "",
      phone: party.phone || "",
      address: party.address || "",
    });
    setIsEditDialogOpen(true);
  };

  const PartyCard = ({ party, type }: { party: any; type: "customer" | "supplier" }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{party.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {type === "customer" ? party.customer_id : party.supplier_id}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(party)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(party.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {party.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{party.email}</span>
          </div>
        )}
        {party.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{party.phone}</span>
          </div>
        )}
        {party.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{party.address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const PartyForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter name"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone"
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter address"
        />
      </div>
    </div>
  );

  if (customersLoading || suppliersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Parties Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your customers and suppliers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="customers">
              Customers ({customers.length})
            </TabsTrigger>
            <TabsTrigger value="suppliers">
              Suppliers ({suppliers.length})
            </TabsTrigger>
          </TabsList>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add {activeTab === "customers" ? "Customer" : "Supplier"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Add New {activeTab === "customers" ? "Customer" : "Supplier"}
                </DialogTitle>
              </DialogHeader>
              <PartyForm />
              <Button onClick={handleAdd} disabled={!formData.name}>
                Add {activeTab === "customers" ? "Customer" : "Supplier"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="customers" className="space-y-4">
          {customers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No customers found</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Customer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customers.map((customer) => (
                <PartyCard key={customer.id} party={customer} type="customer" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          {suppliers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No suppliers found</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Supplier
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suppliers.map((supplier) => (
                <PartyCard key={supplier.id} party={supplier} type="supplier" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {activeTab === "customers" ? "Customer" : "Supplier"}
            </DialogTitle>
          </DialogHeader>
          <PartyForm />
          <Button onClick={handleEdit} disabled={!formData.name}>
            Update {activeTab === "customers" ? "Customer" : "Supplier"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Parties;
