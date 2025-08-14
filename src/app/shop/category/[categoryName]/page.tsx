

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/product-card";
import type { Product } from '@/lib/types';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toJSON } from "@/lib/utils";
import { Button } from "@/components/ui/button";


async function getProductsByCategory(categoryName: string): Promise<Product[]> {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("categories", "array-contains", decodeURIComponent(categoryName)));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() }) as Product);
}

export default async function CategoryPage({ params }: { params: { categoryName: string } }) {
    const products = await getProductsByCategory(params.categoryName);
    const categoryName = decodeURIComponent(params.categoryName);
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/shop" className="md:hidden">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Shop</span>
                    </Link>
                     <Link href="/" className="hidden md:flex items-center gap-2">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Home</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">{categoryName}</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                 {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold">No Products Found</h2>
                        <p className="text-muted-foreground mt-2">There are currently no products in the "{categoryName}" category.</p>
                        <Button asChild className="mt-6">
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
