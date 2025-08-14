
"use client"
import React, { useState, useEffect, useMemo } from 'react';
import Image from "next/image";
import { PlusCircle, Search, Trash2, Edit, List, LayoutGrid, MoreVertical, Eye, Settings, Tag, Palette, GripVertical, Info, Package, DollarSign, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from 'next/link';
import { collection, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function ProductsPage() {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch(sortOrder) {
      case 'price-asc':
        filtered.sort((a, b) => a.pricing.offered - b.pricing.offered);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.pricing.offered - a.pricing.offered);
        break;
      case 'date-asc':
        filtered.sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate());
        break;
      case 'date-desc':
      default:
        filtered.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
        break;
    }

    return filtered;
  }, [products, searchTerm, sortOrder]);

  const handleViewDetails = (product: Product) => {
      setSelectedProduct(product);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
        await deleteDoc(doc(db, "products", productId));
        toast({ title: "Success", description: "Product deleted successfully."});
    } catch (error) {
        console.error("Error deleting product: ", error);
        toast({ title: "Error", description: "Could not delete product.", variant: "destructive" });
    }
  }
  
  const getRelatedProducts = (ids: string[] = []) => {
      return products.filter(p => ids.includes(p.id));
  }


  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Sheet onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>
                 <Button size="sm" className="h-8 gap-1" asChild>
                    <Link href="/admin/dashboard/products/new">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Add Product</span>
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
                                <List className="h-4 w-4" />
                            </Button>
                            <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative flex-1 md:grow-0">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Sort by: Default" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date-desc">Sort by: Newest</SelectItem>
                                <SelectItem value="date-asc">Sort by: Oldest</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        {view === 'list' ? (
                        <div className="overflow-x-auto">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox />
                                </TableHead>
                                <TableHead className="min-w-[250px]">Product Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Checkbox onClick={(e) => e.stopPropagation()} />
                                    </TableCell>
                                    <TableCell>
                                        <SheetTrigger asChild>
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleViewDetails(product)}>
                                                <Image
                                                src={product.mainImage || 'https://placehold.co/64x64.png'}
                                                alt={product.title}
                                                width={48}
                                                height={48}
                                                className="rounded-md object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium">{product.title}</div>
                                                    <div className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </SheetTrigger>
                                    </TableCell>
                                    <TableCell>₹{product.pricing.offered.toFixed(2)}</TableCell>
                                    <TableCell>{product.inventory?.stock || 0}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === 'published' ? 'secondary' : 'outline'} className="capitalize">
                                            <span className={`inline-block w-2 h-2 mr-2 rounded-full ${product.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/admin/dashboard/products/edit/${product.id}`} onClick={e => e.stopPropagation()}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the product.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                            </Table>
                        </div>
                        ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAndSortedProducts.map((product) => (
                            <Card key={product.id} className="overflow-hidden group">
                                <CardHeader className="p-0">
                                <SheetTrigger asChild>
                                    <div className="relative aspect-video cursor-pointer" onClick={() => handleViewDetails(product)}>
                                        <Image
                                            src={product.mainImage || 'https://placehold.co/600x400.png'}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-2 left-2">
                                            <Badge variant={product.status === 'published' ? 'secondary' : 'outline'} className="capitalize">
                                                <span className={`inline-block w-2 h-2 mr-2 rounded-full ${product.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                {product.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </SheetTrigger>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg">{product.title}</h3>
                                    <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="font-bold text-lg">₹{product.pricing.offered.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">{product.inventory?.stock || 0} in stock</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <div className="flex justify-end gap-2 w-full">
                                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                           <Link href={`/admin/dashboard/products/edit/${product.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the product.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardFooter>
                            </Card>
                            ))}
                        </div>
                        )}
                    </div>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {filteredAndSortedProducts.map((product) => (
                           <Card key={product.id}>
                                <CardContent className="p-4 flex gap-4">
                                    <SheetTrigger asChild>
                                        <div className="relative w-24 h-24 rounded-md overflow-hidden cursor-pointer" onClick={() => handleViewDetails(product)}>
                                             <Image
                                                src={product.mainImage || 'https://placehold.co/100x100.png'}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </SheetTrigger>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-semibold">{product.title}</h3>
                                        <p className="font-bold text-primary">₹{product.pricing.offered.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">{product.inventory?.stock || 0} in stock</p>
                                        <Badge variant={product.status === 'published' ? 'secondary' : 'outline'} className="capitalize">
                                            <span className={`inline-block w-2 h-2 mr-2 rounded-full ${product.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {product.status}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                            <Link href={`/admin/dashboard/products/edit/${product.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <Button variant="destructive" size="icon" className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the product.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                            <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#" isActive>
                                2
                            </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            </Card>
        </div>

        {selectedProduct && (
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                <div className="relative aspect-video w-full">
                    <Image
                        src={selectedProduct.mainImage || 'https://placehold.co/600x400.png'}
                        alt={selectedProduct.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <SheetHeader className="p-6">
                    <div>
                        <SheetTitle className="text-2xl">{selectedProduct.title}</SheetTitle>
                        <SheetDescription>SKU: {selectedProduct.sku || 'N/A'}</SheetDescription>
                    </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto space-y-6 p-6 pt-0">
                    
                    <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8']} className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-semibold"><Info className="mr-2"/> General</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-1">Short Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.shortDesc}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-1">Long Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.longDesc}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-2">
                             <AccordionTrigger className="font-semibold"><ImageIcon className="mr-2"/> Media</AccordionTrigger>
                             <AccordionContent>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedProduct.gallery?.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-md overflow-hidden">
                                            <Image src={img} alt={`Gallery image ${i+1}`} fill className="object-cover"/>
                                        </div>
                                    ))}
                                </div>
                             </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                             <AccordionTrigger className="font-semibold"><DollarSign className="mr-2"/> Pricing</AccordionTrigger>
                             <AccordionContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Regular Price</span>
                                    <span className="font-medium">₹{selectedProduct.pricing.regular.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Offered Price</span>
                                    <span className="font-medium">₹{selectedProduct.pricing.offered.toFixed(2)}</span>
                                </div>
                                 <div className="flex justify-between text-green-600">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="font-medium">{(((selectedProduct.pricing.regular - selectedProduct.pricing.offered) / selectedProduct.pricing.regular) * 100).toFixed(0)}%</span>
                                </div>
                             </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-4">
                             <AccordionTrigger className="font-semibold"><Package className="mr-2"/> Inventory</AccordionTrigger>
                              <AccordionContent className="space-y-3">
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Stock</span>
                                    <span className="font-medium">{selectedProduct.inventory?.stock || 0} units</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Views</span>
                                    <span className="font-medium">{selectedProduct.inventory?.views?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status</span>
                                     <Badge variant={selectedProduct.status === 'published' ? 'secondary' : 'outline'} className="capitalize">
                                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${selectedProduct.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                        {selectedProduct.status}
                                    </Badge>
                                </div>
                             </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-5">
                             <AccordionTrigger className="font-semibold"><Palette className="mr-2"/> Variants</AccordionTrigger>
                             <AccordionContent className="space-y-4">
                                {selectedProduct.variants?.map((variant, vIndex) => (
                                    <div key={vIndex}>
                                        <h4 className="font-medium text-sm mb-2">{variant.type}</h4>
                                        <div className="space-y-2">
                                        {variant.options.map((option, oIndex) => (
                                             <div key={oIndex} className="flex items-center gap-2 p-2 rounded-md border text-sm">
                                                <span className="flex-1">{option.name}</span>
                                                <span className="font-semibold">₹{parseFloat(option.price).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                ))}
                             </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-6">
                             <AccordionTrigger className="font-semibold"><Tag className="mr-2"/> Organization</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-2">Categories</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProduct.categories?.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProduct.tags?.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                    </div>
                                </div>
                             </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-7">
                             <AccordionTrigger className="font-semibold"><Settings className="mr-2"/> Advanced</AccordionTrigger>
                             <AccordionContent className="space-y-4 text-sm">
                                 <div>
                                    <h4 className="font-medium mb-2">Features</h4>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                       {selectedProduct.features?.map(f => <li key={f}>{f}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Delivery & Returns</h4>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.deliveryReturns}</p>
                                </div>
                             </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-8">
                             <AccordionTrigger className="font-semibold"><GripVertical className="mr-2"/> Related Products</AccordionTrigger>
                             <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-2">May We Suggest</h4>
                                    <div className="space-y-2">
                                        {getRelatedProducts(selectedProduct.relatedProducts?.suggested).map(p => (
                                            <div key={p.id} className="flex items-center gap-2 p-2 rounded-md border text-sm">
                                                <Image src={p.mainImage} alt={p.title} width={32} height={32} className="rounded-sm" />
                                                <span className="flex-1">{p.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 <div>
                                    <h4 className="font-medium text-sm mb-2">Quick Add</h4>
                                    <div className="space-y-2">
                                        {getRelatedProducts(selectedProduct.relatedProducts?.quickAdd).map(p => (
                                            <div key={p.id} className="flex items-center gap-2 p-2 rounded-md border text-sm">
                                                <Image src={p.mainImage} alt={p.title} width={32} height={32} className="rounded-sm" />
                                                <span className="flex-1">{p.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </AccordionContent>
                        </AccordionItem>


                    </Accordion>
                </div>
                 <SheetFooter className="p-6 mt-auto bg-background border-t">
                    <div className="flex gap-4 w-full">
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`/admin/dashboard/products/edit/${selectedProduct.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the product.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(selectedProduct.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </SheetFooter>
            </SheetContent>
        )}
    </Sheet>
  );
}
