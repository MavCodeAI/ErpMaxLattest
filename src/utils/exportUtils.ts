import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Invoice export types
interface InvoiceExportData {
  invoice_id: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  total_amount: number;
  payment_status: string;
  status: string;
}

// Inventory item export types
interface InventoryExportData {
  item_id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: string;
  description?: string;
}

// Purchase order export types
interface PurchaseExportData {
  order_id: string;
  supplier_name: string;
  date: string;
  total_amount: number;
  status: string;
}

// Transaction export types
interface TransactionExportData {
  transaction_id: string;
  type: string;
  category: string;
  date: string;
  amount: number;
  description?: string;
}

// Employee export types
interface EmployeeExportData {
  employee_id: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  status: string;
  hire_date: string;
}

// Project export types
interface ProjectExportData {
  project_id: string;
  name: string;
  status: string;
  start_date: string;
  budget?: number;
}

type ExportableRecord = Record<string, string | number | boolean | null | undefined | unknown>;

type AutoTableColumn<T extends ExportableRecord> = {
  header: string;
  dataKey: keyof T & string;
};

interface InvoiceSource {
  invoice_id: string;
  customer_name: string;
  customer_phone?: string | null;
  date: string | number | Date;
  total_amount: number | string;
  payment_status: string;
  status: string;
}

interface InventorySource {
  item_id: string;
  name: string;
  category: string;
  stock: number | string;
  price: number | string;
  status: string;
  description?: string | null;
}

interface PurchaseSource {
  order_id: string;
  supplier_name: string;
  date: string | number | Date;
  total_amount: number | string;
  status: string;
}

interface TransactionSource {
  transaction_id: string;
  type: string;
  category: string;
  date: string | number | Date;
  amount: number | string;
  description?: string | null;
}

interface EmployeeSource {
  employee_id: string;
  name: string;
  department: string;
  position: string;
  salary: number | string;
  status: string;
  hire_date: string | number | Date;
}

interface ProjectSource {
  project_id: string;
  name: string;
  status: string;
  start_date: string | number | Date;
  budget?: number | string | null;
}

// Export to Excel
export const exportToExcel = <T extends ExportableRecord>(
  data: T[],
  fileName: string,
  sheetName: string = 'Sheet1'
) => {
  try {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, sheetName);
    writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};

// Export to PDF
export const exportToPDF = <T extends ExportableRecord>(
  data: T[],
  fileName: string,
  title: string,
  columns: AutoTableColumn<T>[]
) => {
  try {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    // Add date
    doc.setFontSize(12);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Add table
    autoTable(doc, {
      columns: columns.map(col => ({ header: col.header, dataKey: col.dataKey })),
      body: data,
      startY: 40,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    // Save the PDF
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
};

// Format data for export
export const formatInvoiceDataForExport = (invoices: InvoiceSource[]): InvoiceExportData[] => {
  return invoices.map(invoice => ({
    invoice_id: invoice.invoice_id,
    customer_name: invoice.customer_name,
    customer_phone: invoice.customer_phone ?? '',
    date: new Date(invoice.date).toLocaleDateString(),
    total_amount: Number(invoice.total_amount),
    payment_status: invoice.payment_status,
    status: invoice.status,
  }));
};

export const formatInventoryDataForExport = (items: InventorySource[]): InventoryExportData[] => {
  return items.map(item => ({
    item_id: item.item_id,
    name: item.name,
    category: item.category,
    stock: Number(item.stock),
    price: Number(item.price),
    status: item.status,
    description: item.description ?? '',
  }));
};

export const formatPurchaseDataForExport = (orders: PurchaseSource[]): PurchaseExportData[] => {
  return orders.map(order => ({
    order_id: order.order_id,
    supplier_name: order.supplier_name,
    date: new Date(order.date).toLocaleDateString(),
    total_amount: Number(order.total_amount),
    status: order.status,
  }));
};

export const formatTransactionDataForExport = (transactions: TransactionSource[]): TransactionExportData[] => {
  return transactions.map(transaction => ({
    transaction_id: transaction.transaction_id,
    type: transaction.type,
    category: transaction.category,
    date: new Date(transaction.date).toLocaleDateString(),
    amount: Number(transaction.amount),
    description: transaction.description ?? '',
  }));
};

export const formatEmployeeDataForExport = (employees: EmployeeSource[]): EmployeeExportData[] => {
  return employees.map(employee => ({
    employee_id: employee.employee_id,
    name: employee.name,
    department: employee.department,
    position: employee.position,
    salary: Number(employee.salary),
    status: employee.status,
    hire_date: new Date(employee.hire_date).toLocaleDateString(),
  }));
};

export const formatProjectDataForExport = (projects: ProjectSource[]): ProjectExportData[] => {
  return projects.map(project => ({
    project_id: project.project_id,
    name: project.name,
    status: project.status,
    start_date: new Date(project.start_date).toLocaleDateString(),
    budget: project.budget ? Number(project.budget) : undefined,
  }));
};
