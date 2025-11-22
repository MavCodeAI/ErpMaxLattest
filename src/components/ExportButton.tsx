import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/integrations/supabase/types";

type ExportDataType = Record<string, string | number | boolean | null | undefined>;

interface ExportButtonProps {
  data: ExportDataType[];
  fileName: string;
  sheetName?: string;
  title: string;
  columns: { header: string; dataKey: string }[];
  formatDataForExport: (data: unknown[]) => ExportDataType[];
}

export const ExportButton = ({
  data,
  fileName,
  sheetName = "Sheet1",
  title,
  columns,
  formatDataForExport,
}: ExportButtonProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const formattedData = formatDataForExport(data);
      import("@/utils/exportUtils").then((module) => {
        module.exportToExcel(formattedData, fileName, sheetName);
        toast({
          title: "Export Successful",
          description: `Data exported to Excel as ${fileName}.xlsx`,
        });
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data to Excel",
        variant: "destructive",
      });
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const formattedData = formatDataForExport(data);
      import("@/utils/exportUtils").then((module) => {
        module.exportToPDF(formattedData, fileName, title, columns);
        toast({
          title: "Export Successful",
          description: `Data exported to PDF as ${fileName}.pdf`,
        });
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data to PDF",
        variant: "destructive",
      });
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
