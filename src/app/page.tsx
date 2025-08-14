
import Header from "@/components/header";
import Hero from "@/components/hero";
import ProductCategories from "@/components/product-categories";
import FeaturedProducts from "@/components/featured-products";
import { collection, getDocs, query, orderBy, DocumentData, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { toJSON } from "@/lib/utils";
import SingleProductOffer from "@/components/single-product-offer";


async function getHomepageSections() {
    const sectionsRef = collection(db, "homepageSections");
    const q = query(sectionsRef, orderBy("order"));
    const querySnapshot = await getDocs(q);
    const sections = querySnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() }));

    // Gather all unique product IDs from all sections
    const multiProductIds = sections
        .filter(s => s.sectionType !== 'single-product')
        .flatMap(s => s.productIds || []);
        
    const singleProductIds = sections
        .filter(s => s.sectionType === 'single-product' && s.productId)
        .map(s => s.productId);

    const allProductIds = [...multiProductIds, ...singleProductIds];
    const uniqueProductIds = [...new Set(allProductIds)];
    
    let allProducts: Product[] = [];
    if (uniqueProductIds.length > 0) {
        // Firestore 'in' query is limited to 30 items. Chunking is needed for more.
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
    }
    
    // Map products back to their sections
    return sections.map(section => {
        if (section.sectionType === 'single-product') {
            return {
                ...section,
                product: allProducts.find(p => p.id === section.productId) || null
            }
        }
        return {
            ...section,
            products: (section.productIds || []).map((id: string) => allProducts.find(p => p.id === id)).filter(Boolean)
        };
    });
}


export default async function Home() {
  const sections = await getHomepageSections();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background pb-16 md:pb-0">
      <Header />
      <main className="flex-1 md:pl-0 space-y-2 sm:-mt-2 md:space-y-8 lg:-mt-24">
        <ProductCategories />
        
        <Hero />
       
        <div className="space-y-2 md:space-y-8 pr-3">
            {sections.map(section => {
                if (section.sectionType === 'single-product') {
                    return <SingleProductOffer key={section.id} section={section} />
                }
                return <FeaturedProducts key={section.id} section={section} />
            })}
        </div>
      </main>
    </div>
  );
}
