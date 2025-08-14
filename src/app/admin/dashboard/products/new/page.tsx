
"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, X, GripVertical, Image as ImageIcon, PlusCircle, Palette, Loader2, Sparkles, Check, Search } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, DocumentData } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GenerateProductInput, generateProduct } from '@/ai/flows/generate-product-flow';
import type { Product } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';


type VariantOption = {
    name: string;
    image: File | null;
    price: string;
};

type Variant = {
    type: string;
    options: VariantOption[];
};

type Category = {
    id: string;
    title: string;
};

// Helper to convert data URI to File
const dataUriToBlob = (dataUri: string): Blob => {
    const byteString = atob(dataUri.split(',')[1]);
    const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

const RelatedProductSelector = ({ title, allProducts, selectedProducts, onSelectionChange }: { title: string, allProducts: Product[], selectedProducts: string[], onSelectionChange: (newSelection: string[]) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSelect = (productId: string) => {
        const newSelection = selectedProducts.includes(productId)
            ? selectedProducts.filter(id => id !== productId)
            : [...selectedProducts, productId];
        onSelectionChange(newSelection);
    };

    const filteredProducts = allProducts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <h4 className="font-medium mb-2">{title}</h4>
            <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ScrollArea className="h-48 rounded-md border p-2">
                <div className="space-y-2">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`related-${title}-${p.id}`}
                                checked={selectedProducts.includes(p.id)}
                                onCheckedChange={() => handleSelect(p.id)}
                            />
                            <Label htmlFor={`related-${title}-${p.id}`} className="text-sm font-normal cursor-pointer">
                                {p.title}
                            </Label>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};


const AddProductPage = () => {
    const [title, setTitle] = useState('');
    const [shortDesc, setShortDesc] = useState('');
    const [longDesc, setLongDesc] = useState('');
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
    const [regularPrice, setRegularPrice] = useState('');
    const [offeredPrice, setOfferedPrice] = useState('');
    const [sku, setSku] = useState('');
    const [stock, setStock] = useState('');
    const [variants, setVariants] = useState<Variant[]>([{ type: 'Color', options: [{ name: '', image: null, price: '' }] }]);
    const [status, setStatus] = useState('published');
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>(['','','']);
    const [tags, setTags] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [suggestedProducts, setSuggestedProducts] = useState<string[]>([]);
    const [quickAddProducts, setQuickAddProducts] = useState<string[]>([]);
    const [deliveryReturns, setDeliveryReturns] = useState('');


    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [aiProductName, setAiProductName] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setAllCategories(categoriesData);
        });
         const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setAllProducts(productsData);
        });
        return () => {
            unsubscribeCategories();
            unsubscribeProducts();
        }
    }, []);

    const addVariant = () => {
        setVariants([...variants, { type: 'Color', options: [{ name: '', image: null, price: '' }] }]);
    };

    const addVariantOption = (variantIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].options.push({ name: '', image: null, price: '' });
        setVariants(newVariants);
    };

    const removeVariantOption = (variantIndex: number, optionIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
        setVariants(newVariants);
    };

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio');

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Image upload failed:', error);
            toast({ title: "Image upload failed", variant: "destructive" });
            return null;
        }
    };


    const handleSaveProduct = async () => {
        setIsLoading(true);
        try {
            let mainImageUrlToSave = mainImageUrl;
            if (mainImage && !mainImageUrl?.startsWith('https://res.cloudinary.com')) {
                mainImageUrlToSave = await handleImageUpload(mainImage);
            }

            const galleryImageUrlsToSave = await Promise.all(
                galleryImages.map(async (file, index) => {
                    const existingUrl = galleryImageUrls[index];
                    if (existingUrl && existingUrl.startsWith('https://res.cloudinary.com')) return existingUrl;
                    return handleImageUpload(file);
                })
            );


            const productData = {
                title,
                shortDesc,
                longDesc,
                mainImage: mainImageUrlToSave,
                gallery: galleryImageUrlsToSave.filter(url => url !== null),
                pricing: {
                    regular: parseFloat(regularPrice) || 0,
                    offered: parseFloat(offeredPrice) || 0,
                },
                sku,
                inventory: {
                    stock: parseInt(stock, 10) || 0,
                    views: 0
                },
                variants: variants.map(v => ({
                    type: v.type,
                    options: v.options.map(o => ({name: o.name, price: o.price}))
                })),
                status,
                categories: selectedCategories,
                features,
                tags: tags.split(',').map(t => t.trim()),
                relatedProducts: {
                    suggested: suggestedProducts,
                    quickAdd: quickAddProducts
                },
                deliveryReturns,
                createdAt: new Date(),
            };

            await addDoc(collection(db, "products"), productData);

            toast({ title: "Success", description: "Product saved successfully!" });
            router.push('/admin/dashboard/products');

        } catch (error) {
            console.error("Error adding document: ", error);
            toast({ title: "Error", description: "Could not save product.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateWithAi = async () => {
        if (!aiProductName || !aiPrompt) {
            toast({ title: "Missing fields", description: "Please provide a product name and prompt.", variant: "destructive" });
            return;
        }
        setIsAiLoading(true);
        try {
            const input: GenerateProductInput = {
                productName: aiProductName,
                prompt: aiPrompt,
            };
            const result = await generateProduct(input);

            setTitle(result.title);
            setShortDesc(result.shortDesc);
            setLongDesc(result.longDesc);
            setRegularPrice(String(result.pricing.regular));
            setOfferedPrice(String(result.pricing.offered));
            setSku(result.sku);
            setStock(String(result.stock));
            setDeliveryReturns(result.deliveryReturns);
            setSelectedCategories(result.categories);
            setFeatures(result.features);
            setTags(result.tags.join(', '));
            setVariants(result.variants.map(v => ({
                type: v.type,
                options: v.options.map(o => ({name: o.name, price: String(o.price), image: null}))
            })))

            // Handle main image
            if (result.mainImage) {
                const blob = dataUriToBlob(result.mainImage);
                const file = new File([blob], "main-image.png", { type: "image/png" });
                const uploadedUrl = await handleImageUpload(file);
                if (uploadedUrl) {
                    setMainImage(file);
                    setMainImageUrl(uploadedUrl);
                }
            }

            // Handle gallery images
            if (result.galleryImages && result.galleryImages.length > 0) {
                const galleryFiles: File[] = [];
                const galleryUrls: string[] = [];

                for (let i = 0; i < result.galleryImages.length; i++) {
                    const dataUri = result.galleryImages[i];
                    const blob = dataUriToBlob(dataUri);
                    const file = new File([blob], `gallery-image-${i}.png`, { type: "image/png" });
                    const uploadedUrl = await handleImageUpload(file);
                    if (uploadedUrl) {
                        galleryFiles.push(file);
                        galleryUrls.push(uploadedUrl);
                    }
                }
                setGalleryImages(galleryFiles);
                setGalleryImageUrls(galleryUrls);
            }

            toast({ title: "Content Generated!", description: "Product details have been filled in." });
            setIsAiDialogOpen(false);

        } catch (e) {
             toast({ title: "AI Generation Failed", description: "Could not generate product details.", variant: "destructive" });
             console.error(e);
        } finally {
            setIsAiLoading(false);
        }
    }


  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" onClick={() => router.back()}>Discard</Button>
                <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                    <DialogTrigger asChild>
                         <Button>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate with AI
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Generate Product with AI</DialogTitle>
                            <DialogDescription>
                                Describe the product you want to create, and AI will do the rest.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                           <div className="space-y-2">
                                <Label htmlFor="ai-product-name">Product Name</Label>
                                <Input id="ai-product-name" placeholder="e.g. 'Classic Leather Biker Jacket'" value={aiProductName} onChange={e => setAiProductName(e.target.value)} />
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="ai-prompt">Prompt</Label>
                                <Textarea id="ai-prompt" placeholder="Describe the product's style, materials, key features, and target audience. For example: 'A rugged, vintage-style men's biker jacket made from genuine sheepskin leather. It has a classic asymmetrical zipper, quilted shoulder panels, and multiple zippered pockets. Targeted at young adults who love a timeless rock-and-roll look.'" rows={5} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                           </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleGenerateWithAi} disabled={isAiLoading}>
                                {isAiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isAiLoading ? 'Generating...' : 'Generate'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                 <Button onClick={handleSaveProduct} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Saving...' : 'Save Product'}
                </Button>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="product-title">Product Title</Label>
                            <Input id="product-title" placeholder="e.g. Summer T-Shirt" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="short-desc">Short Description</Label>
                            <Textarea id="short-desc" placeholder="Write a brief description..." value={shortDesc} onChange={e => setShortDesc(e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="long-desc">Long Description</Label>
                            <div className="border rounded-md">
                                <div className="p-2 border-b flex gap-2 items-center">
                                    <Button variant="ghost" size="icon"><ImageIcon className="w-4 h-4" /></Button>
                                </div>
                                <Textarea id="long-desc" placeholder="Write a detailed description..." className="border-0 focus-visible:ring-0" rows={8} value={longDesc} onChange={e => setLongDesc(e.target.value)}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label>Main Image</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary cursor-pointer" onClick={() => document.getElementById('main-image-input')?.click()}>
                                     <input type="file" id="main-image-input" className="hidden" onChange={(e) => {
                                         const file = e.target.files ? e.target.files[0] : null;
                                         if (file) {
                                            setMainImage(file);
                                            setMainImageUrl(URL.createObjectURL(file));
                                         }
                                         }} accept="image/*" />
                                    {mainImageUrl ? (
                                        <div className="relative w-32 h-32">
                                            <img src={mainImageUrl} alt="Main preview" className="object-cover w-full h-full rounded-md" />
                                        </div>
                                    )
                                    : <>
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    <p className="mt-2 text-sm">Drag & drop an image or <span className="text-primary">browse</span></p>
                                    <p className="text-xs text-muted-foreground mt-1">1200x1600 (3:4) recommended, up to 2MB</p>
                                    </>}
                                </div>
                            </div>
                             <div>
                                <Label>Image Gallery</Label>
                                 <input type="file" id="gallery-image-input" className="hidden" onChange={(e) => {
                                     const files = e.target.files ? Array.from(e.target.files) : [];
                                     setGalleryImages(prev => [...prev, ...files]);
                                     setGalleryImageUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                                    }} accept="image/*" multiple />
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                     {galleryImageUrls.map((url, i) => (
                                        <div key={i} className="relative aspect-square border rounded-lg overflow-hidden">
                                            <img src={url} alt="gallery" className="object-cover w-full h-full" />
                                            <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => {
                                                setGalleryImages(galleryImages.filter((_, index) => index !== i));
                                                setGalleryImageUrls(galleryImageUrls.filter((_, index) => index !== i));
                                                }}><X className="w-3 h-3"/></Button>
                                        </div>
                                    ))}
                                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary cursor-pointer" onClick={() => document.getElementById('gallery-image-input')?.click()}>
                                        <PlusCircle className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="regular-price">Regular Price</Label>
                            <Input id="regular-price" type="number" placeholder="₹0.00" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="offered-price">Offered Price</Label>
                            <Input id="offered-price" type="number" placeholder="₹0.00" value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" placeholder="e.g. TSHIRT-RED-L" value={sku} onChange={e => setSku(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {variants.map((variant, vIndex) => (
                            <Accordion key={vIndex} type="single" collapsible defaultValue="item-1" className="border rounded-md px-4">
                                <AccordionItem value="item-1" className="border-b-0">
                                    <div className="flex items-center justify-between py-4">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                                            <Select value={variant.type} onValueChange={(value) => {
                                                const newVariants = [...variants];
                                                newVariants[vIndex].type = value;
                                                setVariants(newVariants);
                                            }}>
                                                <SelectTrigger className="w-48">
                                                    <SelectValue placeholder="Variant Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Color">Color</SelectItem>
                                                    <SelectItem value="Size">Size</SelectItem>
                                                    <SelectItem value="Material">Material</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <AccordionTrigger className="p-0 hover:no-underline w-auto" />
                                    </div>
                                    <AccordionContent className="pt-4 space-y-3">
                                        {variant.options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2 p-2 rounded-md border">
                                                <div className="relative h-12 w-12 flex-shrink-0 border-2 border-dashed rounded-md flex items-center justify-center">
                                                    <Palette className="w-5 h-5 text-muted-foreground"/>
                                                </div>
                                                <Input placeholder="Option Name e.g. Red" value={option.name} onChange={e => {
                                                    const newVariants = [...variants];
                                                    newVariants[vIndex].options[oIndex].name = e.target.value;
                                                    setVariants(newVariants);
                                                }} />
                                                <Input type="number" placeholder="Price" value={option.price} onChange={e => {
                                                     const newVariants = [...variants];
                                                     newVariants[vIndex].options[oIndex].price = e.target.value;
                                                     setVariants(newVariants);
                                                }} />
                                                <Button variant="ghost" size="icon" onClick={() => removeVariantOption(vIndex, oIndex)}><X className="w-4 h-4"/></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addVariantOption(vIndex)}>Add Option</Button>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}

                    </CardContent>
                    <CardFooter>
                         <Button variant="outline" onClick={addVariant}>Add Variant</Button>
                    </CardFooter>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Related Products</CardTitle>
                        <CardDescription>Select products for "May We Suggest" and "Quick Add" sections.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <RelatedProductSelector 
                            title="May We Suggest"
                            allProducts={allProducts}
                            selectedProducts={suggestedProducts}
                            onSelectionChange={setSuggestedProducts}
                       />
                       <RelatedProductSelector 
                            title="Quick Add Products"
                            allProducts={allProducts}
                            selectedProducts={quickAddProducts}
                            onSelectionChange={setQuickAddProducts}
                       />
                    </CardContent>
                </Card>


            </div>

            {/* Side Content */}
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                    <CardContent>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
                    <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                        {allCategories.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`cat-${cat.id}`} 
                                    checked={selectedCategories.includes(cat.title)} 
                                    onCheckedChange={(checked) => {
                                        return checked
                                            ? setSelectedCategories([...selectedCategories, cat.title])
                                            : setSelectedCategories(selectedCategories.filter(c => c !== cat.title))
                                    }}
                                />
                                <Label htmlFor={`cat-${cat.id}`}>{cat.title}</Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Features</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {features.map((feature, i) => (
                             <Input key={i} placeholder={`Feature ${i+1}`} value={feature} onChange={e => {
                                const newFeatures = [...features];
                                newFeatures[i] = e.target.value;
                                setFeatures(newFeatures);
                             }} />
                        ))}
                        <Button variant="link" size="sm" className="p-0" onClick={() => setFeatures([...features, ''])}>Add Feature</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                    <CardContent>
                        <Input placeholder="e.g. t-shirt, summer, cotton" value={tags} onChange={e => setTags(e.target.value)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Delivery & Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea placeholder="Provide details about delivery and returns policy for this product." value={deliveryReturns} onChange={e => setDeliveryReturns(e.target.value)} />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}

export default AddProductPage;
