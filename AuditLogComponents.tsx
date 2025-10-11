// Modular Audit Log Components
// Breaking down the monolithic AuditLogViewer into smaller, reusable components

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Download,
  Eye,
  Filter,
  Search,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { AuditLog, AuditAction } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { AuditLogSkeleton } from '@/components/ui/skeleton-loaders';
import { useLoading } from '@/hooks/useLoading';

export interface AuditFilters {
  userId?: string;
  entityType?: string;
  action?: AuditAction;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

// Action icon component
interface ActionIconProps {
  action: AuditAction;
  size?: number;
}

export const ActionIcon: React.FC<ActionIconProps> = ({ action, size = 16 }) => {
  const iconMap = {
    'Create': CheckCircle,
    'Read': Eye,
    'Update': RefreshCw,
    'Delete': XCircle,
    'Login': User,
    'Logout': User,
    'Export': Download,
    'Import': Download,
    'Access': Shield
  };

  const Icon = iconMap[action] || AlertTriangle;
  
  const colorMap = {
    'Create': 'text-green-500',
    'Read': 'text-blue-500',
    'Update': 'text-yellow-500',
    'Delete': 'text-red-500',
    'Login': 'text-indigo-500',
    'Logout': 'text-gray-500',
    'Export': 'text-purple-500',
    'Import': 'text-purple-500',
    'Access': 'text-orange-500'
  };

  return <Icon size={size} className={colorMap[action] || 'text-gray-500'} />;
};

// Audit log entry component
interface AuditLogEntryProps {
  log: AuditLog;
  onSelect: (log: AuditLog) => void;
  isSelected: boolean;
}

export const AuditLogEntry: React.FC<AuditLogEntryProps> = ({ 
  log, 
  onSelect, 
  isSelected 
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(log)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <ActionIcon action={log.action} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{log.userId}</span>
                <Badge variant="secondary" className="text-xs">
                  {log.action}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {log.entityType}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {log.description}
              </p>
              {log.changes && (
                <div className="text-xs text-muted-foreground mt-2">
                  {Object.keys(log.changes).length} field(s) changed
                </div>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted-foreground">
              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
            </div>
            {log.ipAddress && (
              <div className="text-xs text-muted-foreground">
                {log.ipAddress}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Audit filters component
interface AuditFiltersProps {
  filters: AuditFilters;
  onChange: (filters: AuditFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({ 
  filters, 
  onChange, 
  onReset,
  isLoading = false 
}) => {
  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter size={20} />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search logs..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* User ID */}
        <div>
          <Label htmlFor="userId">User</Label>
          <Input
            id="userId"
            placeholder="User ID"
            value={filters.userId || ''}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Entity Type */}
        <div>
          <Label htmlFor="entityType">Entity Type</Label>
          <Select 
            value={filters.entityType || ''} 
            onValueChange={(value) => handleFilterChange('entityType', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="SalesInvoice">Sales Invoice</SelectItem>
              <SelectItem value="InventoryItem">Inventory Item</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
              <SelectItem value="Settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action */}
        <div>
          <Label htmlFor="action">Action</Label>
          <Select 
            value={filters.action || ''} 
            onValueChange={(value) => handleFilterChange('action', value as AuditAction)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              <SelectItem value="Create">Create</SelectItem>
              <SelectItem value="Read">Read</SelectItem>
              <SelectItem value="Update">Update</SelectItem>
              <SelectItem value="Delete">Delete</SelectItem>
              <SelectItem value="Login">Login</SelectItem>
              <SelectItem value="Logout">Logout</SelectItem>
              <SelectItem value="Export">Export</SelectItem>
              <SelectItem value="Import">Import</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="dateFrom">From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="dateTo">To</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Audit log details component
interface AuditLogDetailsProps {
  log: AuditLog | null;
  onClose: () => void;
}

export const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ActionIcon action={log.action} size={20} />
            <span>Audit Log Details</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>User</Label>
            <p className="text-sm">{log.userId}</p>
          </div>
          <div>
            <Label>Action</Label>
            <Badge variant="secondary">{log.action}</Badge>
          </div>
          <div>
            <Label>Entity Type</Label>
            <p className="text-sm">{log.entityType}</p>
          </div>
          <div>
            <Label>Entity ID</Label>
            <p className="text-sm">{log.entityId}</p>
          </div>
          <div>
            <Label>Timestamp</Label>
            <p className="text-sm">{new Date(log.timestamp).toLocaleString()}</p>
          </div>
          <div>
            <Label>IP Address</Label>
            <p className="text-sm">{log.ipAddress || 'N/A'}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <p className="text-sm bg-muted p-3 rounded">{log.description}</p>
        </div>

        {/* Changes */}
        {log.changes && (
          <div>
            <Label>Changes</Label>
            <div className="space-y-2">
              {Object.entries(log.changes).map(([field, change]) => (
                <div key={field} className="border rounded p-3">
                  <div className="font-medium text-sm">{field}</div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Before:</span>
                      <p className="bg-red-50 p-2 rounded mt-1">
                        {JSON.stringify(change.oldValue)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">After:</span>
                      <p className="bg-green-50 p-2 rounded mt-1">
                        {JSON.stringify(change.newValue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div>
            <Label>Metadata</Label>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export actions component
interface AuditExportActionsProps {
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
  isExporting: boolean;
  totalLogs: number;
}

export const AuditExportActions: React.FC<AuditExportActionsProps> = ({ 
  onExport, 
  isExporting, 
  totalLogs 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download size={20} />
          <span>Export</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Export {totalLogs} audit log{totalLogs !== 1 ? 's' : ''}
        </p>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            disabled={isExporting}
            className="w-full justify-start"
          >
            <Download size={16} className="mr-2" />
            Export as CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('json')}
            disabled={isExporting}
            className="w-full justify-start"
          >
            <Download size={16} className="mr-2" />
            Export as JSON
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('pdf')}
            disabled={isExporting}
            className="w-full justify-start"
          >
            <Download size={16} className="mr-2" />
            Export as PDF
          </Button>
        </div>
        
        {isExporting && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <RefreshCw size={16} className="animate-spin" />
            <span>Exporting...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};