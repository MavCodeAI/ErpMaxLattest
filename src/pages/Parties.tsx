import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Trash2, Edit, Loader2, Plus, Building, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useParties } from "@/hooks/useParties";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ErrorBoundary from "@/components/ErrorBoundary";

const Parties = () => {
  const { parties, isLoading, isError, deleteParty, createParty, updateParty } = useParties();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [newParty, setNewParty] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "customer" as "customer" | "supplier"
  });

  // Filter parties
  const filteredParties = useMemo(() => {
    return parties.filter(party => {
      const matchesSearch = 
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (party.email && party.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (party.phone && party.phone.includes(searchTerm));
      
      const matchesType = typeFilter === "all" || party.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [parties, searchTerm, typeFilter]);

  const handleDeleteClick = (party) => {
    setPartyToDelete(party);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (partyToDelete) {
      deleteParty(partyToDelete);
      setDeleteDialogOpen(false);
      setPartyToDelete(null);
    }
  };

  const handleAddParty = () => {
    setNewParty({
      name: "",
      email: "",
      phone: "",
      address: "",
      type: "customer"
    });
    setAddDialogOpen(true);
  };

  const handleEditClick = (party) => {
    setEditingParty(party);
    setEditDialogOpen(true);
  };

  const handleSaveNewParty = () => {
    createParty(newParty);
    setAddDialogOpen(false);
  };

  const handleSaveEditedParty = () => {
    if (editingParty) {
      updateParty({
        id: editingParty.id,
        type: editingParty.type,
        name: newParty.name,
        email: newParty.email,
        phone: newParty.phone,
        address: newParty.address
      });
      setEditDialogOpen(false);
      setEditingParty(null);
    }
  };

  const getTypeBadge = (type) => {
    if (type === "customer") {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Customer</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Supplier</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading parties data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <ErrorBoundary>
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Error Loading Parties</h2>
            <p className="text-muted-foreground mb-6">
              There was an issue loading the parties data. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Parties
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your customers and suppliers
            </p>
          </div>
          <Button onClick={handleAddParty} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Party
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search parties..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search parties"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-32" aria-label="Filter by type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="supplier">Suppliers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parties Table */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Parties List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredParties.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No parties found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by adding a new party.
                </p>
                <div className="mt-6">
                  <Button onClick={handleAddParty}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Party
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParties.map((party) => (
                      <TableRow key={party.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{party.name}</TableCell>
                        <TableCell>{getTypeBadge(party.type)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {party.email && <span>{party.email}</span>}
                            {party.phone && <span className="text-muted-foreground">{party.phone}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {party.address && (
                            <span className="text-muted-foreground">{party.address}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewParty({
                                  name: party.name,
                                  email: party.email || "",
                                  phone: party.phone || "",
                                  address: party.address || "",
                                  type: party.type
                                });
                                setEditingParty(party);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(party)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Party Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="party-type">Party Type</Label>
                <Select 
                  value={newParty.type} 
                  onValueChange={(value) => setNewParty({...newParty, type: value as "customer" | "supplier"})}
                >
                  <SelectTrigger id="party-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>
                    <SelectItem value="supplier">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Supplier
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="party-name">Name</Label>
                <Input
                  id="party-name"
                  value={newParty.name}
                  onChange={(e) => setNewParty({...newParty, name: e.target.value})}
                  placeholder="Enter party name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="party-email">Email</Label>
                <Input
                  id="party-email"
                  type="email"
                  value={newParty.email}
                  onChange={(e) => setNewParty({...newParty, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="party-phone">Phone</Label>
                <Input
                  id="party-phone"
                  value={newParty.phone}
                  onChange={(e) => setNewParty({...newParty, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="party-address">Address</Label>
                <Textarea
                  id="party-address"
                  value={newParty.address}
                  onChange={(e) => setNewParty({...newParty, address: e.target.value})}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveNewParty}
                  disabled={!newParty.name}
                >
                  Save Party
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Party Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Party</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-party-type">Party Type</Label>
                <Select 
                  value={newParty.type} 
                  onValueChange={(value) => setNewParty({...newParty, type: value as "customer" | "supplier"})}
                  disabled
                >
                  <SelectTrigger id="edit-party-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>
                    <SelectItem value="supplier">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Supplier
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-party-name">Name</Label>
                <Input
                  id="edit-party-name"
                  value={newParty.name}
                  onChange={(e) => setNewParty({...newParty, name: e.target.value})}
                  placeholder="Enter party name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-party-email">Email</Label>
                <Input
                  id="edit-party-email"
                  type="email"
                  value={newParty.email}
                  onChange={(e) => setNewParty({...newParty, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-party-phone">Phone</Label>
                <Input
                  id="edit-party-phone"
                  value={newParty.phone}
                  onChange={(e) => setNewParty({...newParty, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-party-address">Address</Label>
                <Textarea
                  id="edit-party-address"
                  value={newParty.address}
                  onChange={(e) => setNewParty({...newParty, address: e.target.value})}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEditedParty}
                  disabled={!newParty.name}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the party
                and remove their data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
};

export default Parties;