
"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type StoreSettings = {
    logoType: 'text' | 'image';
    logoText: string;
    logoUrl: string;
    storeName: string;
    storeEmail: string;
    storeAddress: string;
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<StoreSettings>({
        logoType: 'text',
        logoText: 'NoirCart',
        logoUrl: '',
        storeName: 'NoirCart',
        storeEmail: 'contact@noircart.com',
        storeAddress: '123 Commerce St, Online City, World'
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            const docRef = doc(db, "settings", "store");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data() as StoreSettings);
            }
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
            setSettings({ ...settings, logoUrl: URL.createObjectURL(e.target.files[0]), logoType: 'image' });
        }
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            let finalLogoUrl = settings.logoUrl;
            if (logoFile) {
                 const formData = new FormData();
                formData.append('file', logoFile);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio');

                const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                finalLogoUrl = data.secure_url;
            }

            const settingsToSave = { ...settings, logoUrl: finalLogoUrl };
            
            await setDoc(doc(db, "settings", "store"), settingsToSave);
            toast({ title: "Settings saved successfully!" });
        } catch (error) {
            console.error(error);
            toast({ title: "Error saving settings", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Store Details</CardTitle>
                    <CardDescription>Update your store's name, contact information, and logo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 rounded-md">
                                <AvatarImage src={settings.logoType === 'image' ? settings.logoUrl : ''} alt="Store Logo" />
                                <AvatarFallback className="rounded-md">{settings.logoText.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <Input 
                                id="logo-text" 
                                placeholder="Store Name" 
                                value={settings.logoText} 
                                onChange={(e) => setSettings({ ...settings, logoText: e.target.value, logoType: 'text' })}
                                className="max-w-xs"
                             />
                             <span className="text-muted-foreground">OR</span>
                             <Button variant="outline" asChild>
                                <label htmlFor="logo-upload">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                    <input type="file" id="logo-upload" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </Button>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="store-name">Store Name</Label>
                            <Input id="store-name" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="store-email">Store Email</Label>
                            <Input id="store-email" type="email" value={settings.storeEmail} onChange={e => setSettings({...settings, storeEmail: e.target.value})} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="store-address">Store Address</Label>
                        <Textarea id="store-address" value={settings.storeAddress} onChange={e => setSettings({...settings, storeAddress: e.target.value})} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Store Details
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Localization</CardTitle>
                    <CardDescription>Set your store's language, currency, and timezone.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select defaultValue="en-us">
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en-us">English (United States)</SelectItem>
                                <SelectItem value="es-es">Spanish (Spain)</SelectItem>
                                <SelectItem value="fr-fr">French (France)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                         <Select defaultValue="usd">
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="utc-5">
                            <SelectTrigger id="timezone">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="utc-8">UTC-08:00 (Pacific Time)</SelectItem>
                                <SelectItem value="utc-5">UTC-05:00 (Eastern Time)</SelectItem>
                                <SelectItem value="utc+0">UTC+00:00 (GMT)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>Save Localization</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage your email notification preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">New Orders</h3>
                            <p className="text-sm text-muted-foreground">Receive an email for every new order.</p>
                        </div>
                        <Switch id="new-orders-switch" defaultChecked/>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">New Customer Sign-ups</h3>
                            <p className="text-sm text-muted-foreground">Get notified when a new customer registers.</p>
                        </div>
                        <Switch id="new-customer-switch" />
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Weekly Summary</h3>
                            <p className="text-sm text-muted-foreground">Receive a weekly performance report.</p>
                        </div>
                        <Switch id="weekly-summary-switch" defaultChecked/>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>Save Notifications</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
