'use client';

import { BusinessInfo, clearAllData } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Building2, MapPin, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface SettingsViewProps {
  business: BusinessInfo;
  onUpdateBusiness: (info: BusinessInfo) => void;
}

export function SettingsView({ business, onUpdateBusiness }: SettingsViewProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BusinessInfo>(business);

  const handleUpdate = () => {
    onUpdateBusiness(formData);
    toast({ title: "Settings Saved", description: "Your business profile has been updated." });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear ALL business data? This action cannot be undone.")) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">Settings</h2>
        <p className="text-muted-foreground">Manage your profile and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>Update your public identity on the platform.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Business Name
                  </Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
                    <User className="w-3 h-3" /> Owner Name
                  </Label>
                  <Input 
                    value={formData.owner} 
                    onChange={(e) => setFormData({...formData, owner: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Business Location
                  </Label>
                  <Input 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleUpdate} className="rounded-xl px-12 h-12 font-black shadow-lg">
                  Save Profile Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-amber-50 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-amber-700">Danger Zone</CardTitle>
                  <CardDescription>Actions that affect your entire dataset.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center justify-between p-6 bg-red-50 rounded-3xl border border-red-100">
                <div className="space-y-1">
                  <p className="font-black text-red-700">Reset All Data</p>
                  <p className="text-xs text-red-600/70">Wipe products, customers, and transactions.</p>
                </div>
                <Button variant="destructive" className="rounded-xl px-6 font-bold gap-2" onClick={handleReset}>
                  <Trash2 className="w-4 h-4" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-primary p-8 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-white" />
                <h3 className="text-2xl font-black tracking-tight">System Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium border-b border-white/20 pb-4">
                  <span>Version</span>
                  <Badge className="bg-white/20 text-white border-none">1.2.0-PRO</Badge>
                </div>
                <div className="flex justify-between items-center text-sm font-medium border-b border-white/20 pb-4">
                  <span>Security</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Encrypted
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium pb-2">
                  <span>Cloud Backup</span>
                  <span className="text-white/60">Manual Only</span>
                </div>
              </div>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          </Card>

          <div className="bg-muted/30 p-8 rounded-[2.5rem] border text-center space-y-2">
            <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-sm font-bold text-muted-foreground">VendorFlow SaaS v1.2</p>
            <p className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-widest">Small Vendor Professional Edition</p>
          </div>
        </div>
      </div>
    </div>
  );
}
