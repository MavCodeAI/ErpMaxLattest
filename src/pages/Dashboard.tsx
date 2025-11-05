import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { useHR } from "@/hooks/useHR";
import { useAccounting } from "@/hooks/useAccounting";
import { formatCurrency } from "@/utils/currency";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { invoices } = useSales();
  const { items } = useInventoryItems();
  const { employees } = useHR();
  const { transactions } = useAccounting();

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalSales = invoices.length;
  const inventoryItems = items.length;
  const activeEmployees = employees.filter(emp => emp.status === "Active").length;
  
  // Calculate profitability metrics
  const totalCost = items.reduce((sum, item) => sum + (Number(item.cost_price || 0) * item.stock), 0);
  const totalInventoryValue = items.reduce((sum, item) => sum + (Number(item.price || 0) * item.stock), 0);
  const grossProfit = totalRevenue - totalCost;
  const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  // Low stock items
  const lowStockItems = items.filter(item => item.stock <= (item.min_stock_level || 10));
  
  // Accounts receivable/payable
  const accountsReceivable = invoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const accountsPayable = transactions.filter(t => t.type === 'Expense' && t.category === 'Suppliers').reduce((sum, t) => sum + Number(t.amount), 0);
  
  // Sales trend data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  
  const salesTrendData = last7Days.map(date => {
    const dailySales = invoices.filter(inv => inv.date === date).reduce((sum, inv) => sum + Number(inv.total_amount), 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      sales: dailySales,
    };
  });

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={netProfit >= 0 ? TrendingUp : TrendingDown}
          trend={netProfit >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Gross Profit"
          value={formatCurrency(grossProfit)}
          icon={grossProfit >= 0 ? TrendingUp : TrendingDown}
          trend={grossProfit >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={DollarSign}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Receivable</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(accountsReceivable)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending customer payments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Payable</CardTitle>
            <TrendingDown className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(accountsPayable)}</div>
            <p className="text-xs text-muted-foreground mt-1">Due to suppliers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Items need reordering</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total stock worth</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          <CardDescription>Daily sales performance overview</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
