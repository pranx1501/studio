'use client';

import { useState, useRef } from 'react';
import { Customer, Transaction, Product } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Phone, UserPlus, User, ShoppingBag, History, Upload, IndianRupee, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomerManagementProps {
  customers: Customer[];
  transactions: Transaction[];
  products: Product[];
  onAddCustomer: (c: Customer) => void;
  onAddTransaction: (t: Transaction) => void;
}

export function CustomerManagement({ 
  customers, 
  transactions, 
  products,
  onAddCustomer, 
  onAddTransaction 
}: CustomerManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Registration State
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    imageUrl: '',
  });
  const [selectedItems, setSelectedItems] = useState<{ productId: string, quantity: number }[]>([]);

  // Add Items State for Existing Customer
  const [isAddingItems, setIsAddingItems] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCustomer(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItemToCart = (productId: string) => {
    const existing = selectedItems.find(i => i.productId === productId);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
    }
  };

  const calculateCartTotal = () => {
    return selectedItems.reduce((acc, curr) => {
      const p = products?.find(prod => prod.id === curr.productId);
      return acc + (p?.price || 0) * curr.quantity;
    }, 0);
  };

  const handleFinalSave = () => {
    const customerId = Math.random().toString(36).substr(2, 9);
    const customer: Customer = {
      ...newCustomer as Customer,
      id: customerId,
    };
    onAddCustomer(customer);

    if (selectedItems.length > 0) {
      const total = calculateCartTotal();
      const date = new Date().toISOString();
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        customerId: customerId,
        customerName: customer.name,
        items: selectedItems.map(i => {
          const p = products?.find(prod => prod.id === i.productId)!;
          return { productId: p.id, name: p.name, quantity: i.quantity, price: p.price };
        }),
        subtotal: total,
        discount: 0,
        totalAmount: total,
        paidAmount: 0,
        paymentHistory: [],
        status: 'pending',
        date,
      };
      onAddTransaction(transaction);
    }

    setIsAdding(false);
    setAddStep(1);
    setNewCustomer({ name: '', phone: '', imageUrl: '' });
    setSelectedItems([]);
    toast({ title: "Customer Registered", description: "Relationship and initial order created." });
  };

  const handleAddMoreItems = (customer: Customer) => {
    const total = calculateCartTotal();
    const date = new Date().toISOString();
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: customer.id,
      customerName: customer.name,
      items: selectedItems.map(i => {
        const p = products?.find(prod => prod.id === i.productId)!;
        return { productId: p.id, name: p.name, quantity: i.quantity, price: p.price };
      }),
      subtotal: total,
      discount: 0,
      totalAmount: total,
      paidAmount: 0,
      paymentHistory: [],
      status: 'pending',
      date,
    };
    onAddTransaction(transaction);
    setIsAddingItems(false);
    setSelectedItems([]);
    toast({ title: "Items Added", description: `New order tracked for ${customer.name}.` });
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const getCustomerStats = (customerId: string) => {
    const customerTx = transactions.filter(t => t.customerId === customerId);
    const itemsMap = new Map<string, { name: string; quantity: number; total: number }>();
    const payments: {amount: number, date: string}[] = [];
    let totalBilled = 0;
    let totalPaid = 0;

    customerTx.forEach(tx => {
      totalBilled += tx.totalAmount;
      totalPaid += tx.paidAmount;
      if (tx.paymentHistory) payments.push(...tx.paymentHistory);
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
      txCount: customerTx.length,
      paymentLogs: payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">Customers</h2>
          <p className="text-muted-foreground">Manage relationships and check payment timelines.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              className="pl-10 h-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAdding} onOpenChange={(val) => {
            setIsAdding(val);
            if (!val) setAddStep(1);
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
                <UserPlus className="w-5 h-5" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {addStep === 1 ? 'Register Client' : 'Select Initial Products'}
                </DialogTitle>
                <DialogDescription>
                  {addStep === 1 ? 'Add a new customer to your business.' : `Select items for ${newCustomer.name}.`}
                </DialogDescription>
              </DialogHeader>
              
              {addStep === 1 ? (
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cust_name">Full Name</Label>
                    <Input id="cust_name" placeholder="John Smith" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cust_phone">Phone Number</Label>
                    <Input id="cust_phone" placeholder="+91 XXXXX XXXXX" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2 text-center">
                    <Label>Profile Picture</Label>
                    <div className="flex flex-col items-center gap-2 pt-2">
                      <div 
                        className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {newCustomer.imageUrl ? (
                          <img src={newCustomer.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <Input 
                        placeholder="Or Image URL" 
                        className="text-center text-xs" 
                        value={newCustomer.imageUrl?.startsWith('data:') ? '' : newCustomer.imageUrl} 
                        onChange={(e) => setNewCustomer({...newCustomer, imageUrl: e.target.value})} 
                      />
                    </div>
                  </div>
                  <Button onClick={() => setAddStep(2)} className="w-full h-12 rounded-xl font-bold mt-4" disabled={!newCustomer.name || !newCustomer.phone}>
                    Next: Select Products
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 py-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">Inventory</Label>
                      <ScrollArea className="h-64 border rounded-xl p-2 bg-muted/20">
                        {products?.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white border mb-2 text-sm">
                            <span className="font-medium">{p.name} - ₹{p.price}</span>
                            <Button size="sm" variant="ghost" onClick={() => handleAddItemToCart(p.id)} className="h-7 w-7 p-0 rounded-full hover:bg-primary hover:text-white">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                    <div className="space-y-2">
                      <Label>Selected Items</Label>
                      <ScrollArea className="h-64 border rounded-xl p-2 bg-white">
                        {selectedItems.map(item => {
                          const p = products?.find(prod => prod.id === item.productId)!;
                          return (
                            <div key={item.productId} className="flex justify-between text-xs py-1 border-b mb-1">
                              <span>{p.name} (x{item.quantity})</span>
                              <span className="font-bold">₹{p.price * item.quantity}</span>
                            </div>
                          );
                        })}
                        {selectedItems.length === 0 && <p className="text-xs text-muted-foreground italic text-center pt-10">Cart is empty.</p>}
                      </ScrollArea>
                    </div>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="font-bold text-lg text-primary">Total: ₹{calculateCartTotal()}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setAddStep(1)} className="rounded-xl">Back</Button>
                      <Button onClick={handleFinalSave} className="rounded-xl px-6 font-bold">Finish & Save</Button>
                    </div>
                  </div>
                </div>
              )}
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
              className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => {
                setSelectedCustomer(customer);
                setSelectedItems([]);
              }}
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
                          DUE: ₹{stats.balanceDue}
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
                    <span className="text-muted-foreground uppercase text-[10px]">Orders</span>
                    <span className="text-primary font-black">{stats.txCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground uppercase text-[10px]">Total Value</span>
                    <span className="text-primary font-black">₹{stats.totalBilled}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-muted">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No customers found.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          {selectedCustomer && (
            <>
              <div className="p-8 bg-primary text-white relative">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 rounded-3xl border-4 border-white/20 shadow-lg">
                    <AvatarImage src={selectedCustomer.imageUrl} />
                    <AvatarFallback className="bg-white/20 text-white font-bold text-3xl">
                      {selectedCustomer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-3xl font-black text-white">{selectedCustomer.name}</DialogTitle>
                    <p className="text-white/80 flex items-center gap-2 mt-2 font-medium">
                      <Phone className="w-4 h-4" /> {selectedCustomer.phone}
                    </p>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-muted/30 p-5 rounded-[2rem] text-center border">
                    <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Total Bill</p>
                    <p className="text-xl font-black text-primary">₹{getCustomerStats(selectedCustomer.id).totalBilled}</p>
                  </div>
                  <div className="bg-green-50 p-5 rounded-[2rem] text-center border border-green-100">
                    <p className="text-[10px] uppercase font-black text-green-600/70 mb-1">Paid</p>
                    <p className="text-xl font-black text-green-600">₹{getCustomerStats(selectedCustomer.id).totalPaid}</p>
                  </div>
                  <div className={`p-5 rounded-[2rem] text-center border ${getCustomerStats(selectedCustomer.id).balanceDue > 0 ? 'bg-amber-50 border-amber-100' : 'bg-muted/20 border-border'}`}>
                    <p className="text-[10px] uppercase font-black text-amber-600/70 mb-1">Balance</p>
                    <p className={`text-xl font-black ${getCustomerStats(selectedCustomer.id).balanceDue > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      ₹{getCustomerStats(selectedCustomer.id).balanceDue}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Purchase history */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black flex items-center gap-2 text-primary text-sm uppercase tracking-widest">
                        <ShoppingBag className="w-4 h-4" /> Products
                      </h4>
                      <Dialog open={isAddingItems} onOpenChange={setIsAddingItems}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="rounded-xl h-9 gap-1 font-bold px-4">
                            <Plus className="w-3 h-3" /> New Order
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-3xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Add Items for {selectedCustomer.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <ScrollArea className="h-56 border rounded-xl p-2">
                                <Label className="px-2 pb-2 block text-[10px] uppercase font-bold text-muted-foreground">Product List</Label>
                                {products?.map(p => (
                                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border mb-1 text-xs">
                                    <span>{p.name}</span>
                                    <Button size="sm" variant="ghost" onClick={() => handleAddItemToCart(p.id)} className="h-6 w-6 p-0 rounded-full">
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </ScrollArea>
                              <ScrollArea className="h-56 border rounded-xl p-2 bg-white">
                                <Label className="px-2 pb-2 block text-[10px] uppercase font-bold text-muted-foreground">Current Selection</Label>
                                {selectedItems.map(item => {
                                  const p = products?.find(prod => prod.id === item.productId)!;
                                  return (
                                    <div key={item.productId} className="flex justify-between text-xs py-1 border-b">
                                      <span>{p.name} (x{item.quantity})</span>
                                      <span>₹{p.price * item.quantity}</span>
                                    </div>
                                  );
                                })}
                              </ScrollArea>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <p className="font-bold text-lg">Total: ₹{calculateCartTotal()}</p>
                              <Button onClick={() => handleAddMoreItems(selectedCustomer)} className="rounded-xl px-8 font-bold" disabled={selectedItems.length === 0}>
                                Create Order
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <ScrollArea className="h-[250px] rounded-[2rem] border p-4 bg-muted/10">
                      {getCustomerStats(selectedCustomer.id).items.length > 0 ? (
                        <div className="space-y-3">
                          {getCustomerStats(selectedCustomer.id).items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-border/50">
                              <div>
                                <p className="font-black text-sm">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-primary">₹{item.total}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic">
                          <History className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-xs font-bold uppercase">No products yet</p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Payment Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-black flex items-center gap-2 text-primary text-sm uppercase tracking-widest">
                      <Calendar className="w-4 h-4" /> Payment History
                    </h4>
                    <ScrollArea className="h-[250px] rounded-[2rem] border p-4 bg-green-50/20">
                      {getCustomerStats(selectedCustomer.id).paymentLogs.length > 0 ? (
                        <div className="space-y-3">
                          {getCustomerStats(selectedCustomer.id).paymentLogs.map((log, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-green-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <IndianRupee className="w-3 h-3 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-black text-green-600 text-sm">+ ₹{log.amount}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(log.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic">
                          <IndianRupee className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-xs font-bold uppercase">No payments received</p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t bg-muted/20 flex justify-end">
                <Button onClick={() => setSelectedCustomer(null)} className="rounded-2xl px-12 h-12 font-black shadow-lg">
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
