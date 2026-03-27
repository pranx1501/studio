'use client';

import { useState } from 'react';
import { useVendorData } from '@/hooks/use-vendor-data';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { Overview } from '@/components/dashboard/Overview';
import { ProductManagement } from '@/components/products/ProductManagement';
import { CustomerManagement } from '@/components/customers/CustomerManagement';
import { TransactionManagement } from '@/components/transactions/TransactionManagement';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { 
    business, 
    products, 
    customers, 
    transactions, 
    isLoading,
    updateBusiness,
    addProduct,
    addCustomer,
    addTransaction,
    updateTransaction
  } = useVendorData();

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!business || !business.onboarded) {
    return <OnboardingModal onComplete={updateBusiness} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <Overview 
              business={business} 
              products={products} 
              customers={customers} 
              transactions={transactions} 
            />
          )}
          
          {activeTab === 'products' && (
            <ProductManagement 
              products={products} 
              onAddProduct={addProduct} 
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement 
              customers={customers} 
              transactions={transactions}
              onAddCustomer={addCustomer} 
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionManagement 
              transactions={transactions} 
              products={products} 
              customers={customers} 
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
            />
          )}
        </div>
      </main>
    </div>
  );
}
