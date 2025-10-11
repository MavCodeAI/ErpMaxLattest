// Data Import/Export Component
// Handles backup, restore, and data migration operations

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload,
  Download,
  Database,
  FileUp,
  FileDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Calendar,
  Shield,
  HardDrive
} from 'lucide-react';
import { useDataManager } from '@/lib/dataManager';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { ExportOptions, ImportOptions, ImportResult, ExportResult } from '@/lib/dataManager';

interface BackupHistory {
  id: string;
  fileName: string;
  size: string;
  created: string;
  type: 'full' | 'incremental' | 'custom';
  status: 'completed' | 'failed';
}

export const DataImportExport: React.FC = () => {
  const { canExport, canImport } = usePermissions();
  const { exportData, importData, createBackup, restoreFromBackup } = useDataManager();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock backup history
  const backupHistory: BackupHistory[] = [
    {
      id: '1',
      fileName: 'full_backup_2024-01-15.json',
      size: '25.4 MB',
      created: '2024-01-15T10:30:00Z',
      type: 'full',
      status: 'completed'
    },
    {
      id: '2',
      fileName: 'sales_export_2024-01-14.csv',
      size: '2.1 MB',
      created: '2024-01-14T15:20:00Z',
      type: 'custom',
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Data Management
          </h1>
          <p className="text-muted-foreground">
            Import, export, backup and restore your business data
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {canExport('data') ? 'Export Enabled' : 'Export Restricted'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {canImport('data') ? 'Import Enabled' : 'Import Restricted'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Export Tab */}
        <TabsContent value="export">
          <ExportTab
            onExport={exportData}
            isExporting={isExporting}
            setIsExporting={setIsExporting}
            progress={exportProgress}
            setProgress={setExportProgress}
            result={exportResult}
            setResult={setExportResult}
            canExport={canExport('data')}
          />
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <ImportTab
            onImport={importData}
            isImporting={isImporting}
            setIsImporting={setIsImporting}
            progress={importProgress}
            setProgress={setImportProgress}
            result={importResult}
            setResult={setImportResult}
            canImport={canImport('data')}
            fileInputRef={fileInputRef}
          />
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup">
          <BackupTab
            onBackup={createBackup}
            onRestore={restoreFromBackup}
            canBackup={canExport('data')}
            canRestore={canImport('data')}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <HistoryTab history={backupHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ExportTab: React.FC<{
  onExport: (options: ExportOptions) => Promise<ExportResult>;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  progress: number;
  setProgress: (value: number) => void;
  result: ExportResult | null;
  setResult: (value: ExportResult | null) => void;
  canExport: boolean;
}> = ({ onExport, isExporting, setIsExporting, progress, setProgress, result, setResult, canExport }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    entities: ['customers', 'sales_invoices', 'inventory_items'],
    includeRelated: true,
    compression: false
  });

  const handleExport = async () => {
    if (!canExport) {
      toast.error('You do not have permission to export data');
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return Math.min(newProgress, 90);
        });
      }, 200);

      const exportResult = await onExport(exportOptions);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(exportResult);

      if (exportResult.success) {
        toast.success('Data exported successfully');
        
        // Trigger download
        const link = document.createElement('a');
        link.href = exportResult.fileUrl;
        link.download = exportResult.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error('Export failed');
      }
    } catch (error) {
      toast.error('Export failed: ' + (error as Error).message);
      setResult({
        success: false,
        fileUrl: '',
        fileName: '',
        fileSize: 0,
        recordCount: 0,
        executionTime: 0
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Export Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Export your business data in various formats
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!canExport && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to export data. Contact your administrator.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: 'json' | 'csv' | 'xlsx') => 
                setExportOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON - Full structure</SelectItem>
                <SelectItem value="csv">CSV - Tabular data</SelectItem>
                <SelectItem value="xlsx">Excel - Spreadsheet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entity Selection */}
          <div className="space-y-2">
            <Label>Data to Export</Label>
            <div className="space-y-2">
              {[
                { key: 'customers', label: 'Customers' },
                { key: 'suppliers', label: 'Suppliers' },
                { key: 'inventory_items', label: 'Inventory Items' },
                { key: 'sales_invoices', label: 'Sales Invoices' },
                { key: 'purchase_orders', label: 'Purchase Orders' },
                { key: 'projects', label: 'Projects' },
                { key: 'employees', label: 'Employees' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={key}
                    checked={exportOptions.entities.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setExportOptions(prev => ({
                          ...prev,
                          entities: [...prev.entities, key]
                        }));
                      } else {
                        setExportOptions(prev => ({
                          ...prev,
                          entities: prev.entities.filter(entity => entity !== key)
                        }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Export Options</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includeRelated">Include Related Data</Label>
                <p className="text-sm text-muted-foreground">Export linked records and relationships</p>
              </div>
              <Switch
                id="includeRelated"
                checked={exportOptions.includeRelated}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeRelated: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compression">Compress File</Label>
                <p className="text-sm text-muted-foreground">Create a compressed archive</p>
              </div>
              <Switch
                id="compression"
                checked={exportOptions.compression}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, compression: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Export Progress</Label>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Result */}
        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {result.success ? (
                <>
                  Export completed successfully! 
                  <br />
                  Records: {result.recordCount.toLocaleString()}, 
                  Size: {(result.fileSize / 1024 / 1024).toFixed(2)} MB,
                  Time: {(result.executionTime / 1000).toFixed(1)}s
                </>
              ) : (
                'Export failed. Please try again or contact support.'
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !canExport || exportOptions.entities.length === 0}
          >
            {isExporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ImportTab: React.FC<{
  onImport: (file: File, entityType: string, options?: ImportOptions) => Promise<ImportResult>;
  isImporting: boolean;
  setIsImporting: (value: boolean) => void;
  progress: number;
  setProgress: (value: number) => void;
  result: ImportResult | null;
  setResult: (value: ImportResult | null) => void;
  canImport: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ onImport, isImporting, setIsImporting, progress, setProgress, result, setResult, canImport, fileInputRef }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [entityType, setEntityType] = useState('customers');
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    strategy: 'merge',
    validateData: true,
    createBackup: true,
    dryRun: false
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !canImport) return;

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 15;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return Math.min(newProgress, 90);
        });
      }, 300);

      const importResult = await onImport(selectedFile, entityType, importOptions);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(importResult);

      if (importResult.success) {
        toast.success(`Import completed: ${importResult.recordsImported} records imported`);
      } else {
        toast.error(`Import failed: ${importResult.recordsErrored} errors`);
      }
    } catch (error) {
      toast.error('Import failed: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Import Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Import data from CSV, JSON, or Excel files
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!canImport && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to import data. Contact your administrator.
            </AlertDescription>
          </Alert>
        )}

        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="file">Select File</Label>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canImport}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            {selectedFile && (
              <Badge variant="outline">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Badge>
            )}
          </div>
        </div>

        {/* Entity Type */}
        <div className="space-y-2">
          <Label htmlFor="entityType">Data Type</Label>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="suppliers">Suppliers</SelectItem>
              <SelectItem value="inventory_items">Inventory Items</SelectItem>
              <SelectItem value="employees">Employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Import Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Import Options</h3>
          
          <div className="space-y-2">
            <Label htmlFor="strategy">Import Strategy</Label>
            <Select
              value={importOptions.strategy}
              onValueChange={(value: 'replace' | 'merge' | 'skip_existing') => 
                setImportOptions(prev => ({ ...prev, strategy: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merge">Merge - Update existing records</SelectItem>
                <SelectItem value="skip_existing">Skip - Ignore existing records</SelectItem>
                <SelectItem value="replace">Replace - Overwrite existing records</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="validateData">Validate Data</Label>
                <p className="text-sm text-muted-foreground">Check data format and requirements before import</p>
              </div>
              <Switch
                id="validateData"
                checked={importOptions.validateData}
                onCheckedChange={(checked) => 
                  setImportOptions(prev => ({ ...prev, validateData: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="createBackup">Create Backup</Label>
                <p className="text-sm text-muted-foreground">Backup existing data before import</p>
              </div>
              <Switch
                id="createBackup"
                checked={importOptions.createBackup}
                onCheckedChange={(checked) => 
                  setImportOptions(prev => ({ ...prev, createBackup: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dryRun">Dry Run</Label>
                <p className="text-sm text-muted-foreground">Test import without making changes</p>
              </div>
              <Switch
                id="dryRun"
                checked={importOptions.dryRun}
                onCheckedChange={(checked) => 
                  setImportOptions(prev => ({ ...prev, dryRun: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Progress */}
        {isImporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Import Progress</Label>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Result */}
        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  {result.success ? 'Import completed successfully!' : 'Import completed with errors'}
                </div>
                <div className="text-sm">
                  Processed: {result.recordsProcessed}, 
                  Imported: {result.recordsImported}, 
                  Skipped: {result.recordsSkipped}, 
                  Errors: {result.recordsErrored}
                </div>
                {result.errors.length > 0 && (
                  <div className="text-sm">
                    <details>
                      <summary className="cursor-pointer">View Errors ({result.errors.length})</summary>
                      <ul className="mt-2 space-y-1">
                        {result.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-xs">
                            Row {error.row}: {error.message}
                          </li>
                        ))}
                        {result.errors.length > 5 && (
                          <li className="text-xs">... and {result.errors.length - 5} more</li>
                        )}
                      </ul>
                    </details>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={handleImport} 
            disabled={isImporting || !selectedFile || !canImport}
          >
            {isImporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const BackupTab: React.FC<{
  onBackup: (entities?: string[]) => Promise<ExportResult>;
  onRestore: (file: File, options?: ImportOptions) => Promise<ImportResult[]>;
  canBackup: boolean;
  canRestore: boolean;
}> = ({ onBackup, onRestore, canBackup, canRestore }) => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const handleCreateBackup = async () => {
    if (!canBackup) return;
    
    setIsCreatingBackup(true);
    try {
      const result = await onBackup();
      if (result.success) {
        toast.success('Backup created successfully');
      }
    } catch (error) {
      toast.error('Backup failed');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            System Backup
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create full system backups and restore from previous backups
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Backup */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Create Backup</h3>
              <p className="text-sm text-muted-foreground">
                Create a complete backup of all your business data
              </p>
              <Button 
                onClick={handleCreateBackup} 
                disabled={isCreatingBackup || !canBackup}
                className="w-full"
              >
                {isCreatingBackup ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Create Full Backup
                  </>
                )}
              </Button>
            </div>

            {/* Restore Backup */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Restore Backup</h3>
              <p className="text-sm text-muted-foreground">
                Restore your system from a previous backup file
              </p>
              <Button 
                variant="destructive" 
                disabled={!canRestore}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Restore from Backup
              </Button>
            </div>
          </div>

          {(!canBackup || !canRestore) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You need additional permissions to perform backup and restore operations.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const HistoryTab: React.FC<{ history: BackupHistory[] }> = ({ history }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Backup History
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View and manage your backup files
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((backup) => (
            <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {backup.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{backup.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(backup.created).toLocaleString()} • {backup.size}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {backup.type}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataImportExport;