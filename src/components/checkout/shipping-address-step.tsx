
"use client"
import React, { useState, useEffect } from 'react';
import { Home, Briefcase, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/app/profile/address/page';

type ShippingAddressStepProps = {
    selectedAddress: Address | null;
    onSelectAddress: (address: Address) => void;
}

const ShippingAddressStep = ({ selectedAddress, onSelectAddress }: ShippingAddressStepProps) => {
    const { addresses, addAddress } = useAuth();
    const { toast } = useToast();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [type, setType] = useState<'Home' | 'Office'>('Home');
    const [name, setName] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');

    useEffect(() => {
        if (!selectedAddress && addresses.length > 0) {
            const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
            onSelectAddress(defaultAddress);
        }
    }, [addresses, selectedAddress, onSelectAddress]);

    const resetForm = () => {
        setType('Home');
        setName('');
        setAddressLine('');
        setCity('');
        setZip('');
        setCountry('');
    }

     const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        const addressData = {
            type, name, address: addressLine, city, zip, country,
            isDefault: addresses.length === 0
        };

        try {
            await addAddress(addressData);
            toast({ title: "Address Added" });
            setIsSheetOpen(false);
            resetForm();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save address.", variant: "destructive" });
        }
    };


    return (
        <div className="space-y-6">
            <RadioGroup 
                value={selectedAddress?.id} 
                onValueChange={(id) => {
                    const address = addresses.find(a => a.id === id);
                    if (address) onSelectAddress(address);
                }} 
                className="space-y-4"
            >
                {addresses.map((item) => (
                    <Card key={item.id} className="rounded-2xl">
                        <CardContent className="p-4 flex items-start gap-4">
                            <RadioGroupItem value={item.id} id={`addr-checkout-${item.id}`} className="mt-1" />
                            <div className="flex-1">
                                <Label htmlFor={`addr-checkout-${item.id}`} className="flex items-center gap-3 mb-2 cursor-pointer">
                                    <div className="bg-secondary p-2 rounded-full">
                                        {item.type === 'Home' ? <Home className="h-5 w-5 text-foreground"/> : <Briefcase className="h-5 w-5 text-foreground"/>}
                                    </div>
                                    <span className="font-bold text-lg">{item.type}</span>
                                    {item.isDefault && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Default</span>}
                                </Label>
                                <p className="text-muted-foreground">{item.address}, {item.city}, {item.zip}, {item.country}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </RadioGroup>
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="w-full rounded-full" onClick={() => setIsSheetOpen(true)}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Add New Address
                    </Button>
                </SheetTrigger>
                 <SheetContent side="bottom" className="rounded-t-2xl h-[90%]" onInteractOutside={() => resetForm()}>
                    <SheetHeader>
                        <SheetTitle>Add New Address</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSaveAddress} className="p-4 space-y-6 overflow-y-auto h-full">
                        <div className="space-y-2">
                            <Label htmlFor="address-type">Address Type</Label>
                            <RadioGroup value={type} onValueChange={(v) => setType(v as 'Home' | 'Office')} id="address-type" className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Home" id="home-new" />
                                    <Label htmlFor="home-new">Home</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Office" id="office-new" />
                                    <Label htmlFor="office-new">Office</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" placeholder="123 Main St" value={addressLine} onChange={e => setAddressLine(e.target.value)} required/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" placeholder="New York" value={city} onChange={e => setCity(e.target.value)} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zip">ZIP Code</Label>
                                <Input id="zip" placeholder="10001" value={zip} onChange={e => setZip(e.target.value)} required/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" placeholder="United States" value={country} onChange={e => setCountry(e.target.value)} required/>
                        </div>
                         <SheetFooter>
                            <Button type="submit" size="lg" className="w-full rounded-full">Save Address</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

        </div>
    )
}

export default ShippingAddressStep;

    