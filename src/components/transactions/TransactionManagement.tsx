'use client';

import { useState } from 'react';
import { Transaction, Product, Customer, PaymentRecord } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Receipt, Calculator, IndianRupee, Plus, Printer, Share2, Tag, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [discount, setDiscount] = useState<number>(0);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const subtotal = selectedItems.reduce((acc, curr) => {
    const prod = products.find(p => p.id === curr.productId);
    return acc + (prod?.price || 0) * curr.quantity;
  }, 0);

  const total = Math.max(0, subtotal - discount);

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
    const date = new Date().toISOString();
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: selectedCustomerId,
      customerName: customer?.name || 'Unknown',
      items: selectedItems.map(i => {
        const p = products.find(prod => prod.id === i.productId)!;
        return { productId: p.id, name: p.name, quantity: i.quantity, price: p.price };
      }),
      subtotal,
      discount,
      totalAmount: total,
      paidAmount: paidAmount,
      paymentHistory: paidAmount > 0 ? [{ amount: paidAmount, date }] : [],
      status: paidAmount >= total ? 'paid' : 'pending',
      date,
    };
    onAddTransaction(transaction);
    setIsAdding(false);
    resetForm();
    toast({ title: "Transaction Saved", description: "The sale has been recorded successfully." });
  };

  const resetForm = () => {
    setSelectedItems([]);
    setSelectedCustomerId('');
    setPaidAmount(0);
    setDiscount(0);
  };

  const handleAddPayment = (tx: Transaction) => {
    const amt = prompt('Add payment amount (₹):', '0');
    if (amt) {
      const val = parseFloat(amt);
      if (isNaN(val) || val <= 0) return;
      
      const newPaid = tx.paidAmount + val;
      const history = tx.paymentHistory || [];
      const updatedTx: Transaction = {
        ...tx,
        paidAmount: newPaid,
        paymentHistory: [...history, { amount: val, date: new Date().toISOString() }],
        status: newPaid >= tx.totalAmount ? 'paid' : 'pending'
      };
      onUpdateTransaction(updatedTx);
      toast({ title: "Payment Recorded", description: `Added ₹${val} to ${tx.customerName}'s account.` });
    }
  };

  const filtered = transactions.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">Transactions</h2>
          <p className="text-muted-foreground">Log sales, apply discounts, and track payments.</p>
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
            <DialogContent className="sm:max-w-[800px] rounded-3xl max-h-[95vh] overflow-y-auto p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl font-bold">Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 p-6">
                <div className="space-y-2">
                  <Label>Customer Select</Label>
                  <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Which customer is buying?" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 font-bold text-primary">
                      <Plus className="w-4 h-4" /> Available Items
                    </Label>
                    <div className="h-72 overflow-y-auto pr-2 space-y-2 custom-scrollbar bg-muted/20 p-2 rounded-2xl border">
                      {products.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white shadow-sm text-sm border">
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">₹{p.price}</p>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => handleAddItem(p.id)} className="h-8 w-8 p-0 rounded-full hover:bg-primary hover:text-white transition-colors">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 font-bold text-primary">
                      <Calculator className="w-4 h-4" /> Summary
                    </Label>
                    <div className="flex flex-col h-72">
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2 border rounded-2xl p-4 bg-white mb-4">
                        {selectedItems.map(item => {
                          const p = products.find(prod => prod.id === item.productId)!;
                          return (
                            <div key={item.productId} className="flex justify-between text-sm py-1 border-b last:border-0 border-dashed">
                              <span className="text-muted-foreground">{p.name} <span className="text-[10px] font-bold text-primary">x{item.quantity}</span></span>
                              <span className="font-bold">₹{p.price * item.quantity}</span>
                            </div>
                          );
                        })}
                        {selectedItems.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-10">Cart is empty.</p>}
                      </div>
                      
                      <div className="space-y-3 bg-secondary/30 p-4 rounded-2xl border border-primary/10">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span className="font-medium">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                          <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Discount</span>
                          <Input 
                            type="number" 
                            className="w-24 h-8 text-right bg-white rounded-lg text-xs" 
                            value={discount} 
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
                          />
                        </div>
                        <div className="flex justify-between text-lg font-black text-primary pt-1 border-t border-primary/10">
                          <span>Grand Total</span>
                          <span>₹{total}</span>
                        </div>
                        <div className="pt-2">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Initial Payment (₹)</Label>
                          <Input 
                            type="number" 
                            className="h-10 text-right font-black text-xl bg-white border-primary/20" 
                            value={paidAmount} 
                            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-muted/30">
                <Button onClick={handleSave} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={!selectedCustomerId || selectedItems.length === 0}>
                  Confirm & Generate Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((tx) => (
          <Card key={tx.id} className="rounded-3xl border-none shadow-sm hover:shadow-lg transition-all overflow-hidden group relative">
            <div className={`w-2 absolute left-0 top-0 bottom-0 ${tx.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                    <Receipt className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight">{tx.customerName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] bg-white border-muted-foreground/20">
                        {new Date(tx.date).toLocaleDateString()}
                      </Badge>
                      <Badge variant={tx.status === 'paid' ? 'default' : 'outline'} className="rounded-md py-0.5 px-2 uppercase tracking-widest text-[9px] font-black">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                  <div className="bg-muted/30 p-3 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Items</p>
                    <p className="font-bold">{tx.items.length}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Discount</p>
                    <p className="font-bold text-green-600">₹{tx.discount || 0}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-amber-600 mb-1">Due</p>
                    <p className="font-black text-amber-600 text-lg">₹{tx.totalAmount - tx.paidAmount}</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-primary mb-1">Total</p>
                    <p className="font-black text-primary text-xl">₹{tx.totalAmount}</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl h-11 border-primary/20 text-primary hover:bg-primary/10 font-bold gap-2"
                    onClick={() => setReceiptTx(tx)}
                  >
                    <Printer className="w-4 h-4" /> Receipt
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl h-11 font-bold gap-2"
                    disabled={tx.status === 'paid'}
                    onClick={() => handleAddPayment(tx)}
                  >
                    <IndianRupee className="w-4 h-4" /> Add Pay
                  </Button>
                </div>
              </div>

              {/* Payment History Preview */}
              {tx.paymentHistory && tx.paymentHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-dashed">
                  <p className="text-[10px] uppercase font-black text-muted-foreground mb-3 flex items-center gap-2">
                    <History className="w-3 h-3" /> Payment Timeline
                  </p>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {tx.paymentHistory.map((p, i) => (
                      <div key={i} className="flex flex-col items-center bg-white border border-primary/10 p-3 rounded-2xl min-w-[100px] shadow-sm">
                        <span className="text-[10px] text-muted-foreground">{new Date(p.date).toLocaleDateString()}</span>
                        <span className="font-black text-primary">₹{p.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Receipt Dialog */}
      <Dialog open={!!receiptTx} onOpenChange={(val) => !val && setReceiptTx(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden">
          {receiptTx && (
            <div className="p-8 bg-white space-y-8 print:p-0">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4">V</div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Receipt</h2>
                <p className="text-sm text-muted-foreground">ID: #{receiptTx.id}</p>
              </div>

              <div className="border-y border-dashed py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-bold">{receiptTx.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-bold">{new Date(receiptTx.date).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                {receiptTx.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price} x {item.quantity}</p>
                    </div>
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="bg-secondary/50 p-6 rounded-3xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{receiptTx.subtotal || receiptTx.totalAmount + (receiptTx.discount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount:</span>
                  <span>-₹{receiptTx.discount || 0}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-primary pt-2 border-t border-primary/20">
                  <span>Total Due:</span>
                  <span>₹{receiptTx.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Paid So Far:</span>
                  <span className="text-green-600 font-bold">₹{receiptTx.paidAmount}</span>
                </div>
                {receiptTx.totalAmount - receiptTx.paidAmount > 0 && (
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="text-amber-600 font-black">₹{receiptTx.totalAmount - receiptTx.paidAmount}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-muted-foreground font-medium">Thank you for your business!</p>
              </div>

              <div className="flex gap-3 print:hidden pt-4 border-t">
                <Button variant="outline" className="flex-1 rounded-xl gap-2 font-bold" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button className="flex-1 rounded-xl gap-2 font-bold" onClick={() => {
                  navigator.share?.({
                    title: `Receipt for ${receiptTx.customerName}`,
                    text: `Total: ₹${receiptTx.totalAmount}. Paid: ₹${receiptTx.paidAmount}. Balance: ₹${receiptTx.totalAmount - receiptTx.paidAmount}`,
                  }).catch(() => toast({ title: "Shared", description: "Receipt details copied." }));
                }}>
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
