import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  title?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showingInfo: string;
  };
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
  };
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  children,
  isLoading = false,
  error = null,
  onRetry,
  pagination,
  emptyState,
  className,
}) => {
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error loading data</h3>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        {title && (
          <CardHeader className="border-b bg-muted/50">
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground mt-2">Loading data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className || ''}`}>
      {title && (
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`pt-6 ${!title ? 'pt-6' : ''}`}>
        <div className="rounded-md border overflow-hidden">
          <Table>
            {children}
          </Table>
        </div>

        {/* Empty State */}
        {emptyState && React.Children.count(children) <= 1 && (
          <div className="text-center py-12">
            {emptyState.icon}
            <h3 className="text-lg font-medium mt-2">{emptyState.title}</h3>
            {emptyState.description && (
              <p className="text-muted-foreground text-sm mt-1">{emptyState.description}</p>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {pagination.showingInfo}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Previous</span>
              </Button>

              <div className="flex items-center px-3">
                <span className="text-sm font-medium">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
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
  );
};
