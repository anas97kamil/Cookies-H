export type UnitType = 'piece' | 'kg';
export type SaleType = 'retail' | 'wholesale';
export type PaymentStatus = 'paid' | 'credit';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface SaleItem {
  id: string;
  orderId: string;
  customerNumber: number;
  customerName?: string; 
  customerId?: string; // Link to specific customer in DB
  saleType: SaleType; // Retail or Wholesale
  name: string;
  price: number;
  quantity: number;
  unitType: UnitType;
  time: string;
}

// Purchase Types
export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  supplierName: string;
  date: string;
  timestamp: number;
  items: PurchaseItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus; // New field for Paid vs Credit
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unitType: UnitType;
}

export interface SummaryData {
  totalItems: number;
  totalRevenue: number;
}

export interface ArchivedDay {
  id: string;
  date: string;
  timestamp: number;
  totalRevenue: number;
  totalExpenses: number; 
  totalItems: number;
  items: SaleItem[];
  purchaseInvoices: PurchaseInvoice[]; // Changed from expenses to purchaseInvoices
}