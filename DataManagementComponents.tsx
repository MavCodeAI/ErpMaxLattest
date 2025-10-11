// Modular Data Import/Export Components
// Breaking down complex data management into reusable, focused components

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileText, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useLoading } from '@/hooks/useLoading';

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  entityType: string;
  includeHeaders: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

// File upload component
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number; // in MB
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  acceptedTypes, 
  maxSize,
  isLoading = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(`.${fileExtension}`)) {
      setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File too large. Maximum size: ${maxSize}MB`);
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, acceptedTypes, maxSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {dragActive ? 'Drop file here' : 'Drag and drop your file here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
          <div className="flex justify-center">
            <Input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleFileInput}
              accept={acceptedTypes.join(',')}
              disabled={isLoading}
            />
            <Label 
              htmlFor="file-upload" 
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Choose File
            </Label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Supported formats: {acceptedTypes.join(', ')} (max {maxSize}MB)
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Import progress component
interface ImportProgressProps {
  isImporting: boolean;
  progress: number;
  currentStep: string;
  result?: ImportResult;
}

export const ImportProgress: React.FC<ImportProgressProps> = ({ 
  isImporting, 
  progress, 
  currentStep, 
  result 
}) => {
  if (!isImporting && !result) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isImporting ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : result?.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span>
            {isImporting ? 'Importing Data' : result?.success ? 'Import Completed' : 'Import Failed'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isImporting && (
          <>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </>
        )}

        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Records Processed</Label>
                <p className="font-medium">{result.recordsProcessed}</p>
              </div>
              <div>
                <Label>Records Imported</Label>
                <p className="font-medium text-green-600">{result.recordsImported}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <Label className="text-red-600">Errors ({result.errors.length})</Label>
                <div className="bg-red-50 p-3 rounded max-h-32 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">{error}</p>
                  ))}
                </div>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div>
                <Label className="text-yellow-600">Warnings ({result.warnings.length})</Label>
                <div className="bg-yellow-50 p-3 rounded max-h-32 overflow-y-auto">
                  {result.warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-yellow-700">{warning}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export options component
interface ExportOptionsProps {
  options: ExportOptions;
  onChange: (options: ExportOptions) => void;
  onExport: () => void;
  isExporting: boolean;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  options, 
  onChange, 
  onExport, 
  isExporting 
}) => {
  const entityTypes = [
    'Customer', 'Supplier', 'InventoryItem', 'SalesInvoice', 
    'PurchaseOrder', 'Project', 'Employee', 'Transaction'
  ];

  const formats = [
    { value: 'csv', label: 'CSV', icon: FileText },
    { value: 'json', label: 'JSON', icon: Database },
    { value: 'xlsx', label: 'Excel', icon: FileText }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entity Type */}
        <div>
          <Label>Entity Type</Label>
          <select
            className="w-full mt-1 p-2 border rounded-md"
            value={options.entityType}
            onChange={(e) => onChange({ ...options, entityType: e.target.value })}
            disabled={isExporting}
          >
            <option value="">Select entity type</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div>
          <Label>Export Format</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {formats.map(format => {
              const Icon = format.icon;
              return (
                <button
                  key={format.value}
                  className={`p-3 border rounded-md text-center transition-colors ${
                    options.format === format.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => onChange({ ...options, format: format.value as any })}
                  disabled={isExporting}
                >
                  <Icon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">{format.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include-headers"
              checked={options.includeHeaders}
              onChange={(e) => onChange({ ...options, includeHeaders: e.target.checked })}
              disabled={isExporting}
            />
            <Label htmlFor="include-headers">Include headers</Label>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <Label>Date Range (Optional)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input
              type="date"
              placeholder="From"
              value={options.dateRange?.from || ''}
              onChange={(e) => onChange({
                ...options,
                dateRange: { ...options.dateRange, from: e.target.value, to: options.dateRange?.to || '' }
              })}
              disabled={isExporting}
            />
            <Input
              type="date"
              placeholder="To"
              value={options.dateRange?.to || ''}
              onChange={(e) => onChange({
                ...options,
                dateRange: { ...options.dateRange, from: options.dateRange?.from || '', to: e.target.value }
              })}
              disabled={isExporting}
            />
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={onExport}
          disabled={!options.entityType || !options.format || isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// File preview component
interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  preview?: {
    headers: string[];
    rows: string[][];
    totalRows: number;
  };
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, preview }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>File Preview</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label>File Name</Label>
            <p className="font-medium">{file.name}</p>
          </div>
          <div>
            <Label>File Size</Label>
            <p className="font-medium">{formatFileSize(file.size)}</p>
          </div>
        </div>

        {/* Preview Table */}
        {preview && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Data Preview</Label>
              <Badge variant="secondary">
                {preview.totalRows} total rows
              </Badge>
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      {preview.headers.map((header, index) => (
                        <th key={index} className="px-2 py-1 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.rows.length > 10 && (
                <div className="p-2 bg-muted text-xs text-center">
                  ... and {preview.rows.length - 10} more rows
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};