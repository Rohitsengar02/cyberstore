
"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, GripVertical, Trash2, Loader2, Edit, Presentation, Package, FileImage } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';


export type HomepageSection = {
    id: string;
    title: string;
    order: number;
    createdAt: any;
    sectionType: 'multi-product' | 'single-product';
}

export default function CustomizePage() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionType, setNewSectionType] = useState<'multi-product' | 'single-product'>('multi-product');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "homepageSections"), orderBy("order"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sectionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomepageSection));
            setSections(sectionsData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddSection = async () => {
        if (!newSectionTitle) {
            toast({ title: "Title is required", variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            let sectionData: any = {
                title: newSectionTitle,
                order: sections.length,
                sectionType: newSectionType,
                createdAt: serverTimestamp()
            };

            if (newSectionType === 'multi-product') {
                sectionData = {
                    ...sectionData,
                    productIds: [],
                    displayType: 'slider',
                    showViewAll: true,
                    productsPerViewDesktop: 5,
                    productsPerViewMobile: 2,
                    sliderSettings: {
                        autoplay: false,
                        loop: true,
                        speed: 3000,
                    },
                }
            } else {
                 sectionData = {
                    ...sectionData,
                    productId: '',
                    discountCode: 'SALE20',
                    offerEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
                }
            }

            await addDoc(collection(db, 'homepageSections'), sectionData);

            toast({ title: "Section Added!" });
            setNewSectionTitle('');
            setNewSectionType('multi-product');
            setIsAddDialogOpen(false);
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Could not add section.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }

    const handleDeleteSection = async (sectionId: string) => {
        try {
            await deleteDoc(doc(db, 'homepageSections', sectionId));
            toast({ title: "Section Deleted" });
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Could not delete section.", variant: 'destructive' });
        }
    };


    if(isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Homepage Customization</h1>
                 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Section
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Homepage Section</DialogTitle>
                            <DialogDescription>Choose a title and type for your new section.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="section-title">Section Title</Label>
                                <Input 
                                    id="section-title"
                                    placeholder="e.g. Featured Products"
                                    value={newSectionTitle}
                                    onChange={(e) => setNewSectionTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Section Type</Label>
                                 <RadioGroup value={newSectionType} onValueChange={(v) => setNewSectionType(v as any)} className="mt-2 grid grid-cols-2 gap-4">
                                     <div>
                                        <RadioGroupItem value="multi-product" id="multi-product" className="peer sr-only" />
                                        <Label
                                            htmlFor="multi-product"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <Package className="mb-3 h-6 w-6" />
                                            Multiple Products
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="single-product" id="single-product" className="peer sr-only" />
                                        <Label
                                            htmlFor="single-product"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <FileImage className="mb-3 h-6 w-6" />
                                            Single Product
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddSection} disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Add Section
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Core Sections</CardTitle>
                </CardHeader>
                <CardContent>
                     <Card className="flex items-center p-4">
                        <Presentation className="h-5 w-5 text-muted-foreground mr-4" />
                        <div className="flex-grow">
                            <h3 className="font-semibold text-lg">Hero Section</h3>
                            <p className="text-sm text-muted-foreground">Manage banners and cards.</p>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                                <Link href={`/admin/dashboard/customize/hero`}>
                                    <Edit className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div>
                        <CardTitle>Content Sections</CardTitle>
                        <CardDescription>Add and manage your homepage content sections.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sections.map((section) => (
                        <Card key={section.id} className="flex items-center p-4">
                            <GripVertical className="h-5 w-5 text-muted-foreground mr-4" />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{section.sectionType?.replace('-', ' ')}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                                    <Link href={`/admin/dashboard/customize/${section.id}`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" className="h-9 w-9">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete this section.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteSection(section.id)}>
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
