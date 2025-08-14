
"use client"
import type { Product } from '@/lib/types';
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


type ProductMobileCtaProps = {
    product: Product;
}

const ProductMobileCta = ({ product }: ProductMobileCtaProps) => {
    const { addToCart } = useCart();
    const { user, setIsAuthDialogOpen } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        if (!user) {
            setIsWishlisted(false);
            return;
        };
        const unsub = onSnapshot(doc(db, `users/${user.uid}/wishlist`, product.id), (doc) => {
            setIsWishlisted(doc.exists());
        });
        return () => unsub();
    }, [user, product.id]);


    const handleWishlistToggle = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
          setIsAuthDialogOpen(true);
          return;
      }
      
      const wishlistRef = doc(db, `users/${user.uid}/wishlist`, product.id);

      if (isWishlisted) {
          await deleteDoc(wishlistRef);
          toast({ title: 'Removed from wishlist' });
      } else {
          await setDoc(wishlistRef, { productId: product.id, addedAt: new Date() });
          toast({ title: 'Added to wishlist' });
      }
    }


    const handleAction = (buyNow: boolean) => {
        if (!user) {
            setIsAuthDialogOpen(true);
        } else {
            const cartItem = {
                productId: product.id,
                name: product.title,
                price: `₹${product.pricing.offered.toFixed(2)}`,
                image: product.mainImage,
                hint: product.title,
                category: product.categories?.[0] || 'N/A'
            };
            addToCart(cartItem);
            if (buyNow) {
                router.push('/checkout');
            }
        }
    };
    
    return (
        <div className="md:hidden fixed bottom-16 left-0 right-0 h-20 bg-card border-t z-40 shadow-t-lg">
            <div className="container mx-auto h-full flex items-center justify-between gap-4 px-4">
                <p className="text-xl font-bold">₹{product.pricing.offered.toFixed(2)}</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full" onClick={handleWishlistToggle}>
                        <Heart className={cn("h-5 w-5", { "fill-red-500 text-red-500": isWishlisted })}/>
                        <span className="sr-only">Add to Wishlist</span>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => handleAction(false)}>
                        <ShoppingCart className="h-5 w-5"/>
                        <span className="sr-only">Add to Cart</span>
                    </Button>
                    <Button size="lg" className="rounded-full flex-1" onClick={() => handleAction(true)}>
                        Buy Now
                    </Button>
                </div>
            </div>
        </div>
    )
};

export default ProductMobileCta;
