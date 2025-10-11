import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  FileText,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Edit,
  Filter,
  X,
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onBulkDelete?: (rows: T[]) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  enableExport?: boolean;
  exportFileName?: string;
  filters?: {
    key: keyof T;
    label: string;
    options: { value: string; label: string }[];
  }[];
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKeys = [],
  onEdit,
  onDelete,
  onBulkDelete,
  isLoading = false,
  emptyMessage = "No data available",
  enableExport = true,
  exportFileName = "export",
  filters = [],
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchKeys.length > 0) {
      filtered = filtered.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((item) => {
          const itemValue = String(item[key as keyof T]).toLowerCase();
          return itemValue === value.toLowerCase();
        });
      }
    });

    return filtered;
  }, [data, searchTerm, searchKeys, activeFilters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    setSortConfig((current) => {
      if (current?.key === column.key) {
        return {
          key: column.key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: column.key, direction: "asc" };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((row) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    
    const rowsToDelete = data.filter((row) => selectedRows.has(row.id));
    if (onBulkDelete) {
      onBulkDelete(rowsToDelete);
      setSelectedRows(new Set());
      toast.success(`${selectedRows.size} items deleted successfully`);
    }
  };

  const exportToCSV = () => {
    const headers = columns.map((col) => col.label).join(",");
    const rows = sortedData.map((row) =>
      columns
        .map((col) => {
          const value = row[col.key];
          // Handle special cases for CSV export
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return String(value);
        })
        .join(",")
    );
    
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported to CSV successfully");
  };

  const exportToPDF = () => {
    // This would integrate with a PDF library like jsPDF
    // For now, we'll show a placeholder
    toast.info("PDF export functionality will be implemented");
  };

  const clearFilter = (filterKey: keyof T) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable) return null;
    
    const isActive = sortConfig?.key === column.key;
    if (!isActive) return <ChevronUp className="w-4 h-4 opacity-50" />;
    
    return sortConfig?.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with search, filters, and actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Filters */}
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {filters.find(f => f.key === key)?.label}: {value}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-auto p-0 w-4 h-4"
                  onClick={() => clearFilter(key as keyof T)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}

          {/* Filters */}
          {filters.map((filter) => (
            <Select
              key={String(filter.key)}
              value={activeFilters[filter.key] || ""}
              onValueChange={(value) => 
                setActiveFilters((prev) => ({ ...prev, [filter.key]: value }))
              }
            >
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Bulk Actions */}
          {selectedRows.size > 0 && onBulkDelete && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedRows.size})
            </Button>
          )}

          {/* Export */}
          {enableExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto mobile-table-container">
          <Table>
            <TableHeader className="hidden md:table-header-group">
              <TableRow>
                {(onBulkDelete || onDelete || onEdit) && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="touch-target"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={`${column.className || ""} ${
                      column.sortable ? "cursor-pointer hover:bg-muted/50 touch-target" : ""
                    }`}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2 min-h-[44px]">
                      {column.label}
                      <SortIcon column={column} />
                    </div>
                  </TableHead>
                ))}
                {(onEdit || onDelete) && <TableHead className="w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className="hover:bg-muted/30 transition-colors border-b md:table-row flex flex-col md:flex-none space-y-2 md:space-y-0 p-4 md:p-0"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      {/* Selection and Actions Row */}
                      <div className="flex items-center justify-between">
                        {(onBulkDelete || onDelete || onEdit) && (
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={(checked) => handleSelectRow(row.id, !!checked)}
                            className="touch-target"
                          />
                        )}
                        {(onEdit || onDelete) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 touch-target">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(row)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem
                                  onClick={() => onDelete(row)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {/* Data Fields */}
                      <div className="space-y-2">
                        {columns.map((column) => (
                          <div key={String(column.key)} className="flex justify-between items-start">
                            <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                              {column.label}:
                            </span>
                            <span className={`text-sm flex-1 text-right ${column.className || ""}`}>
                              {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <>
                      {(onBulkDelete || onDelete || onEdit) && (
                        <TableCell className="hidden md:table-cell">
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={(checked) => handleSelectRow(row.id, !!checked)}
                            className="touch-target"
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={String(column.key)} className={`hidden md:table-cell ${column.className || ""}`}>
                          {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                        </TableCell>
                      ))}
                      {(onEdit || onDelete) && (
                        <TableCell className="hidden md:table-cell">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 touch-target">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(row)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem
                                  onClick={() => onDelete(row)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-20 h-10 touch-target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            of {sortedData.length} entries
          </span>
        </div>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="touch-target min-w-[44px]"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">←</span>
          </Button>
          
          {/* Mobile: Show current page info */}
          <div className="flex items-center gap-1 sm:hidden">
            <span className="text-sm px-3 py-2 bg-muted rounded">
              {currentPage} of {totalPages}
            </span>
          </div>
          
          {/* Desktop: Show page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-10 h-10 p-0 touch-target"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="touch-target min-w-[44px]"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}