// Enhanced Data Import/Export Component
// Uses modular components for better maintainability and user experience

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Database, Upload, Download, AlertTriangle, Info } from 'lucide-react';
import { useLoading } from '@/hooks/useLoading';
import { usePermissions } from '@/lib/permissions';
import { LoadingState, ErrorState } from '@/components/ui/skeleton-loaders';
import {
  FileUpload,
  ImportProgress,
  ExportOptions,
  FilePreview,
  ImportResult,
  ExportOptions as ExportOptionsType
} from '@/components/data/DataManagementComponents';

export const DataImportExportEnhanced: React.FC = () => {
  const { canCreate, canRead } = usePermissions();
  const { isLoading, setLoading } = useLoading();

  // Import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{
    headers: string[];
    rows: string[][];
    totalRows: number;
  } | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Export state
  const [exportOptions, setExportOptions] = useState<ExportOptionsType>({
    format: 'csv',
    entityType: '',
    includeHeaders: true
  });

  // Check permissions
  const canImport = canCreate('DataImport');
  const canExport = canRead('DataExport');

  // Handle file selection for import
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setImportResult(null);
    setLoading('file-preview', true);

    try {
      // Simulate file parsing for preview
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock preview data
      const mockPreview = {
        headers: ['Name', 'Email', 'Phone', 'Company', 'Status'],
        rows: [
          ['John Doe', 'john@example.com', '123-456-7890', 'Acme Corp', 'Active'],
          ['Jane Smith', 'jane@example.com', '098-765-4321', 'Tech Inc', 'Active'],
          ['Bob Johnson', 'bob@example.com', '555-123-4567', 'Design Co', 'Inactive']
        ],
        totalRows: 150
      };
      
      setFilePreview(mockPreview);
    } catch (error) {
      console.error('Error parsing file:', error);
    } finally {
      setLoading('file-preview', false);
    }
  }, [setLoading]);

  // Handle import
  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    setLoading('import', true);
    setImportProgress(0);
    setImportResult(null);

    try {
      const steps = [
        'Validating file format...',
        'Parsing data...',
        'Validating records...',
        'Importing data...',
        'Finalizing import...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setImportStep(steps[i]);
        setImportProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mock import result
      const result: ImportResult = {
        success: true,
        recordsProcessed: 150,
        recordsImported: 145,
        errors: [
          'Row 15: Invalid email format for john.doe@invalid-domain',
          'Row 32: Missing required field "Company"'
        ],
        warnings: [
          'Row 8: Phone number format standardized',
          'Row 25: Duplicate email detected, skipped',
          'Row 67: Company name truncated to fit field limit'
        ]
      };

      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        recordsProcessed: 0,
        recordsImported: 0,
        errors: ['Import failed: ' + (error as Error).message],
        warnings: []
      });
    } finally {
      setLoading('import', false);
      setImportProgress(100);
    }
  }, [selectedFile, setLoading]);

  // Handle export
  const handleExport = useCallback(async () => {
    setLoading('export', true);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app: generate and download file
      const filename = `${exportOptions.entityType.toLowerCase()}-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      console.log('Exporting:', filename);
      
      // Create mock download
      const element = document.createElement('a');
      element.href = 'data:text/plain;charset=utf-8,Mock export data...';
      element.download = filename;
      element.click();
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading('export', false);
    }
  }, [exportOptions, setLoading]);

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setImportResult(null);
    setImportProgress(0);
  };

  if (!canImport && !canExport) {
    return (
      <ErrorState message="You don't have permission to import or export data." />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Database size={24} />
        <div>
          <h1 className="text-2xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">
            Import and export your business data
          </p>
        </div>
      </div>

      {/* Important Notes */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Always backup your data before importing. 
          Large imports may take several minutes to complete.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs defaultValue={canImport ? "import" : "export"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          {canImport && (
            <TabsTrigger value="import" className="flex items-center space-x-2">
              <Upload size={16} />
              <span>Import Data</span>
            </TabsTrigger>
          )}
          {canExport && (
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download size={16} />
              <span>Export Data</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Import Tab */}
        {canImport && (
          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - File Upload */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedFile ? (
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        acceptedTypes={['.csv', '.xlsx', '.json']}
                        maxSize={50}
                        isLoading={isLoading('file-preview')}
                      />
                    ) : (
                      <FilePreview
                        file={selectedFile}
                        preview={filePreview || undefined}
                        onRemove={handleRemoveFile}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Import Actions */}
                {selectedFile && filePreview && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Import Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This will import {filePreview.totalRows} records. 
                          Make sure your data is properly formatted.
                        </AlertDescription>
                      </Alert>
                      
                      <button
                        onClick={handleImport}
                        disabled={isLoading('import')}
                        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isLoading('import') ? 'Importing...' : 'Start Import'}
                      </button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Progress & Results */}
              <div className="space-y-6">
                <ImportProgress
                  isImporting={isLoading('import')}
                  progress={importProgress}
                  currentStep={importStep}
                  result={importResult}
                />

                {/* Import Guidelines */}
                <Card>
                  <CardHeader>
                    <CardTitle>Import Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <strong>Supported Formats:</strong>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        <li>CSV files with headers</li>
                        <li>Excel files (.xlsx)</li>
                        <li>JSON files with array structure</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <strong>Data Requirements:</strong>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        <li>First row must contain column headers</li>
                        <li>Required fields must not be empty</li>
                        <li>Email addresses must be valid</li>
                        <li>Phone numbers should follow standard format</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Export Tab */}
        {canExport && (
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Export Options */}
              <div className="lg:col-span-1">
                <ExportOptions
                  options={exportOptions}
                  onChange={setExportOptions}
                  onExport={handleExport}
                  isExporting={isLoading('export')}
                />
              </div>

              {/* Right Column - Export Info & Progress */}
              <div className="lg:col-span-2 space-y-6">
                {isLoading('export') && <LoadingState message="Generating export file..." />}
                
                {/* Export Guidelines */}
                <Card>
                  <CardHeader>
                    <CardTitle>Export Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-4 border rounded">
                        <div className="font-medium">CSV</div>
                        <div className="text-muted-foreground">
                          Comma-separated values for spreadsheet applications
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="font-medium">JSON</div>
                        <div className="text-muted-foreground">
                          Structured data for API integration
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="font-medium">Excel</div>
                        <div className="text-muted-foreground">
                          Native Excel format with formatting
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <strong>Export Features:</strong>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li>Filter by date range</li>
                        <li>Include/exclude headers</li>
                        <li>Preserve data relationships</li>
                        <li>Maintain data formatting</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DataImportExportEnhanced;