import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSales } from "@/hooks/useSales";
import { AddInvoiceDialog } from "@/components/AddInvoiceDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Sales = () => {
  const { invoices, customers, isLoading, createInvoice } = useSales();

  const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const pendingCount = invoices.filter(inv => inv.status === "Pending").length;

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sales Management</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Manage invoices, quotations, and customers</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Users className="w-4 h-4" />
              Customers ({customers.length})
            </Button>
            <AddInvoiceDialog onAdd={createInvoice} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <h3 className="text-2xl font-bold mt-1">Rs {totalSales.toLocaleString()}</h3>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <h3 className="text-2xl font-bold mt-1">{invoices.length}</h3>
                </div>
                <TrendingUp className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invoices</p>
                  <h3 className="text-2xl font-bold mt-1">{pendingCount}</h3>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
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
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No invoices yet. Create your first invoice!
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_id}</TableCell>
                        <TableCell>{invoice.customer_name}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>Rs {Number(invoice.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === "Paid" ? "default" : "secondary"}>
                            {invoice.status}
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

export default Sales;
