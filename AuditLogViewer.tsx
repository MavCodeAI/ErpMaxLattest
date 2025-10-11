// Audit Log Viewer Component
// Displays audit trails with filtering and search capabilities

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/DataTable';
import { 
  Calendar,
  Download,
  Eye,
  Filter,
  History,
  Search,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useAudit } from '@/lib/audit';
import { usePermissions } from '@/lib/permissions';
import { AuditLog, AuditAction } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface AuditFilters {
  userId?: string;
  entityType?: string;
  action?: AuditAction;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export const AuditLogViewer: React.FC = () => {
  const { canRead } = usePermissions();
  const { getAuditLogs, generateAuditReport } = useAudit();
  
  const [filters, setFilters] = useState<AuditFilters>({});
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Mock data for demonstration - in real app would come from getAuditLogs
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      user_id: 'user1',
      user: { id: 'user1', full_name: 'John Doe', email: 'john@example.com' } as any,
      action: AuditAction.CREATE,
      entity_type: 'sales_invoice',
      entity_id: 'inv-001',
      description: 'Created sales invoice INV-001',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0...'
    },
    {
      id: '2',
      user_id: 'user2',
      user: { id: 'user2', full_name: 'Jane Smith', email: 'jane@example.com' } as any,
      action: AuditAction.UPDATE,
      entity_type: 'inventory_item',
      entity_id: 'item-123',
      description: 'Updated inventory item stock',
      old_values: { current_stock: 100 },
      new_values: { current_stock: 95 },
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      ip_address: '192.168.1.101'
    },
    {
      id: '3',
      user_id: 'user1',
      user: { id: 'user1', full_name: 'John Doe', email: 'john@example.com' } as any,
      action: AuditAction.DELETE,
      entity_type: 'customer',
      entity_id: 'cust-456',
      description: 'Deleted customer record',
      old_values: { name: 'Old Customer', email: 'old@customer.com' },
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      ip_address: '192.168.1.100'
    }
  ];

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      if (filters.userId && log.user_id !== filters.userId) return false;
      if (filters.entityType && log.entity_type !== filters.entityType) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchText = `${log.description} ${log.entity_type} ${log.entity_id} ${log.user?.full_name}`.toLowerCase();
        if (!searchText.includes(searchLower)) return false;
      }
      return true;
    });
  }, [mockAuditLogs, filters]);

  const handleExport = async () => {
    if (!canRead('audit')) return;
    
    setIsExporting(true);
    try {
      const report = await generateAuditReport({
        dateFrom: filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo: filters.dateTo || new Date().toISOString(),
        actions: filters.action ? [filters.action] : undefined,
        userId: filters.userId,
        format: 'csv'
      });
      
      // Create download
      const blob = new Blob([report], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case AuditAction.UPDATE:
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case AuditAction.DELETE:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case AuditAction.LOGIN:
        return <User className="h-4 w-4 text-purple-500" />;
      case AuditAction.LOGOUT:
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: AuditAction): string => {
    switch (action) {
      case AuditAction.CREATE:
        return 'bg-green-100 text-green-800';
      case AuditAction.UPDATE:
        return 'bg-blue-100 text-blue-800';
      case AuditAction.DELETE:
        return 'bg-red-100 text-red-800';
      case AuditAction.LOGIN:
        return 'bg-purple-100 text-purple-800';
      case AuditAction.LOGOUT:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      accessorKey: 'created_at',
      header: 'Timestamp',
      cell: ({ row }: any) => (
        <div className="text-sm">
          <div>{new Date(row.getValue('created_at')).toLocaleString()}</div>
          <div className="text-muted-foreground">
            {formatDistanceToNow(new Date(row.getValue('created_at')), { addSuffix: true })}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }: any) => {
        const user = row.getValue('user');
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{user?.full_name || 'System'}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }: any) => {
        const action = row.getValue('action');
        return (
          <div className="flex items-center gap-2">
            {getActionIcon(action)}
            <Badge variant="secondary" className={getActionColor(action)}>
              {action.toUpperCase()}
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: 'entity_type',
      header: 'Entity',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('entity_type')}</div>
          <div className="text-sm text-muted-foreground">{row.original.entity_id}</div>
        </div>
      )
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-[300px] truncate" title={row.getValue('description')}>
          {row.getValue('description')}
        </div>
      )
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
      cell: ({ row }: any) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.getValue('ip_address') || 'N/A'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedLog(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  if (!canRead('audit')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view audit logs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground">
            Track all user actions and system changes
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  className="pl-10"
                  value={filters.searchTerm || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  action: value === 'all' ? undefined : value as AuditAction
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value={AuditAction.CREATE}>Create</SelectItem>
                  <SelectItem value={AuditAction.UPDATE}>Update</SelectItem>
                  <SelectItem value={AuditAction.DELETE}>Delete</SelectItem>
                  <SelectItem value={AuditAction.LOGIN}>Login</SelectItem>
                  <SelectItem value={AuditAction.LOGOUT}>Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select
                value={filters.entityType || 'all'}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  entityType: value === 'all' ? undefined : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales_invoice">Sales Invoice</SelectItem>
                  <SelectItem value="inventory_item">Inventory Item</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Trail</CardTitle>
            <Badge variant="outline">
              {filteredLogs.length} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredLogs}
            searchKey="description"
            showPagination={true}
            showColumnToggle={true}
          />
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

const AuditLogDetailModal: React.FC<{
  log: AuditLog;
  onClose: () => void;
}> = ({ log, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Log Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Timestamp</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">User</Label>
              <p className="text-sm text-muted-foreground">
                {log.user?.full_name || 'System'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Action</Label>
              <Badge variant="secondary" className="text-xs">
                {log.action.toUpperCase()}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Entity</Label>
              <p className="text-sm text-muted-foreground">
                {log.entity_type} ({log.entity_id})
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {log.description}
            </p>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">IP Address</Label>
              <p className="text-sm text-muted-foreground font-mono">
                {log.ip_address || 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">User Agent</Label>
              <p className="text-sm text-muted-foreground truncate" title={log.user_agent}>
                {log.user_agent ? log.user_agent.substring(0, 50) + '...' : 'N/A'}
              </p>
            </div>
          </div>

          {/* Changes */}
          {(log.old_values || log.new_values) && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-medium">Changes</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.old_values && (
                    <div>
                      <Label className="text-xs text-red-600">Old Values</Label>
                      <pre className="text-xs bg-red-50 p-2 rounded border overflow-auto">
                        {JSON.stringify(log.old_values, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.new_values && (
                    <div>
                      <Label className="text-xs text-green-600">New Values</Label>
                      <pre className="text-xs bg-green-50 p-2 rounded border overflow-auto">
                        {JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogViewer;