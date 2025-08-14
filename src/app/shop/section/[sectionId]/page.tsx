
import { collection, getDocs, doc, getDoc, query, where, DocumentData, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/product-card";
import type { Product } from '@/lib/types';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const toJSON = (data: DocumentData): any => {
    // Convert Firestore Timestamps to strings
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            data[key] = toJSON(data[key]);
        }
    }
    return data;
};


async function getSectionData(sectionId: string): Promise<{ section: DocumentData | null; products: Product[] }> {
    const sectionRef = doc(db, "homepageSections", sectionId);
    const sectionSnap = await getDoc(sectionRef);

    if (!sectionSnap.exists()) {
        return { section: null, products: [] };
    }

    const section = toJSON({ id: sectionSnap.id, ...sectionSnap.data() });
    const productIds = section.productIds || [];

    if (productIds.length === 0) {
        return { section, products: [] };
    }
    
    const uniqueProductIds = [...new Set(productIds)];
    
    let allProducts: Product[] = [];
    const MAX_IDS_PER_QUERY = 30;
    for (let i = 0; i < uniqueProductIds.length; i += MAX_IDS_PER_QUERY) {
        const chunk = uniqueProductIds.slice(i, i + MAX_IDS_PER_QUERY);
        if (chunk.length > 0) {
            const productsRef = collection(db, 'products');
            const productQuery = query(productsRef, where('__name__', 'in', chunk));
            const productQuerySnapshot = await getDocs(productQuery);
            const chunkProducts = productQuerySnapshot.docs
                .map(doc => toJSON({ id: doc.id, ...doc.data() }));
            allProducts = [...allProducts, ...chunkProducts];
        }
    }

    // Preserve the order from productIds
    const orderedProducts = productIds.map((id: string) => allProducts.find(p => p.id === id)).filter(Boolean);

    return { section, products: orderedProducts };
}

export default async function SectionPage({ params }: { params: { sectionId: string } }) {
    const { section, products } = await getSectionData(params.sectionId);
    
    if (!section) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background items-center justify-center">
                <h1 className="text-2xl font-bold">Section Not Found</h1>
                <p className="text-muted-foreground mt-2">The page you are looking for does not exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/shop">Continue Shopping</Link>
                </Button>
            </div>
        )
    }
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Home</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">{section.title}</h1>
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
                        <p className="text-muted-foreground mt-2">There are currently no products in the "{section.title}" section.</p>
                        <Button asChild className="mt-6">
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

