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
  cost_price: z.number().min(0, "Cost price must be positive").optional(),
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

// Pakistani phone number validation
const pakistaniPhoneRegex = /^(\+92|92|0)?[3][0-9]{9}$/;

// Employee validation schema
export const employeeSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required").max(50, "Employee ID too long"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || pakistaniPhoneRegex.test(val.replace(/[\s\-()]/g, '')), {
      message: "Invalid Pakistani phone number format (03001234567 or +923001234567)"
    }),
  position: z.string().min(1, "Position is required").max(100, "Position too long"),
  department: z.string().min(1, "Department is required").max(100, "Department too long"),
  salary: z.number().min(0, "Salary cannot be negative").max(10000000, "Salary too high"),
  hire_date: z.string()
    .min(1, "Hire date is required")
    .refine((date) => {
      const hireDate = new Date(date);
      const today = new Date();
      const minDate = new Date('1900-01-01');
      return hireDate >= minDate && hireDate <= today;
    }, "Hire date must be between 1900 and today"),
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
