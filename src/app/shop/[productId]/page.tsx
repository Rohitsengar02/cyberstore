

import ProductDetails from "@/components/product-details";
import ProductImageGallery from "@/components/product-image-gallery";
import ProductInfoTabs from "@/components/product-info-tabs";
import RelatedProducts from "@/components/related-products";
import ShopHeader from "@/components/shop-header";
import { doc, getDoc, collection, getDocs, DocumentData, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import ProductMobileCta from "@/components/product-mobile-cta";
import QuickAddProductCard from "@/components/quick-add-product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const toJSON = (data: DocumentData): any => {
    // Convert Firestore Timestamps to strings
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return data;
};


async function getProduct(productId: string): Promise<Product | null> {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const productData = { id: docSnap.id, ...docSnap.data() };
        return toJSON(productData) as Product;
    } else {
        return null;
    }
}

async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    const allProducts = productSnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() as DocumentData }) as Product);
    return allProducts.filter(p => ids.includes(p.id));
}

async function getAllProducts(): Promise<Product[]> {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    return productSnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() as DocumentData }) as Product);
}


export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
    const product = await getProduct(params.productId);
    
    if (!product) {
        return <div>Product not found</div>;
    }
    
    const [relatedProducts, quickAddProducts, allProducts] = await Promise.all([
        getProductsByIds(product.relatedProducts?.suggested || []),
        getProductsByIds(product.relatedProducts?.quickAdd || []),
        getAllProducts()
    ]);


    const images = [
        product.mainImage,
        ...(product.gallery || []),
    ].filter(Boolean);

    return (
        <div className="flex min-h-screen w-full flex-col bg-background pb-16 md:pb-0">
            <ShopHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                        <ProductImageGallery images={images} productName={product.title} productId={product.id} />
                        <ProductDetails product={product} />
                    </div>
                    <div className="mt-12">
                        <ProductInfoTabs product={product} />
                    </div>
                    {quickAddProducts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold mb-6">Quick Add to Cart</h2>
                            <Carousel
                                opts={{
                                    align: "start",
                                    dragFree: true,
                                }}
                                className="w-full"
                            >
                                <CarouselContent className="-ml-4">
                                    {quickAddProducts.map(p => (
                                        <CarouselItem key={p.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                                            <QuickAddProductCard product={p} />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <div className="hidden md:block">
                                    <CarouselPrevious className="-left-4" />
                                    <CarouselNext className="-right-4" />
                                </div>
                            </Carousel>
                        </div>
                    )}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <RelatedProducts title="May We Suggest" products={relatedProducts} />
                        </div>
                    )}
                    <div className="mt-16">
                        <RelatedProducts title="More to Explore" products={allProducts.slice(5, 10)} />
                    </div>
                </div>
            </main>
            <ProductMobileCta product={product} />
        </div>
    );
}
