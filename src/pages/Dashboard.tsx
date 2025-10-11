import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { useHR } from "@/hooks/useHR";
import { useAccounting } from "@/hooks/useAccounting";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatCurrency } from "@/utils/currency";

const Dashboard = () => {
  const { invoices } = useSales();
  const { items } = useInventoryItems();
  const { employees } = useHR();
  const { transactions } = useAccounting();

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalSales = invoices.length;
  const inventoryItems = items.length;
  const activeEmployees = employees.filter(emp => emp.status === "Active").length;

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        <Breadcrumbs />
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Total Sales"
            value={totalSales.toString()}
            icon={ShoppingCart}
            trend="up"
          />
          <StatCard
            title="Inventory Items"
            value={inventoryItems.toString()}
            icon={Package}
            trend="up"
          />
          <StatCard
            title="Active Employees"
            value={activeEmployees.toString()}
            icon={Users}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No invoices yet</p>
                ) : (
                  invoices.slice(0, 4).map((invoice) => (
                    <div key={invoice.id} className="flex items-start gap-4 pb-4 border-b last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="font-medium">Invoice {invoice.invoice_id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.customer_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(Number(invoice.total_amount))}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No items yet</p>
                ) : (
                  items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-all hover:scale-[1.02]"
                    >
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                        {item.stock}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
