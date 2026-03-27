'use client';

import { useState } from 'react';
import { Customer } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search, Phone, UserPlus, User } from 'lucide-react';

interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (c: Customer) => void;
}

export function CustomerManagement({ customers, onAddCustomer }: CustomerManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">Customers</h2>
          <p className="text-muted-foreground">Keep track of your clients and their contact details.</p>
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
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cust_name">Full Name</Label>
                  <Input id="cust_name" placeholder="John Smith" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust_phone">Phone Number</Label>
                  <Input id="cust_phone" placeholder="+1 (555) 000-0000" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} />
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
        {filtered.map((customer) => (
          <Card key={customer.id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 rounded-2xl border-2 border-primary/10">
                  <AvatarImage src={customer.imageUrl} />
                  <AvatarFallback className="bg-secondary text-primary font-bold text-xl">
                    {customer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{customer.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3 text-primary" />
                    {customer.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-muted">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No customers found. Grow your network!</p>
          </div>
        )}
      </div>
    </div>
  );
}