
"use client"
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/product-card";
import ShopSidebar from "@/components/shop-sidebar";
import ShopHeader from "@/components/shop-header";
import { ProductCategories } from "@/components/product-categories";
import type { Product } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export type Filters = {
    categories: string[];
    rating: number | null;
    priceRange: number[];
};

type Category = {
    id: string;
    title: string;
    image: string;
};

export default function ShopPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        categories: [],
        rating: null,
        priceRange: [50000]
    });

    useEffect(() => {
        const fetchProductsAndCategories = async () => {
            setIsLoading(true);
            const productsCol = collection(db, 'products');
            const categoriesCol = collection(db, 'categories');
            
            const [productSnapshot, categorySnapshot] = await Promise.all([
                getDocs(productsCol),
                getDocs(categoriesCol)
            ]);
            
            const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            const publishedProducts = productList.filter(p => p.status === 'published');
            setAllProducts(publishedProducts);
            setFilteredProducts(publishedProducts);

            const categoryList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setCategories(categoryList);

            setIsLoading(false);
        };
        fetchProductsAndCategories();
    }, []);

    useEffect(() => {
        let tempProducts = [...allProducts];

        // Filter by category
        if (filters.categories.length > 0) {
            tempProducts = tempProducts.filter(p => 
                filters.categories.some(cat => p.categories?.includes(cat))
            );
        }

        // Filter by rating (assuming we add a rating field later)
        // if (filters.rating) {
        //     tempProducts = tempProducts.filter(p => p.rating >= filters.rating);
        // }

        // Filter by price
        tempProducts = tempProducts.filter(p => p.pricing.offered <= filters.priceRange[0]);

        setFilteredProducts(tempProducts);
    }, [filters, allProducts]);


    return (
        <div className="flex min-h-screen w-full flex-col bg-background pb-16 md:pb-0">
            <ShopHeader onFilterClick={() => setIsFilterSheetOpen(true)} />
            <div className="container mx-auto px-4 md:px-6 py-4">
                <div className="md:hidden mb-4">
                    <ProductCategories/>
                </div>
                <div className="grid md:grid-cols-[280px_1fr] gap-8">
                    <aside className="hidden md:block">
                        <ShopSidebar filters={filters} setFilters={setFilters} />
                    </aside>
                    <main>
                        <div className="rounded-lg overflow-hidden mb-6">
                            <img src="https://res.cloudinary.com/ds1wiqrdb/image/upload/v1755080479/Handpicked_collections_made_for_you_h1eqhk.jpg" alt="Shop Banner" className="w-full h-auto object-cover" data-ai-hint="sale fashion" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                     <div key={i} className="block group">
                                        <Skeleton className="relative overflow-hidden rounded-2xl aspect-square bg-secondary/50" />
                                        <div className="pt-2 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            )}
                        </div>
                    </main>
                </div>
            </div>
             <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetContent side="bottom" className="md:hidden h-[70%] rounded-t-3xl">
                    <SheetTitle className="sr-only">Filters</SheetTitle>
                    <ShopSidebar filters={filters} setFilters={setFilters} />
                </SheetContent>
            </Sheet>
        </div>
    );
}
