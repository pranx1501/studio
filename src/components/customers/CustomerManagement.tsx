'use client';

import { useState } from 'react';
import { Customer, Transaction, TransactionItem } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Phone, UserPlus, User, ShoppingBag, IndianRupee, History } from 'lucide-react';

interface CustomerManagementProps {
  customers: Customer[];
  transactions: Transaction[];
  onAddCustomer: (c: Customer) => void;
}

export function CustomerManagement({ customers, transactions, onAddCustomer }: CustomerManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    imageUrl: '',
  });

  const handleSave = () => {
    const customer: Customer = {
      ...newCustomer as Customer,
      id: Math.random().toString(36).substr(2, 9),
    };
    onAddCustomer(customer);
    setIsAdding(false);
    setNewCustomer({ name: '', phone: '', imageUrl: '' });
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const getCustomerStats = (customerId: string) => {
    const customerTx = transactions.filter(t => t.customerId === customerId);
    
    // Aggregate all items purchased by this customer
    const itemsMap = new Map<string, { name: string; quantity: number; total: number }>();
    let totalBilled = 0;
    let totalPaid = 0;

    customerTx.forEach(tx => {
      totalBilled += tx.totalAmount;
      totalPaid += tx.paidAmount;
      tx.items.forEach(item => {
        const existing = itemsMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.total += item.price * item.quantity;
        } else {
          itemsMap.set(item.productId, { 
            name: item.name, 
            quantity: item.quantity, 
            total: item.price * item.quantity 
          });
        }
      });
    });

    return {
      items: Array.from(itemsMap.values()),
      totalBilled,
      totalPaid,
      balanceDue: totalBilled - totalPaid,
      txCount: customerTx.length
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">Customers</h2>
          <p className="text-muted-foreground">Manage relationships and view full purchase history.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone..." 
              className="pl-10 h-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
                <UserPlus className="w-5 h-5" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Register Client</DialogTitle>
                <DialogDescription>Add a new customer to your business directory.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cust_name">Full Name</Label>
                  <Input id="cust_name" placeholder="John Smith" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust_phone">Phone Number</Label>
                  <Input id="cust_phone" placeholder="+91 XXXXX XXXXX" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust_img">Profile Image URL (Optional)</Label>
                  <Input id="cust_img" placeholder="https://..." value={newCustomer.imageUrl} onChange={(e) => setNewCustomer({...newCustomer, imageUrl: e.target.value})} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full h-12 rounded-xl font-bold" disabled={!newCustomer.name || !newCustomer.phone}>Register Customer</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((customer) => {
          const stats = getCustomerStats(customer.id);
          return (
            <Card 
              key={customer.id} 
              className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedCustomer(customer)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 rounded-2xl border-2 border-primary/10">
                    <AvatarImage src={customer.imageUrl} />
                    <AvatarFallback className="bg-secondary text-primary font-bold text-xl">
                      {customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{customer.name}</h3>
                      {stats.balanceDue > 0 && (
                        <Badge variant="destructive" className="text-[10px] h-5">
                          PENDING: ₹{stats.balanceDue}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3 text-primary" />
                      {customer.phone}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-xs font-medium border-t pt-4">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground uppercase text-[10px]">Total Orders</span>
                    <span className="text-primary">{stats.txCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground uppercase text-[10px]">Purchased Items</span>
                    <span className="text-primary">{stats.items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-muted">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No customers found. Grow your network!</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {selectedCustomer && (
            <>
              <div className="p-6 bg-primary text-white">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 rounded-2xl border-4 border-white/20">
                    <AvatarImage src={selectedCustomer.imageUrl} />
                    <AvatarFallback className="bg-white/20 text-white font-bold text-2xl">
                      {selectedCustomer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">{selectedCustomer.name}</DialogTitle>
                    <p className="text-white/80 flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4" /> {selectedCustomer.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary/50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-lg font-black text-primary">₹{getCustomerStats(selectedCustomer.id).totalBilled}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-green-600/70 mb-1">Total Paid</p>
                    <p className="text-lg font-black text-green-600">₹{getCustomerStats(selectedCustomer.id).totalPaid}</p>
                  </div>
                  <div className={`p-4 rounded-2xl text-center ${getCustomerStats(selectedCustomer.id).balanceDue > 0 ? 'bg-amber-50' : 'bg-muted/30'}`}>
                    <p className="text-[10px] uppercase font-bold text-amber-600/70 mb-1">Balance Due</p>
                    <p className={`text-lg font-black ${getCustomerStats(selectedCustomer.id).balanceDue > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      ₹{getCustomerStats(selectedCustomer.id).balanceDue}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold flex items-center gap-2 text-primary">
                    <ShoppingBag className="w-4 h-4" />
                    Product History
                  </h4>
                  <ScrollArea className="h-[250px] rounded-2xl border p-4 bg-muted/10">
                    {getCustomerStats(selectedCustomer.id).items.length > 0 ? (
                      <div className="space-y-3">
                        {getCustomerStats(selectedCustomer.id).items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-border/50">
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">₹{item.total}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic">
                        <History className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No purchases recorded yet.</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              <div className="p-6 border-t bg-muted/30 flex justify-end">
                <Button onClick={() => setSelectedCustomer(null)} className="rounded-xl px-8 font-bold">
                  Close Profile
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
