import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useCRM } from "@/hooks/useCRM";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import AddOrderDialog from "./AddOrderDialog";
import EditOrderDialog from "./EditOrderDialog";

const CRMOrders = () => {
  const { orders, loadingOrders, deleteOrder } = useCRM();
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const filteredOrders = orders?.filter(order =>
    order.order_id.toLowerCase().includes(search.toLowerCase()) ||
    (order as any).crm_customers?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrder.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      delivered: "default",
      in_progress: "secondary",
      pending: "outline",
      cancelled: "destructive",
    };
    return variants[status] || "outline";
  };

  if (loadingOrders) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-5 w-5 text-primary" />
              Order Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {orders?.length || 0} orders · {orders?.filter(o => o.status === 'pending').length || 0} pending
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="hover-scale">
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer name..."
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
                <TableHead className="font-semibold">Order ID</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order: any) => (
                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm font-medium">{order.order_id}</TableCell>
                  <TableCell className="font-semibold">{order.crm_customers?.name}</TableCell>
                  <TableCell className="text-sm">{format(new Date(order.order_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(order.status)} className="font-medium">
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingOrder(order)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredOrders || filteredOrders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground font-medium">No orders found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {search ? "Try a different search term" : "Add your first order to get started"}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AddOrderDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      {editingOrder && (
        <EditOrderDialog
          order={editingOrder}
          open={!!editingOrder}
          onOpenChange={(open) => !open && setEditingOrder(null)}
        />
      )}
    </Card>
  );
};

export default CRMOrders;
