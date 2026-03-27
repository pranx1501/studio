'use client';

import { useState } from 'react';
import { Product } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Image as ImageIcon, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { aiProductDescriptionGenerator } from '@/ai/flows/ai-product-description-generator-flow';
import { useToast } from '@/hooks/use-toast';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
}

export function ProductManagement({ products, onAddProduct }: ProductManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    keywords: [],
    attributes: {},
  });

  const handleAI = async () => {
    if (!newProduct.name) {
      toast({ title: "Product name required", description: "Please enter a name first.", variant: "destructive" });
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await aiProductDescriptionGenerator({
        productName: newProduct.name,
        keywords: [newProduct.category || 'general', 'premium', 'high quality'],
        attributes: { material: 'standard', color: 'standard' },
        tone: 'professional',
        length: 'medium',
      });
      setNewProduct(prev => ({ ...prev, description: res.description }));
      toast({ title: "AI Generated", description: "Product description refined." });
    } catch (e) {
      toast({ title: "AI Error", description: "Failed to generate description.", variant: "destructive" });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    const product: Product = {
      ...newProduct as Product,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: newProduct.imageUrl || `https://picsum.photos/seed/${Math.random()}/600/400`,
    };
    onAddProduct(product);
    setIsAdding(false);
    setNewProduct({ name: '', description: '', price: 0, imageUrl: '', category: '' });
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">Products</h2>
          <p className="text-muted-foreground">Manage your unlimited inventory and categories.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search items..." 
              className="pl-10 h-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <PackageIcon className="w-6 h-6 text-primary" />
                  New Product
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prod_name">Product Name</Label>
                    <Input id="prod_name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod_price">Price ($)</Label>
                    <Input id="prod_price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="prod_desc">Description</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-primary gap-1.5 hover:bg-primary/10"
                      onClick={handleAI}
                      disabled={isGeneratingAI}
                    >
                      {isGeneratingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Use AI Writer
                    </Button>
                  </div>
                  <Textarea 
                    id="prod_desc" 
                    rows={4} 
                    placeholder="Describe your item..." 
                    value={newProduct.description} 
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prod_cat">Category</Label>
                    <Input id="prod_cat" placeholder="e.g. Apparel" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod_img">Image URL</Label>
                    <Input id="prod_img" placeholder="https://..." value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full h-12 rounded-xl font-bold" disabled={!newProduct.name}>Save Product</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <Card key={product.id} className="group overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-xl transition-all">
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-md shadow-sm border-none">
                  ${product.price}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider px-2 py-0.5 bg-muted rounded-full">
                  {product.category || 'General'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                {product.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-muted">
            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No products found. Start by adding your first item!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  );
}