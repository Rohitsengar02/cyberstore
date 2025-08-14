
"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, PlusCircle, Trash2, Search, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { doc, onSnapshot, getDoc, updateDoc, collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const toJSON = (data: DocumentData): any => {
    // A simple converter, you might need a more robust one for Timestamps etc.
    return JSON.parse(JSON.stringify(data, (key, value) => {
        if (value && value.seconds !== undefined) { // Basic check for Firestore Timestamp
            return new Date(value.seconds * 1000).toISOString();
        }
        return value;
    }));
};

const ProductSelectorDialog = ({ allProducts, selectedIds, onConfirm, singleSelection = false }: { allProducts: Product[], selectedIds: string[], onConfirm: (newSelection: string[]) => void, singleSelection?: boolean }) => {
    const [open, setOpen] = useState(false);
    const [draftSelection, setDraftSelection] = useState(selectedIds);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setDraftSelection(selectedIds);
    }, [selectedIds, open]);

    const handleSelect = (productId: string) => {
        if (singleSelection) {
            setDraftSelection([productId]);
        } else {
            setDraftSelection(prev => 
                prev.includes(productId)
                    ? prev.filter(id => id !== productId)
                    : [...prev, productId]
            );
        }
    };

    const handleConfirm = () => {
        onConfirm(draftSelection);
        setOpen(false);
    };

    const filteredProducts = allProducts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {selectedIds.length > 0 ? `${selectedIds.length} product(s) selected` : "Select Products"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Products</DialogTitle>
                    <DialogDescription>Choose the products you want to feature in this section.</DialogDescription>
                </DialogHeader>
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-2">
                        {filteredProducts.map(p => (
                            <div
                                key={p.id}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary cursor-pointer"
                                onClick={() => handleSelect(p.id)}
                            >
                                <Checkbox
                                    checked={draftSelection.includes(p.id)}
                                    onCheckedChange={() => handleSelect(p.id)}
                                />
                                <Image src={p.mainImage} alt={p.title} width={40} height={40} className="rounded-md" />
                                <Label htmlFor={`product-${p.id}`} className="flex-grow font-normal cursor-pointer">
                                    {p.title}
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm ({draftSelection.length})</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const SingleProductSectionEditor = ({ section, setSection, allProducts }: { section: any, setSection: (s: any) => void, allProducts: Product[] }) => {

    const handleUpdate = (field: string, value: any) => {
        setSection((prev: any) => ({ ...prev, [field]: value }));
    };

    const selectedProduct = allProducts.find(p => p.id === section.productId);

    return (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Featured Product</CardTitle>
                    <CardDescription>Select the single product to feature in this promotional section.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ProductSelectorDialog
                        allProducts={allProducts}
                        selectedIds={section.productId ? [section.productId] : []}
                        onConfirm={(newSelection) => handleUpdate('productId', newSelection[0] || '')}
                        singleSelection={true}
                    />
                    {selectedProduct && (
                        <div className="mt-4 flex items-center gap-4 p-2 border rounded-lg">
                            <Image src={selectedProduct.mainImage} alt={selectedProduct.title} width={40} height={40} className="rounded-md" />
                            <span className="flex-grow font-medium">{selectedProduct.title}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Offer Details</CardTitle>
                    <CardDescription>Set the discount code and expiration date for this promotion.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Discount Code</Label>
                        <Input value={section.discountCode || ''} onChange={(e) => handleUpdate('discountCode', e.target.value)} placeholder="e.g. SALE20"/>
                    </div>
                     <div className="space-y-2">
                        <Label>Offer End Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !section.offerEndDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {section.offerEndDate ? format(new Date(section.offerEndDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={section.offerEndDate ? new Date(section.offerEndDate) : undefined}
                                onSelect={(date) => handleUpdate('offerEndDate', date?.toISOString())}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const MultiProductSectionEditor = ({ section, setSection, allProducts }: { section: any, setSection: (s: any) => void, allProducts: Product[] }) => {
    
    const handleUpdate = (field: string, value: any) => {
        setSection((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSliderSettingUpdate = (field: string, value: any) => {
        setSection((prev: any) => ({
            ...prev,
            sliderSettings: {
                ...prev.sliderSettings,
                [field]: value
            }
        }));
    };
    
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>Add, remove, and reorder products for this section.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ProductSelectorDialog 
                            allProducts={allProducts}
                            selectedIds={section.productIds || []}
                            onConfirm={(newSelection) => handleUpdate('productIds', newSelection)}
                        />
                        <div className="space-y-2">
                            {section.productIds?.map((productId: string) => {
                                 const product = allProducts.find(p => p.id === productId);
                                 if (!product) return null;
                                 return (
                                    <div key={product.id} className="flex items-center gap-4 p-2 border rounded-lg">
                                        <Image src={product.mainImage} alt={product.title} width={40} height={40} className="rounded-md" />
                                        <span className="flex-grow font-medium">{product.title}</span>
                                        <Button variant="ghost" size="icon" onClick={() => handleUpdate('productIds', section.productIds.filter((id: string) => id !== productId))}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                 )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customization</CardTitle>
                        <CardDescription>Adjust the appearance and behavior of this section.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Section Title</Label>
                            <Input value={section.title} onChange={(e) => handleUpdate('title', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Show "View All" link</Label>
                            <Switch checked={section.showViewAll} onCheckedChange={(val) => handleUpdate('showViewAll', val)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Display Style</Label>
                            <RadioGroup value={section.displayType} onValueChange={(val) => handleUpdate('displayType', val)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="slider" id="slider" />
                                    <Label htmlFor="slider">Slider</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="grid" id="grid" />
                                    <Label htmlFor="grid">Grid</Label>
                                </div>
                            </RadioGroup>
                        </div>
                         <div className="space-y-2">
                            <Label>Products per View (Desktop)</Label>
                            <Select value={String(section.productsPerViewDesktop)} onValueChange={(val) => handleUpdate('productsPerViewDesktop', Number(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Number of products" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[3, 4, 5, 6, 7].map(n => <SelectItem key={n} value={String(n)}>{n} Products</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        
                         <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold text-sm">Slider Settings</h4>
                            <div className="flex items-center justify-between">
                                <Label>Autoplay</Label>
                                <Switch checked={section.sliderSettings?.autoplay} onCheckedChange={(val) => handleSliderSettingUpdate('autoplay', val)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Loop</Label>
                                <Switch checked={section.sliderSettings?.loop} onCheckedChange={(val) => handleSliderSettingUpdate('loop', val)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Animation Speed (ms)</Label>
                                <Slider value={[section.sliderSettings?.speed || 3000]} onValueChange={([val]) => handleSliderSettingUpdate('speed', val)} max={10000} step={500} />
                                <p className="text-xs text-muted-foreground text-right">{(section.sliderSettings?.speed || 3000) / 1000} seconds</p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function CustomizeSectionPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const sectionId = params.section as string;

    const [section, setSection] = useState<any>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (!sectionId) return;

        const sectionRef = doc(db, 'homepageSections', sectionId);
        const productsRef = collection(db, 'products');

        const unsubSection = onSnapshot(sectionRef, (doc) => {
            if (doc.exists()) {
                setSection({ id: doc.id, ...doc.data() });
            } else {
                toast({ title: "Section not found", variant: 'destructive' });
                router.push('/admin/dashboard/customize');
            }
            setIsLoading(false);
        });

        const fetchProducts = async () => {
            const snapshot = await getDocs(productsRef);
            setAllProducts(snapshot.docs.map(d => toJSON({ id: d.id, ...d.data() })));
        };

        fetchProducts();

        return () => unsubSection();
    }, [sectionId, router, toast]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { id, createdAt, ...dataToSave } = section;
            await updateDoc(doc(db, 'homepageSections', sectionId), dataToSave);
            toast({ title: "Section saved successfully!" });
        } catch (e) {
            console.error(e);
            toast({ title: "Error saving section", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!section) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{section.title}</h1>
                    <p className="text-muted-foreground">Customize the content and appearance of this section.</p>
                </div>
                 <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Discard</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {section.sectionType === 'single-product' ? (
                <SingleProductSectionEditor section={section} setSection={setSection} allProducts={allProducts} />
            ) : (
                <MultiProductSectionEditor section={section} setSection={setSection} allProducts={allProducts} />
            )}
        </div>
    );
}
