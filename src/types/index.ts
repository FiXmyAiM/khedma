// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  plan: 'FREE' | 'ECONOMIC' | 'PREMIUM' | 'VIP';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'EXPIRED';
  trialEndsAt?: string;
  paidUntil?: string;
}

export interface Admin {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
}

// Business Types
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  currency: string;
  paymentTerms: number;
  discount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  price: number;
  cost: number;
  currency: string;
  unit: string;
  stock: number;
  minStock: number;
  taxRate: number;
  isActive: boolean;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
  productId?: string;
  product?: Product;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  client: Client;
  items: InvoiceItem[];
  createdAt: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  issueDate: string;
  validUntil: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  client: Client;
  items: InvoiceItem[];
}

// Dashboard Types
export interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalInvoices: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overdueInvoices: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentInvoices: Invoice[];
}

// AI Types
export interface AIGeneratedContent {
  id: string;
  type: string;
  prompt: string;
  content: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
  admin?: Admin;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  country?: string;
}

export interface ClientForm {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  currency: string;
  paymentTerms: number;
  discount: number;
  notes?: string;
}

export interface ProductForm {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  price: number;
  cost: number;
  currency: string;
  unit: string;
  stock: number;
  minStock: number;
  taxRate: number;
  isActive: boolean;
}

export interface InvoiceForm {
  clientId: string;
  dueDate: string;
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
}
