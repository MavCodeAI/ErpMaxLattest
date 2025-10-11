import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInventoryItems, InventoryItem } from "@/hooks/useInventoryItems";
import { AddItemDialog } from "@/components/AddItemDialog";
import { EditItemDialog } from "@/components/EditItemDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
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

const Inventory = () => {
  const { items, isLoading, createItem, updateItem, deleteItem } = useInventoryItems();
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in stock": return "bg-success text-success-foreground";
      case "low stock": return "bg-warning text-warning-foreground";
      case "out of stock": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.status.toLowerCase() === "low stock").length;
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0);

  const categories = [
    { 
      name: "Electronics", 
      items: items.filter(item => item.category === "Electronics").length,
      value: items.filter(item => item.category === "Electronics").reduce((sum, item) => sum + (item.price * item.stock), 0)
    },
    { 
      name: "Furniture", 
      items: items.filter(item => item.category === "Furniture").length,
      value: items.filter(item => item.category === "Furniture").reduce((sum, item) => sum + (item.price * item.stock), 0)
    },
    { 
      name: "Accessories", 
      items: items.filter(item => item.category === "Accessories").length,
      value: items.filter(item => item.category === "Accessories").reduce((sum, item) => sum + (item.price * item.stock), 0)
    },
  ];

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Inventory Management</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Track and manage your inventory items</p>
          </div>
          <AddItemDialog onAdd={createItem} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <h3 className="text-2xl font-bold mt-1">{isLoading ? "..." : totalItems}</h3>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                  <h3 className="text-2xl font-bold mt-1">{isLoading ? "..." : lowStockItems}</h3>
                </div>
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <h3 className="text-2xl font-bold mt-1">{isLoading ? "..." : `PKR ${(totalValue / 1000).toFixed(1)}K`}</h3>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg">{category.name}</h4>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Items:</span>
                        <span className="font-semibold">{category.items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Value:</span>
                        <span className="font-semibold text-primary">PKR {(category.value / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Item ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold">Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{item.item_id}</td>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                        <td className="py-3 px-4 font-semibold">{item.stock}</td>
                        <td className="py-3 px-4 font-semibold text-primary">PKR {item.price.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setDeletingItemId(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <EditItemDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onUpdate={updateItem}
        />

        <AlertDialog open={!!deletingItemId} onOpenChange={(open) => !open && setDeletingItemId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the inventory item.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingItemId) {
                    deleteItem(deletingItemId);
                    setDeletingItemId(null);
                  }
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Inventory;
