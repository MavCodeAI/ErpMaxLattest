import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSales } from "@/hooks/useSales";
import { usePurchase } from "@/hooks/usePurchase";
import { useAccounting } from "@/hooks/useAccounting";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";

const Reports = () => {
  const { invoices } = useSales();
  const { orders } = usePurchase();
  const { transactions } = useAccounting();
  const { items } = useInventoryItems();
  const { toast } = useToast();

  const salesTotal = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const purchaseTotal = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const income = transactions.filter(t => t.type === "Income").reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + Number(t.amount), 0);
  const inventoryValue = items.reduce((sum, item) => sum + (item.stock * Number(item.price)), 0);

  // Utility function to convert data to CSV
  const convertToCSV = (data: Record<string, unknown>[], headers: string[]) => {
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header.toLowerCase().replace(' ', '_')] || '';
        // Escape quotes and commas in values
        return JSON.stringify(value).slice(1, -1);
      });
      csv += values.join(',') + '\n';
    });
    return csv;
  };

  // Utility function to download CSV
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = (reportName: string) => {
    let csvData = '';
    let filename = '';

    switch (reportName) {
      case 'Sales Report':
        csvData = convertToCSV(
          invoices.map(inv => ({
            Invoice_ID: inv.invoice_id,
            Customer: inv.customer_name,
            Email: inv.customer_email || '',
            Phone: inv.customer_phone || '',
            Date: new Date(inv.date).toLocaleDateString(),
            Amount: formatCurrency(inv.total_amount),
            Status: inv.status,
            Payment_Status: inv.payment_status
          })),
          ['Invoice ID', 'Customer', 'Email', 'Phone', 'Date', 'Amount', 'Status', 'Payment Status']
        );
        filename = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'Purchase Report':
        csvData = convertToCSV(
          orders.map(order => ({
            Order_ID: order.order_id,
            Supplier: order.supplier_name,
            Date: new Date(order.date).toLocaleDateString(),
            Amount: formatCurrency(order.total_amount),
            Status: order.status
          })),
          ['Order ID', 'Supplier', 'Date', 'Amount', 'Status']
        );
        filename = `purchase_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'Financial Report':
        csvData = convertToCSV(
          transactions.map(trx => ({
            Transaction_ID: trx.transaction_id,
            Type: trx.type,
            Category: trx.category,
            Description: trx.description || '',
            Amount: formatCurrency(trx.amount),
            Date: new Date(trx.date).toLocaleDateString()
          })),
          ['Transaction ID', 'Type', 'Category', 'Description', 'Amount', 'Date']
        );
        filename = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'Inventory Report':
        csvData = convertToCSV(
          items.map(item => ({
            Item_ID: item.item_id,
            Name: item.name,
            Category: item.category,
            Stock: item.stock,
            Price: formatCurrency(item.price),
            Cost_Price: formatCurrency(item.cost_price || 0),
            Min_Stock_Level: item.min_stock_level || '',
            Status: item.status
          })),
          ['Item ID', 'Name', 'Category', 'Stock', 'Price', 'Cost Price', 'Min Stock Level', 'Status']
        );
        filename = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        break;
    }

    if (csvData && filename) {
      downloadCSV(csvData, filename);
      toast({
        title: "Download Completed",
        description: `${reportName} has been downloaded successfully.`,
      });
    }
  };

  const reports = [
    {
      title: "Sales Report",
      description: "Complete overview of all sales activities",
      value: `Rs ${salesTotal.toLocaleString()}`,
      records: invoices.length,
    },
    {
      title: "Purchase Report",
      description: "Summary of all purchase orders",
      value: `Rs ${purchaseTotal.toLocaleString()}`,
      records: orders.length,
    },
    {
      title: "Financial Report",
      description: "Income and expense analysis",
      value: `Rs ${(income - expenses).toLocaleString()}`,
      records: transactions.length,
    },
    {
      title: "Inventory Report",
      description: "Current stock and inventory value",
      value: `Rs ${inventoryValue.toLocaleString()}`,
      records: items.length,
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate and download reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-muted/50">
              <CardTitle className="text-lg font-medium">{report.title}</CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{report.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{report.records} records</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleDownload(report.title)}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-lg hover:border-primary/50 transition-colors">
            <span className="font-medium">Total Sales Revenue</span>
            <span className="text-lg font-bold text-green-500">Rs {salesTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg hover:border-primary/50 transition-colors">
            <span className="font-medium">Purchase Expenses</span>
            <span className="text-lg font-bold text-red-500">Rs {purchaseTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg hover:border-primary/50 transition-colors">
            <span className="font-medium">Other Income</span>
            <span className="text-lg font-bold text-green-500">Rs {income.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg hover:border-primary/50 transition-colors">
            <span className="font-medium">Operating Expenses</span>
            <span className="text-lg font-bold text-red-500">Rs {expenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
            <span className="font-bold text-lg">Net Profit</span>
            <span className="text-2xl font-bold text-primary">
              Rs {(salesTotal + income - purchaseTotal - expenses).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
