import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, Trash2, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInventoryItems, InventoryItem } from "@/hooks/useInventoryItems";
import { AddItemDialog } from "@/components/AddItemDialog";
import { EditItemDialog } from "@/components/EditItemDialog";
import { formatCurrencyK } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import {
  useTotalValue,
  useLowStockItems,
  useItemsByCategory
} from "@/utils/inventory";
import { DataLoadingBoundary } from "@/components/ErrorBoundary";
import { Checkbox } from "@/components/ui/checkbox";
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

const Inventory = () => {
  const { items, isLoading, deleteItem, createItem, updateItem } = useInventoryItems();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Bulk operations state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Bulk operations functions
  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedItems.map(item => item.id)));
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    selectedItems.forEach(itemId => {
      deleteItem(itemId);
    });
    setSelectedItems(new Set());
    setBulkDeleteDialogOpen(false);
  };

  // Table sorting state
  const [sortField, setSortField] = useState<keyof InventoryItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sorting function
  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Use memoized calculations (must come first as it's used in filtering)
  const totalValue = useTotalValue(items);
  const lowStockItems = useLowStockItems(items);
  const itemsByCategory = useItemsByCategory(items);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

      // Filter by stock status
      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = item.stock <= (item.min_stock_level || 10) && item.stock > 0;
      } else if (stockFilter === "out") {
        matchesStock = item.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, searchTerm, categoryFilter, stockFilter]);

  // Apply sorting to filtered items
  const sortedItems = useMemo(() => {
    if (!sortField) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        // Convert to string for comparison
        comparison = String(aValue).localeCompare(String(bValue), undefined, { sensitivity: 'base' });
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedItems.slice(start, end);
  }, [sortedItems, currentPage, pageSize]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(items.map(item => item.category));
    return Array.from(uniqueCategories).sort();
  }, [items]);

  const handleDeleteClick = (item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getStatusBadge = (stock: number, minStockLevel?: number) => {
    const minLevel = minStockLevel || 10;
    if (stock === 0) {
      return <Badge className="bg-red-500 text-white">Out of Stock</Badge>;
    } else if (stock <= minLevel) {
      return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">In Stock</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Package className="h-8 w-8 animate-spin" />
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your products and inventory levels
          </p>
        </div>
        <AddItemDialog onAdd={(itemData) => createItem(itemData)} />
      </div>

      {/* Filters and Search */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search items"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-32" aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-32" aria-label="Filter by stock status">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-full sm:w-24" aria-label="Rows per page">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Products in inventory</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyK(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Inventory worth</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Items need reordering</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemsByCategory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Product categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-hidden">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b bg-muted/50">
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 w-[100px]"
                    onClick={() => handleSort("item_id")}
                    title="Click to sort by Item ID"
                  >
                    <div className="flex items-center gap-1">
                      Item ID
                      {sortField === "item_id" && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("name")}
                    title="Click to sort by Name"
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === "name" && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 hidden md:table-cell"
                    onClick={() => handleSort("category")}
                    title="Click to sort by Category"
                  >
                    <div className="flex items-center gap-1">
                      Category
                      {sortField === "category" && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 text-right"
                    onClick={() => handleSort("price")}
                    title="Click to sort by Price"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Price
                      {sortField === "price" && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 text-right"
                    onClick={() => handleSort("stock")}
                    title="Click to sort by Stock"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Stock
                      {sortField === "stock" && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">
                    Status
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Search className="mx-auto h-12 w-12 opacity-50 mb-2" />
                      No items found matching your criteria
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{item.item_id}</td>
                      <td className="p-4 align-middle">{item.name}</td>
                      <td className="p-4 align-middle hidden md:table-cell">{item.category}</td>
                      <td className="p-4 align-middle text-right font-medium">
                        {formatCurrencyK(item.price)}
                      </td>
                      <td className="p-4 align-middle text-right font-medium">
                        {item.stock}
                      </td>
                      <td className="p-4 align-middle hidden sm:table-cell">
                        {getStatusBadge(item.stock, item.min_stock_level)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingItem(item)}
                            aria-label={`Edit item ${item.name}`}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            aria-label={`Delete item ${item.name}`}
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredItems.length)} to{" "}
                {Math.min(currentPage * pageSize, filteredItems.length)} of{" "}
                {filteredItems.length} results
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
              This action cannot be undone. This will permanently delete the item{" "}
              <span className="font-bold">{itemToDelete?.name}</span> and remove all associated data.
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

      {/* Edit Item Dialog */}
      {editingItem && (
        <EditItemDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => {
            if (!open) setEditingItem(null);
          }}
          onUpdate={(data) => updateItem(data)}
        />
      )}
    </div>
  );
};

export default Inventory;
