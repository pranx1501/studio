'use client';

import { BusinessInfo, Product, Customer, Transaction } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Package, Users, Wallet, TrendingUp, History } from 'lucide-react';

interface OverviewProps {
  business: BusinessInfo;
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
}

export function Overview({ business, products, customers, transactions }: OverviewProps) {
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const pendingAmount = transactions.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0);
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Branding Section */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 p-1 shrink-0 overflow-hidden shadow-xl">
            {business.profileImage ? (
              <img 
                src={business.profileImage} 
                alt={business.name} 
                className="w-full h-full object-cover rounded-2xl" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-foreground/10">
                <Package className="w-16 h-16 text-white" />
              </div>
            )}
          </div>
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight font-headline">{business.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{business.owner}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{business.location}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          subtitle="Total paid transactions"
          color="text-green-500"
          bg="bg-green-50"
        />
        <StatCard 
          title="Pending" 
          value={`₹${pendingAmount.toLocaleString()}`} 
          icon={Wallet} 
          subtitle="Awaiting payment"
          color="text-amber-500"
          bg="bg-amber-50"
        />
        <StatCard 
          title="Products" 
          value={products.length.toString()} 
          icon={Package} 
          subtitle="Inventory items"
          color="text-blue-500"
          bg="bg-blue-50"
        />
        <StatCard 
          title="Customers" 
          value={customers.length.toString()} 
          icon={Users} 
          subtitle="Registered clients"
          color="text-purple-500"
          bg="bg-purple-50"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-semibold">{tx.customerName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{tx.totalAmount}</p>
                    <Badge variant={tx.status === 'paid' ? 'default' : 'outline'} className="text-[10px]">
                      {tx.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center py-4 text-muted-foreground italic">No transactions yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-center py-8 text-muted-foreground italic">All inventory levels are looking healthy!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subtitle, color, bg }: any) {
  return (
    <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
