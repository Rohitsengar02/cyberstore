
"use client"
import React, { useState } from 'react';
import { ArrowLeft, Plus, Home, Briefcase, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export interface Address {
    id: string;
    type: 'Home' | 'Office';
    name: string;
    address: string;
    city: string;
    zip: string;
    country: string;
    isDefault: boolean;
}

export default function AddressPage() {
    const { user, addresses, addAddress, updateAddress, deleteAddress } = useAuth();
    const { toast } = useToast();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const [type, setType] = useState<'Home' | 'Office'>('Home');
    const [name, setName] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');

    const resetForm = () => {
        setEditingAddress(null);
        setType('Home');
        setName('');
        setAddressLine('');
        setCity('');
        setZip('');
        setCountry('');
    }

    const handleOpenSheet = (addressToEdit?: Address) => {
        if (addressToEdit) {
            setEditingAddress(addressToEdit);
            setType(addressToEdit.type);
            setName(addressToEdit.name);
            setAddressLine(addressToEdit.address);
            setCity(addressToEdit.city);
            setZip(addressToEdit.zip);
            setCountry(addressToEdit.country);
        } else {
            resetForm();
        }
        setIsSheetOpen(true);
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        const addressData = {
            type, name, address: addressLine, city, zip, country,
            isDefault: editingAddress?.isDefault ?? addresses.length === 0
        };

        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, addressData);
                toast({ title: "Address Updated" });
            } else {
                await addAddress(addressData);
                toast({ title: "Address Added" });
            }
            setIsSheetOpen(false);
            resetForm();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save address.", variant: "destructive" });
        }
    };
    
    const handleDelete = async (id: string) => {
        try {
            await deleteAddress(id);
            toast({ title: "Address Deleted" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete address.", variant: "destructive" });
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/profile">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Profile</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Shopping Address</h1>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenSheet()}>
                                <Plus className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl h-[90%]" onInteractOutside={() => resetForm()}>
                            <SheetHeader>
                                <SheetTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</SheetTitle>
                            </SheetHeader>
                            <form onSubmit={handleSaveAddress} className="p-4 space-y-6 overflow-y-auto h-full">
                                <div className="space-y-2">
                                    <Label htmlFor="address-type">Address Type</Label>
                                    <RadioGroup value={type} onValueChange={(v) => setType(v as 'Home' | 'Office')} id="address-type" className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Home" id="home" />
                                            <Label htmlFor="home">Home</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Office" id="office" />
                                            <Label htmlFor="office">Office</Label>
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
            </header>
            <main className="flex-1 p-4 md:p-6">
                <RadioGroup defaultValue={addresses.find(a => a.isDefault)?.id} className="space-y-4">
                    {addresses.map((item) => (
                        <Card key={item.id} className="rounded-2xl">
                            <CardContent className="p-4 flex items-start gap-4">
                                <RadioGroupItem value={item.id} id={`addr-${item.id}`} className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor={`addr-${item.id}`} className="flex items-center gap-3 mb-2">
                                        <div className="bg-secondary p-2 rounded-full">
                                            {item.type === 'Home' ? <Home className="h-5 w-5 text-foreground"/> : <Briefcase className="h-5 w-5 text-foreground"/>}
                                        </div>
                                        <span className="font-bold text-lg">{item.type}</span>
                                        {item.isDefault && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Default</span>}
                                    </Label>
                                    <p className="text-muted-foreground">{item.address}, {item.city}, {item.zip}, {item.country}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenSheet(item)}><Edit className="h-5 w-5" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </RadioGroup>
            </main>
        </div>
    );
}
