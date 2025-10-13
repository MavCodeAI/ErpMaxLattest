import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users, Moon, Sun } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { useHR } from "@/hooks/useHR";
import { useAccounting } from "@/hooks/useAccounting";
import { formatCurrency } from "@/utils/currency";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { invoices } = useSales();
  const { items } = useInventoryItems();
  const { employees } = useHR();
  const { transactions } = useAccounting();
  const { settings, updateSettings } = useSettings();

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalSales = invoices.length;
  const inventoryItems = items.length;
  const activeEmployees = employees.filter(emp => emp.status === "Active").length;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateSettings({ dark_mode: !settings?.dark_mode })}
          className="transition-all hover:scale-105"
        >
          {settings?.dark_mode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No invoices yet</p>
              ) : (
                invoices.slice(0, 4).map((invoice) => (
                  <div key={invoice.id} className="flex items-start gap-4 pb-4 border-b last:border-0 hover:bg-muted/30 p-3 rounded-lg transition-colors">
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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No items yet</p>
              ) : (
                items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
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
  );
};

export default Dashboard;
