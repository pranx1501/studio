'use client';

import { useState } from 'react';
import { useVendorData } from '@/hooks/use-vendor-data';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { Overview } from '@/components/dashboard/Overview';
import { ProductManagement } from '@/components/products/ProductManagement';
import { CustomerManagement } from '@/components/customers/CustomerManagement';
import { TransactionManagement } from '@/components/transactions/TransactionManagement';
import { SettingsView } from '@/components/settings/SettingsView';
import { Loader2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarNav activeTab={activeTab} setActiveTab={handleNavClick} />
      </div>
      
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-primary tracking-tight">VendorFlow</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarNav activeTab={activeTab} setActiveTab={handleNavClick} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-10">
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
              products={products}
              onAddCustomer={addCustomer} 
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
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

          {activeTab === 'settings' && (
            <SettingsView business={business} onUpdateBusiness={updateBusiness} />
          )}
        </div>
      </main>
    </div>
  );
}
