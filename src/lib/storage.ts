'use client';

export interface BusinessInfo {
  name: string;
  owner: string;
  location: string;
  profileImage?: string;
  onboarded: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  keywords: string[];
  attributes: Record<string, string>;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  imageUrl?: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  items: TransactionItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'paid';
  date: string;
}

const STORAGE_KEYS = {
  BUSINESS: 'vf_business',
  PRODUCTS: 'vf_products',
  CUSTOMERS: 'vf_customers',
  TRANSACTIONS: 'vf_transactions',
};

export const getStorageData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const setStorageData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};

export const downloadBackup = () => {
  const data = {
    business: getStorageData(STORAGE_KEYS.BUSINESS, null),
    products: getStorageData(STORAGE_KEYS.PRODUCTS, []),
    customers: getStorageData(STORAGE_KEYS.CUSTOMERS, []),
    transactions: getStorageData(STORAGE_KEYS.TRANSACTIONS, []),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vendorflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export { STORAGE_KEYS };