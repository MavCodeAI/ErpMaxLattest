import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Filter, Download, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useKeyboardNavigation, announceToScreenReader, getAriaAttributes } from "@/utils/accessibility";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  onExport?: (format: 'csv' | 'pdf') => void;
  bulkActions?: Array<{
    label: string;
    action: (selectedRows: TData[]) => void;
    icon?: React.ReactNode;
  }>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  exportable = true,
  onExport,
  bulkActions = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  
  const tableRef = React.useRef<HTMLDivElement>(null);
  useKeyboardNavigation(tableRef);

  // Add row selection column if bulk actions are available
  const columnsWithSelection = React.useMemo(() => {
    if (bulkActions.length === 0) return columns;
    
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
              announceToScreenReader(
                value ? "All rows selected" : "All rows deselected"
              );
            }}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              announceToScreenReader(
                value ? "Row selected" : "Row deselected"
              );
            }}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }, [columns, bulkActions.length]);

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);

  const handleSort = (columnId: string, sortDirection: 'asc' | 'desc' | false) => {
    const sortText = sortDirection === 'asc' ? 'ascending' : 
                     sortDirection === 'desc' ? 'descending' : 'unsorted';
    announceToScreenReader(`Column sorted ${sortText}`);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    announceToScreenReader(`Exporting data as ${format.toUpperCase()}`);
    onExport?.(format);
  };

  const handleBulkAction = (action: (selectedRows: TData[]) => void, label: string) => {
    action(selectedRows);
    announceToScreenReader(`${label} applied to ${selectedRows.length} selected items`);
    setRowSelection({});
  };

  return (
    <div className="w-full space-y-4" ref={tableRef}>
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {searchable && (
            <div className="relative">
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-sm"
                aria-label="Search table data"
              />
              <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          
          {/* Bulk Actions */}
          {bulkActions.length > 0 && selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    ariaLabel="Bulk actions menu"
                    ariaHasPopup={true}
                    ariaExpanded={false}
                  >
                    Actions
                    <MoreHorizontal className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" role="menu">
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {bulkActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleBulkAction(action.action, action.label)}
                      role="menuitem"
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Options */}
          {exportable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  ariaLabel="Export data options"
                  ariaHasPopup={true}
                >
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" role="menu">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv')} role="menuitem">
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} role="menuitem">
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                ariaLabel="Toggle column visibility"
                ariaHasPopup={true}
              >
                Columns
                <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]" role="menu">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => {
                        column.toggleVisibility(!!value);
                        announceToScreenReader(
                          `Column ${column.id} ${value ? 'shown' : 'hidden'}`
                        );
                      }}
                      role="menuitemcheckbox"
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table role="table" aria-label="Data table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} role="row">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  
                  return (
                    <TableHead 
                      key={header.id}
                      role="columnheader"
                      {...(canSort && {
                        "aria-sort": sortDirection === "asc" ? "ascending" : 
                                   sortDirection === "desc" ? "descending" : "none"
                      })}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={canSort ? "flex items-center space-x-2 cursor-pointer select-none hover:bg-accent rounded-sm p-1 -m-1" : ""}
                          onClick={() => {
                            if (canSort) {
                              header.column.toggleSorting();
                              handleSort(header.id, header.column.getIsSorted());
                            }
                          }}
                          onKeyDown={(e) => {
                            if (canSort && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              header.column.toggleSorting();
                              handleSort(header.id, header.column.getIsSorted());
                            }
                          }}
                          tabIndex={canSort ? 0 : -1}
                          role={canSort ? "button" : undefined}
                          aria-label={canSort ? `Sort by ${header.id}` : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="ml-2" aria-hidden="true">
                              {sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : sortDirection === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody role="rowgroup">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  role="row"
                  aria-selected={row.getIsSelected()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} role="cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow role="row">
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center"
                  role="cell"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-muted-foreground">No results found.</div>
                    {globalFilter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGlobalFilter("")}
                        ariaLabel="Clear search filter"
                      >
                        Clear filter
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <select
            className="h-8 w-[70px] rounded border border-input bg-background px-2 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
              announceToScreenReader(`Page size changed to ${e.target.value} rows`);
            }}
            aria-label="Select page size"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            ariaLabel="Go to previous page"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            ariaLabel="Go to next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}