'use client';

import { useState } from 'react';
import { Transaction, Product, Customer } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Receipt, Calculator, ChevronRight, DollarSign } from 'lucide-react';

interface TransactionManagementProps {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
}

export function TransactionManagement({ 
  transactions, 
  products, 
  customers, 
  onAddTransaction,
  onUpdateTransaction
}: TransactionManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ productId: string, quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const total = selectedItems.reduce((acc, curr) => {
    const prod = products.find(p => p.id === curr.productId);
    return acc + (prod?.price || 0) * curr.quantity;
  }, 0);

  const handleAddItem = (productId: string) => {
    const existing = selectedItems.find(i => i.productId === productId);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
    }
  };

  const handleSave = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: selectedCustomerId,
      customerName: customer?.name || 'Unknown',
      items: selectedItems.map(i => {
        const p = products.find(prod => prod.id === i.productId)!;
        return { productId: p.id, name: p.name, quantity: i.quantity, price: p.price };
      }),
      totalAmount: total,
      paidAmount: paidAmount,
      status: paidAmount >= total ? 'paid' : 'pending',
      date: new Date().toISOString(),
    };
    onAddTransaction(transaction);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedItems([]);
    setSelectedCustomerId('');
    setPaidAmount(0);
  };

  const filtered = transactions.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">Transactions</h2>
          <p className="text-muted-foreground">Log sales, track pending payments, and receipts.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by customer..." 
              className="pl-10 h-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
                <Receipt className="w-5 h-5" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New Transaction</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" /> Add Items
                    </Label>
                    <div className="h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {products.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                          <span>{p.name} - ${p.price}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleAddItem(p.id)} className="h-8 w-8 p-0 rounded-full hover:bg-primary hover:text-white">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-primary" /> Cart Details
                    </Label>
                    <div className="h-64 overflow-y-auto space-y-2 pr-2 border-l pl-4">
                      {selectedItems.map(item => {
                        const p = products.find(prod => prod.id === item.productId)!;
                        return (
                          <div key={item.productId} className="flex justify-between text-sm">
                            <span>{p.name} (x{item.quantity})</span>
                            <span className="font-bold">${p.price * item.quantity}</span>
                          </div>
                        );
                      })}
                      {selectedItems.length === 0 && <p className="text-xs text-muted-foreground italic">Cart is empty.</p>}
                      <div className="pt-4 border-t mt-auto">
                        <div className="flex justify-between text-lg font-bold text-primary">
                          <span>Total</span>
                          <span>${total}</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="paid_amt" className="text-xs">Initial Payment Received ($)</Label>
                          <Input 
                            id="paid_amt" 
                            type="number" 
                            className="h-10 text-right font-bold text-xl" 
                            value={paidAmount} 
                            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full h-12 rounded-xl font-bold" disabled={!selectedCustomerId || selectedItems.length === 0}>
                Confirm Transaction
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((tx) => (
          <Card key={tx.id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className={`w-2 absolute left-0 top-0 bottom-0 ${tx.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{tx.customerName}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                  <div className="text-right flex-1 md:flex-none">
                    <p className="text-xs text-muted-foreground">Pending Amount</p>
                    <p className="font-bold text-amber-600">${tx.totalAmount - tx.paidAmount}</p>
                  </div>
                  <div className="text-right flex-1 md:flex-none">
                    <p className="text-xs text-muted-foreground">Total Sale</p>
                    <p className="font-bold text-primary text-xl">${tx.totalAmount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.status === 'paid' ? 'default' : 'outline'} className="rounded-lg py-1 px-3 uppercase tracking-wider text-[10px]">
                      {tx.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                      onClick={() => {
                        const amt = prompt('Add payment amount:', '0');
                        if (amt) {
                          const val = parseFloat(amt);
                          const newPaid = tx.paidAmount + val;
                          onUpdateTransaction({
                            ...tx,
                            paidAmount: newPaid,
                            status: newPaid >= tx.totalAmount ? 'paid' : 'pending'
                          });
                        }
                      }}
                    >
                      <DollarSign className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex gap-2 overflow-x-auto no-scrollbar">
                {tx.items.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="whitespace-nowrap rounded-lg">
                    {item.name} x{item.quantity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-muted">
            <Receipt className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No sales recorded yet. Ready to trade?</p>
          </div>
        )}
      </div>
    </div>
  );
}