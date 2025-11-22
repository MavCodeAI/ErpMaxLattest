import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, TrendingDown, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { usePurchase } from "@/hooks/usePurchase";
import { AddPurchaseOrderDialog } from "@/components/AddPurchaseOrderDialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ExportButton } from "@/components/ExportButton";
import { formatPurchaseDataForExport } from "@/utils/exportUtils";

interface FilterOptions {
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  minAmount: number | undefined;
  maxAmount: number | undefined;
}

interface OrderData {
  id: string;
  order_id: string;
  supplier_name: string;
  date: string;
  total_amount: string | number;
  status: string;
}

const Purchase = () => {
  const { orders, isLoading, createOrder } = usePurchase();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    minAmount: undefined,
    maxAmount: undefined,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const totalPurchases = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const pendingCount = orders.filter(order => order.status === "Pending").length;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search term filter
      const matchesSearch =
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = filterOptions.status === "all" || order.status === filterOptions.status;

      // Date range filter
      const orderDate = new Date(order.date);
      const matchesDateRange =
        (!filterOptions.dateRange.from || orderDate >= filterOptions.dateRange.from) &&
        (!filterOptions.dateRange.to || orderDate <= filterOptions.dateRange.to);

      // Amount range filter
      const orderAmount = Number(order.total_amount);
      const matchesAmountRange =
        (!filterOptions.minAmount || orderAmount >= filterOptions.minAmount) &&
        (!filterOptions.maxAmount || orderAmount <= filterOptions.maxAmount);

      return matchesSearch && matchesStatus && matchesDateRange && matchesAmountRange;
    });
  }, [orders, searchTerm, filterOptions]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilterOptions({
      status: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  // Export columns configuration
  const exportColumns = [
    { header: 'Order ID', dataKey: 'order_id' },
    { header: 'Supplier Name', dataKey: 'supplier_name' },
    { header: 'Date', dataKey: 'date' },
    { header: 'Total Amount', dataKey: 'total_amount' },
    { header: 'Status', dataKey: 'status' },
  ];

  // Card component for mobile view
  const OrderCard = ({ order }: { order: OrderData }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{order.order_id}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{order.supplier_name}</p>
          </div>
          <Badge variant={order.status === "Completed" ? "default" : "secondary"} className="text-xs">
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="font-medium">{new Date(order.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-bold text-lg">{formatCurrency(Number(order.total_amount))}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Purchase Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage purchase orders
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredOrders as any}
            fileName="purchase-orders"
            sheetName="Orders"
            title="Purchase Orders"
            columns={exportColumns}
            formatDataForExport={formatPurchaseDataForExport as any}
          />
          <AddPurchaseOrderDialog onAdd={createOrder} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalPurchases)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total spent</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Recent Purchase Orders</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filters</h4>
                      <p className="text-sm text-muted-foreground">
                        Refine your purchase order search
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={filterOptions.status}
                          onValueChange={(value) =>
                            setFilterOptions({...filterOptions, status: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !filterOptions.dateRange.from && "text-muted-foreground"
                                )}
                              >
                                {filterOptions.dateRange.from ? (
                                  format(filterOptions.dateRange.from, "PPP")
                                ) : (
                                  <span>Pick from date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={filterOptions.dateRange.from}
                                onSelect={(date) =>
                                  setFilterOptions({
                                    ...filterOptions,
                                    dateRange: {
                                      ...filterOptions.dateRange,
                                      from: date
                                    }
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !filterOptions.dateRange.to && "text-muted-foreground"
                                )}
                              >
                                {filterOptions.dateRange.to ? (
                                  format(filterOptions.dateRange.to, "PPP")
                                ) : (
                                  <span>Pick to date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={filterOptions.dateRange.to}
                                onSelect={(date) =>
                                  setFilterOptions({
                                    ...filterOptions,
                                    dateRange: {
                                      ...filterOptions.dateRange,
                                      to: date
                                    }
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm font-medium">Min Amount</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={filterOptions.minAmount || ""}
                            onChange={(e) =>
                              setFilterOptions({
                                ...filterOptions,
                                minAmount: e.target.value ? Number(e.target.value) : undefined
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Max Amount</label>
                          <Input
                            type="number"
                            placeholder="100000"
                            value={filterOptions.maxAmount || ""}
                            onChange={(e) =>
                              setFilterOptions({
                                ...filterOptions,
                                maxAmount: e.target.value ? Number(e.target.value) : undefined
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={resetFilters}
                          className="flex-1"
                        >
                          Reset
                        </Button>
                        <Button
                          onClick={() => setIsFilterOpen(false)}
                          className="flex-1"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                      <p>No purchase orders yet. Create your first order!</p>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      No orders match your search
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{order.order_id}</TableCell>
                      <TableCell>{order.supplier_name}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(Number(order.total_amount))}</TableCell>
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-lg text-muted-foreground">Loading...</div>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground mb-4">No purchase orders yet. Create your first order!</p>
                </CardContent>
              </Card>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center text-muted-foreground py-12">
                  No orders match your search
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {paginatedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>entries</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredOrders.length)} of {filteredOrders.length} entries
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-8"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchase;
