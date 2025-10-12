import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, MessageCircle, Users } from "lucide-react";
import { useCRM } from "@/hooks/useCRM";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AddCustomerDialog from "./AddCustomerDialog";
import EditCustomerDialog from "./EditCustomerDialog";
import { Badge } from "@/components/ui/badge";

const CRMCustomers = () => {
  const { customers, loadingCustomers, deleteCustomer } = useCRM();
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.customer_id.toLowerCase().includes(search.toLowerCase()) ||
    customer.whatsapp_number?.includes(search) ||
    customer.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer.mutate(id);
    }
  };

  if (loadingCustomers) {
    return <div className="text-center py-8">Loading customers...</div>;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Customer Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {customers?.length || 0} customers
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="hover-scale">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, WhatsApp, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Customer ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">WhatsApp</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm">{customer.customer_id}</TableCell>
                  <TableCell className="font-semibold">{customer.name}</TableCell>
                  <TableCell>
                    {customer.whatsapp_number ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-mono text-sm">{customer.whatsapp_number}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">Not set</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{customer.email || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell className="text-sm">{customer.phone || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCustomer(customer)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredCustomers || filteredCustomers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground font-medium">No customers found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {search ? "Try a different search term" : "Add your first customer to get started"}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AddCustomerDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      {editingCustomer && (
        <EditCustomerDialog
          customer={editingCustomer}
          open={!!editingCustomer}
          onOpenChange={(open) => !open && setEditingCustomer(null)}
        />
      )}
    </Card>
  );
};

export default CRMCustomers;
