
"use client"
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import type { Product } from '@/lib/types';
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            if(!isAuthLoading) setIsLoading(false);
            return;
        };

        const wishlistRef = collection(db, `users/${user.uid}/wishlist`);
        const unsubscribe = onSnapshot(wishlistRef, async (snapshot) => {
            setIsLoading(true);
            const productIds = snapshot.docs.map(d => d.id);
            const productPromises = productIds.map(id => getDoc(doc(db, 'products', id)));
            const productDocs = await Promise.all(productPromises);
            const products = productDocs
                .filter(doc => doc.exists())
                .map(doc => ({ id: doc.id, ...doc.data() } as Product));
            
            setWishlistProducts(products);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, isAuthLoading]);

     if (isLoading || isAuthLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!user) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-background items-center justify-center">
                <p className="mb-4">Please log in to see your wishlist.</p>
                <Button asChild>
                    <Link href="/profile">Login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/profile">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Profile</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Wishlist</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                {wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                        {wishlistProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold">Your Wishlist is Empty</h2>
                        <p className="text-muted-foreground mt-2">Looks like you haven't added anything yet.</p>
                        <Button asChild className="mt-6">
                            <Link href="/shop">Explore Products</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
