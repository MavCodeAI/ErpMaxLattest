// Enhanced Modular Audit Log Viewer
// Uses the smaller, reusable components for better maintainability

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { History, RefreshCw } from 'lucide-react';
import { useAudit } from '@/lib/audit';
import { usePermissions } from '@/lib/permissions';
import { AuditLog } from '@/types/database';
import { useLoading } from '@/hooks/useLoading';
import { AuditLogSkeleton } from '@/components/ui/skeleton-loaders';
import {
  AuditFilters as AuditFiltersType,
  AuditFilters,
  AuditLogEntry,
  AuditLogDetails,
  AuditExportActions
} from '@/components/audit/AuditLogComponents';

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  isLoading = false 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Main component
export const AuditLogViewerEnhanced: React.FC = () => {
  const { canRead } = usePermissions();
  const { getAuditLogs, generateAuditReport } = useAudit();
  const { isLoading, setLoading } = useLoading();
  
  const [filters, setFilters] = useState<AuditFiltersType>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const pageSize = 20;

  // Check permissions
  if (!canRead('AuditLog')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to view audit logs.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data - replace with actual API call
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      userId: 'admin@company.com',
      action: 'Create',
      entityType: 'Customer',
      entityId: 'cust_001',
      description: 'Created new customer record',
      ipAddress: '192.168.1.100',
      changes: {
        name: { oldValue: null, newValue: 'Acme Corp' },
        email: { oldValue: null, newValue: 'contact@acme.com' }
      },
      metadata: { module: 'CRM', version: '2.1.0' }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'sales@company.com',
      action: 'Update',
      entityType: 'SalesInvoice',
      entityId: 'inv_001',
      description: 'Updated invoice status',
      ipAddress: '192.168.1.101',
      changes: {
        status: { oldValue: 'Draft', newValue: 'Sent' }
      }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      userId: 'warehouse@company.com',
      action: 'Create',
      entityType: 'InventoryItem',
      entityId: 'item_001',
      description: 'Added new inventory item',
      ipAddress: '192.168.1.102'
    }
  ];

  // Filter logs based on current filters
  const filteredLogs = useMemo(() => {
    let logs = [...mockAuditLogs];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      logs = logs.filter(log => 
        log.description.toLowerCase().includes(term) ||
        log.userId.toLowerCase().includes(term) ||
        log.entityType.toLowerCase().includes(term)
      );
    }

    if (filters.userId) {
      logs = logs.filter(log => log.userId.includes(filters.userId!));
    }

    if (filters.entityType) {
      logs = logs.filter(log => log.entityType === filters.entityType);
    }

    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      logs = logs.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      logs = logs.filter(log => new Date(log.timestamp) <= toDate);
    }

    return logs;
  }, [filters, mockAuditLogs]);

  // Paginate logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  // Handle filter changes
  const handleFiltersChange = (newFilters: AuditFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLoading('audit-refresh', true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app: refetch data
    } finally {
      setLoading('audit-refresh', false);
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    setIsExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app: generate and download file
      const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      console.log(`Exporting as ${format}: ${filename}`);
      
      // Show success message
      alert(`Audit logs exported as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History size={24} />
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">
              Track and monitor all system activities
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading('audit-refresh')}
        >
          <RefreshCw 
            size={16} 
            className={isLoading('audit-refresh') ? 'animate-spin mr-2' : 'mr-2'} 
          />
          Refresh
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <AuditFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            isLoading={isLoading('audit-refresh')}
          />
          
          <AuditExportActions
            onExport={handleExport}
            isExporting={isExporting}
            totalLogs={filteredLogs.length}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Audit Entries ({filteredLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading('audit-refresh') ? (
                <AuditLogSkeleton />
              ) : paginatedLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No audit logs found matching your criteria.
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedLogs.map((log) => (
                    <AuditLogEntry
                      key={log.id}
                      log={log}
                      onSelect={setSelectedLog}
                      isSelected={selectedLog?.id === log.id}
                    />
                  ))}
                </div>
              )}
              
              {filteredLogs.length > pageSize && (
                <>
                  <Separator className="my-4" />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    isLoading={isLoading('audit-refresh')}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedLog ? (
            <AuditLogDetails
              log={selectedLog}
              onClose={() => setSelectedLog(null)}
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  Select an audit log entry to view details
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewerEnhanced;