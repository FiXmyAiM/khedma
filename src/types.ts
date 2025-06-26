export interface AIGeneratedContent {
  id: string;
  type: string;
  prompt: string;
  content: string;
  context?: string;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  sku?: string;
  stock?: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  issueDate: string;
  dueDate: string;
  status: string;
  items: InvoiceItem[];
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  client: Client;
  issueDate: string;
  validUntil: string;
  status: string;
  items: QuoteItem[];
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
} 