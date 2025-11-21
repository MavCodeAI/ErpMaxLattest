import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  itemSchema,
  partySchema,
  invoiceSchema,
  employeeSchema,
  ItemFormData,
  PartyFormData,
  InvoiceFormData,
  EmployeeFormData
} from './validation';

describe('Item Validation', () => {
  it('should validate valid item data', () => {
    const validItem: ItemFormData = {
      item_id: 'ITM-001',
      name: 'Test Item',
      category: 'Electronics',
      stock: 10,
      price: 99.99,
      status: 'In Stock'
    };

    const result = itemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('should reject negative stock', () => {
    const invalidItem = {
      item_id: 'ITM-001',
      name: 'Test Item',
      category: 'Electronics' as const,
      stock: -5,
      price: 99.99,
      status: 'In Stock' as const
    };

    const result = itemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('Stock cannot be negative');
  });

  it('should reject invalid category', () => {
    const invalidItem = {
      item_id: 'ITM-001',
      name: 'Test Item',
      category: 'InvalidCategory',
      stock: 10,
      price: 99.99,
      status: 'In Stock' as const
    };

    const result = itemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });
});

describe('Party Validation', () => {
  it('should validate valid party data', () => {
    const validParty: PartyFormData = {
      name: 'Test Company',
      email: 'test@company.com',
      phone: '',
      address: '123 Test Street'
    };

    const result = partySchema.safeParse(validParty);
    expect(result.success).toBe(true);
  });

  it('should validate party with empty optional fields', () => {
    const validParty: PartyFormData = {
      name: 'Test Company',
      email: '',
      phone: '',
      address: ''
    };

    const result = partySchema.safeParse(validParty);
    expect(result.success).toBe(true);
  });
});

describe('Invoice Validation', () => {
  it('should validate valid invoice data', () => {
    const validInvoice: InvoiceFormData = {
      invoice_id: 'INV-001',
      customer_name: 'John Doe',
      total_amount: 150.50,
      status: 'Pending',
      date: '2024-01-15'
    };

    const result = invoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it('should reject negative amount', () => {
    const invalidInvoice = {
      invoice_id: 'INV-001',
      customer_name: 'John Doe',
      total_amount: -50,
      status: 'Pending' as const,
      date: '2024-01-15'
    };

    const result = invoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });
});

describe('Employee Validation', () => {
  it('should validate valid employee data', () => {
    const validEmployee: EmployeeFormData = {
      employee_id: 'EMP-001',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '',
      position: 'Developer',
      department: 'IT',
      salary: 50000,
      hire_date: '2024-01-01',
      status: 'Active'
    };

    const result = employeeSchema.safeParse(validEmployee);
    expect(result.success).toBe(true);
  });

  it('should validate Pakistani phone numbers', () => {
    const employeeWithPhone = {
      employee_id: 'EMP-001',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '03001234567',
      position: 'Developer',
      department: 'IT',
      salary: 50000,
      hire_date: '2024-01-01',
      status: 'Active' as const
    };

    const result = employeeSchema.safeParse(employeeWithPhone);
    expect(result.success).toBe(true);
  });

  it('should reject invalid Pakistani phone numbers', () => {
    const employeeWithInvalidPhone = {
      employee_id: 'EMP-001',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '1234567890',
      position: 'Developer',
      department: 'IT',
      salary: 50000,
      hire_date: '2024-01-01',
      status: 'Active' as const
    };

    const result = employeeSchema.safeParse(employeeWithInvalidPhone);
    expect(result.success).toBe(false);
  });

  it('should reject salaries above maximum', () => {
    const employeeWithHighSalary = {
      employee_id: 'EMP-001',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '03001234567',
      position: 'Executive',
      department: 'Management',
      salary: 15000000, // Above 10M limit
      hire_date: '2024-01-01',
      status: 'Active' as const
    };

    const result = employeeSchema.safeParse(employeeWithHighSalary);
    expect(result.success).toBe(false);
  });
});
