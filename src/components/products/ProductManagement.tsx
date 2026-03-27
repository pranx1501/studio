'use client';

import { useState, useRef } from 'react';
import { Product } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Image as ImageIcon, Sparkles, Loader2, Package, Upload } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      toast({ 
        title: "AI Service Unavailable", 
        description: "Configure your API key to use AI features. Falling back to default.", 
        variant: "destructive" 
      });
      setNewProduct(prev => ({ ...prev, description: `A high-quality ${prev.name || 'product'} perfect for your needs.` }));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
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
          <p className="text-muted-foreground">Manage your inventory and categories.</p>
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
            <DialogContent className="sm:max-w-[600px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
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
                    <Label htmlFor="prod_price">Price (₹)</Label>
                    <Input id="prod_price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {newProduct.imageUrl ? (
                        <img src={newProduct.imageUrl} alt="Product preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                      />
                      <Input 
                        placeholder="Or paste Image URL" 
                        value={newProduct.imageUrl?.startsWith('data:') ? '' : newProduct.imageUrl} 
                        onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                        className="text-xs"
                      />
                    </div>
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
                <div className="space-y-2">
                  <Label htmlFor="prod_cat">Category</Label>
                  <Input id="prod_cat" placeholder="e.g. Apparel" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
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
                  ₹{product.price}
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
