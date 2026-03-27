'use client';

import { useState, useEffect } from 'react';
import { 
  getStorageData, 
  setStorageData, 
  STORAGE_KEYS, 
  BusinessInfo, 
  Product, 
  Customer, 
  Transaction 
} from '@/lib/storage';

export function useVendorData() {
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setBusiness(getStorageData(STORAGE_KEYS.BUSINESS, null));
    setProducts(getStorageData(STORAGE_KEYS.PRODUCTS, []));
    setCustomers(getStorageData(STORAGE_KEYS.CUSTOMERS, []));
    setTransactions(getStorageData(STORAGE_KEYS.TRANSACTIONS, []));
    setIsLoading(false);
  }, []);

  const updateBusiness = (info: BusinessInfo) => {
    setBusiness(info);
    setStorageData(STORAGE_KEYS.BUSINESS, info);
  };

  const addProduct = (product: Product) => {
    const newProducts = [...products, product];
    setProducts(newProducts);
    setStorageData(STORAGE_KEYS.PRODUCTS, newProducts);
  };

  const updateProduct = (updated: Product) => {
    const newProducts = products.map(p => p.id === updated.id ? updated : p);
    setProducts(newProducts);
    setStorageData(STORAGE_KEYS.PRODUCTS, newProducts);
  };

  const addCustomer = (customer: Customer) => {
    const newCustomers = [...customers, customer];
    setCustomers(newCustomers);
    setStorageData(STORAGE_KEYS.CUSTOMERS, newCustomers);
  };

  const addTransaction = (tx: Transaction) => {
    const newTransactions = [tx, ...transactions];
    setTransactions(newTransactions);
    setStorageData(STORAGE_KEYS.TRANSACTIONS, newTransactions);
  };

  const updateTransaction = (updated: Transaction) => {
    const newTransactions = transactions.map(t => t.id === updated.id ? updated : t);
    setTransactions(newTransactions);
    setStorageData(STORAGE_KEYS.TRANSACTIONS, newTransactions);
  };

  return {
    business,
    products,
    customers,
    transactions,
    isLoading,
    updateBusiness,
    addProduct,
    updateProduct,
    addCustomer,
    addTransaction,
    updateTransaction,
  };
}