import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Search, Trash2, Edit, Eye, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSales } from "@/hooks/useSales";
import { AddInvoiceDialog } from "@/components/AddInvoiceDialog";
import { formatCurrency } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccessibleButton } from "@/components/ui/accessible-button";
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
import { PageLayout, CardGrid, ResponsiveTable, LoadingState, EnhancedStatCard, FormSection } from "@/components/ui/patterns";

const Sales = () => {
  const { invoices, customers, customersLoading, isLoading, deleteInvoice, createInvoice } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Debounce search term to reduce expensive computations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Page reset when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  // Optimized filtering with debounced search
  const processedInvoices = useMemo(() => {
    if (!invoices.length) return invoices;

    let result = invoices.filter(invoice => {
      const matchesSearch = debouncedSearchTerm === "" ||
        invoice.invoice_id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      const today = new Date();
      const invoiceDate = new Date(invoice.date);
      let matchesDate = true;

      if (dateFilter === "today") {
        matchesDate = invoiceDate.toDateString() === today.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = today.getTime() - (7 * 24 * 60 * 60 * 1000);
        matchesDate = invoiceDate.getTime() >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = invoiceDate >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort the filtered results
    result = [...result].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, debouncedSearchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedInvoices.length / pageSize);
  const paginatedInvoices = processedInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate stats inline (simple and efficient)
  const totalRevenue = processedInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const paidCount = processedInvoices.filter(inv => inv.status === "Paid").length;
  const pendingCount = processedInvoices.filter(inv => inv.status === "Pending").length;
  const overdueCount = processedInvoices.filter(inv => inv.status === "Overdue").length;

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-500 text-white hover:bg-green-600">Paid</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>;
      case "Overdue":
        return <Badge className="bg-red-500 text-white hover:bg-red-600">Overdue</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white hover:bg-gray-600">{status}</Badge>;
    }
  };

  const SortIcon = ({ field }) => {
    if (field !== sortField) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ?
      <ArrowUp className="ml-2 h-4 w-4" /> :
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  // Enhanced stats for use with design system
  const enhancedStats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      change: undefined,
      trend: "up" as const,
      icon: TrendingUp,
      color: "primary" as const,
    },
    {
      title: "Paid Invoices",
      value: paidCount.toString(),
      change: undefined,
      trend: "up" as const,
      icon: Users,
      color: "success" as const,
    },
    {
      title: "Pending",
      value: pendingCount.toString(),
      change: undefined,
      trend: "up" as const,
      icon: AlertTriangle,
      color: "warning" as const,
    },
    {
      title: "Overdue",
      value: overdueCount.toString(),
      change: undefined,
      trend: "down" as const,
      icon: AlertTriangle,
      color: "destructive" as const,
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading sales data..." />;
  }

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold">Sales</h1>
          <p className="text-muted-foreground mt-1">Manage invoices and customer transactions.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-72">
            {/* Search component would go here */}
          </div>
          <AddInvoiceDialog
            onAdd={createInvoice}
            customers={customers}
            customersLoading={customersLoading}
          />
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <CardGrid columns="4">
        {enhancedStats.map((stat, index) => (
          <EnhancedStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </CardGrid>

      {/* Compact Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-3">
        <input
          className="h-9 flex-1 min-w-[200px] rounded-md border px-3"
          placeholder="Search invoices or customers…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 rounded-md border px-2">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="h-9 rounded-md border px-2">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>Sales Invoices</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
              <tr className="border-b">
                <th className="py-2.5 px-3 text-left">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("invoice_id")}
                    className="px-0 font-bold h-auto"
                    aria-label={`Sort by invoice ID ${sortField === "invoice_id" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                  >
                    Invoice ID
                    <SortIcon field="invoice_id" />
                  </Button>
                </th>
                <th className="py-2.5 px-3 text-left">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("customer_name")}
                    className="px-0 font-bold h-auto"
                    aria-label={`Sort by customer name ${sortField === "customer_name" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                  >
                    Customer
                    <SortIcon field="customer_name" />
                  </Button>
                </th>
                <th className="py-2.5 px-3 text-left hidden md:table-cell">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("date")}
                    className="px-0 font-bold h-auto"
                    aria-label={`Sort by date ${sortField === "date" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                  >
                    Date
                    <SortIcon field="date" />
                  </Button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("total_amount")}
                    className="px-0 font-bold h-auto"
                    aria-label={`Sort by amount ${sortField === "total_amount" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                  >
                    Amount
                    <SortIcon field="total_amount" />
                  </Button>
                </th>
                <th className="py-2.5 px-3 text-left hidden sm:table-cell">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="px-0 font-bold h-auto"
                    aria-label={`Sort by status ${sortField === "status" ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending"}`}
                  >
                    Status
                    <SortIcon field="status" />
                  </Button>
                </th>
                <th className="py-2.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-muted/30">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Search className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    No invoices found matching your criteria
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/50 border-b">
                    <td className="py-2.5 px-3 font-medium">{invoice.invoice_id}</td>
                    <td className="py-2.5 px-3">{invoice.customer_name}</td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {formatCurrency(Number(invoice.total_amount))}
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" aria-label={`View invoice ${invoice.invoice_id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" aria-label={`Edit invoice ${invoice.invoice_id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(invoice)}
                          aria-label={`Delete invoice ${invoice.invoice_id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * pageSize + 1, processedInvoices.length)} to{" "}
                {Math.min(currentPage * pageSize, processedInvoices.length)} of{" "}
                {processedInvoices.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Previous</span>
                </Button>

                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline mr-2">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice{" "}
              <span className="font-bold">{invoiceToDelete?.invoice_id}</span> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel aria-label="Cancel deletion">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              aria-label="Confirm deletion"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Sales;
