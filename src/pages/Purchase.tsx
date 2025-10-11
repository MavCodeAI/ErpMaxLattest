import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, TrendingDown, Search } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { usePurchase } from "@/hooks/usePurchase";
import { AddPurchaseOrderDialog } from "@/components/AddPurchaseOrderDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatCurrency } from "@/utils/currency";
import { Input } from "@/components/ui/input";
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
  const [searchTerm, setSearchTerm] = useState("");

  const totalPurchases = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const pendingCount = orders.filter(order => order.status === "Pending").length;

  const filteredOrders = orders.filter(order =>
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <StatCard
            title="Total Purchases"
            value={formatCurrency(totalPurchases)}
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

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Recent Purchase Orders</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
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
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No orders match your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>{order.supplier_name}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(Number(order.total_amount))}</TableCell>
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
