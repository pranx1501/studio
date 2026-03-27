'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BusinessInfo } from '@/lib/storage';
import { Building2, User, MapPin, Camera, Sparkles, Upload } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (info: BusinessInfo) => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<BusinessInfo>>({
    name: '',
    owner: '',
    location: '',
    profileImage: '',
    onboarded: true,
  });

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else onComplete(formData as BusinessInfo);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden border-none rounded-2xl">
        <div className="h-2 bg-muted w-full">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
        
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary font-headline">Welcome to VendorFlow</CardTitle>
          <CardDescription className="text-base">Let's set up your professional business profile</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Business Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Blue Ribbon Boutique" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 border-muted focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner" className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Owner Name
                </Label>
                <Input 
                  id="owner" 
                  placeholder="e.g. Jane Doe" 
                  value={formData.owner} 
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="h-12 border-muted focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Location
                </Label>
                <Input 
                  id="location" 
                  placeholder="e.g. Manhattan, New York" 
                  value={formData.location} 
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12 border-muted focus:ring-primary"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4 text-primary" /> Business Profile Image
                </Label>
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div 
                    className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary transition-colors cursor-pointer group relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Upload Image</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <Input 
                    type="text" 
                    placeholder="Or paste image URL" 
                    className="text-center text-xs h-10" 
                    value={formData.profileImage?.startsWith('data:') ? '' : formData.profileImage} 
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">This image will represent your brand across the platform.</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3 pb-10 pt-4">
          {step > 1 && (
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button 
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold" 
            onClick={handleNext}
            disabled={!formData.name || !formData.owner || !formData.location}
          >
            {step === 2 ? 'Launch Platform' : 'Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
