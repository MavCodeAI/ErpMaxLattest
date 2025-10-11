import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { usePurchase } from "@/hooks/usePurchase";
import { AddPurchaseOrderDialog } from "@/components/AddPurchaseOrderDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Purchase = () => {
  const { orders, isLoading, createOrder } = usePurchase();

  const totalPurchases = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const pendingCount = orders.filter(order => order.status === "Pending").length;

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <Breadcrumbs />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Purchase</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Manage purchase orders</p>
          </div>
          <AddPurchaseOrderDialog onAdd={createOrder} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Purchases"
            value={`Rs ${totalPurchases.toLocaleString()}`}
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Orders"
            value={orders.length.toString()}
            icon={TrendingDown}
          />
          <StatCard
            title="Pending"
            value={pendingCount.toString()}
            icon={ShoppingCart}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No purchase orders yet. Create your first order!
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>{order.supplier_name}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell>Rs {Number(order.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === "Completed" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Purchase;
