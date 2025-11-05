import { z } from "zod";

// Item validation schema
export const itemSchema = z.object({
  item_id: z.string().min(1, "Item ID is required").max(50, "Item ID too long"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  category: z.enum(["Electronics", "Furniture", "Accessories"], {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  price: z.number().min(0, "Price must be positive"),
  status: z.enum(["In Stock", "Low Stock", "Out of Stock"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
});

// Customer/Supplier validation schema
export const partySchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50, "Phone too long").optional().or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
});

// Invoice validation schema
export const invoiceSchema = z.object({
  invoice_id: z.string().min(1, "Invoice ID is required"),
  customer_name: z.string().min(1, "Customer name is required"),
  total_amount: z.number().min(0, "Amount must be positive"),
  status: z.enum(["Pending", "Paid", "Cancelled"]),
  date: z.string(),
});

// Purchase Order validation schema
export const purchaseOrderSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  supplier_name: z.string().min(1, "Supplier name is required"),
  total_amount: z.number().min(0, "Amount must be positive"),
  status: z.enum(["Pending", "Completed", "Cancelled"]),
  date: z.string(),
});

// Employee validation schema
export const employeeSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50, "Phone too long").optional().or(z.literal("")),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  salary: z.number().min(0, "Salary must be positive"),
  status: z.enum(["Active", "Inactive", "On Leave"]),
});

// Transaction validation schema
export const transactionSchema = z.object({
  transaction_id: z.string().min(1, "Transaction ID is required"),
  type: z.enum(["Income", "Expense"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().max(500, "Description too long").optional().or(z.literal("")),
  date: z.string(),
});

// Project validation schema
export const projectSchema = z.object({
  project_id: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
  status: z.enum(["Active", "Completed", "On Hold", "Cancelled"]),
  budget: z.number().min(0, "Budget cannot be negative"),
  start_date: z.string(),
  end_date: z.string().optional().or(z.literal("")),
});

export type ItemFormData = z.infer<typeof itemSchema>;
export type PartyFormData = z.infer<typeof partySchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
