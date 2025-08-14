
"use client"
import type { Product } from '@/lib/types';
import { Star, Facebook, Twitter, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';


const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M12.017 1.992c-5.22 0-9.445 4.128-9.445 9.182 0 4.236 2.81 7.843 6.645 8.932.483.09.682-.208.682-.464 0-.228-.008-.832-.013-1.634-2.724.58-3.3-1.29-3.3-1.29-.44-1.097-1.07-1.39-1.07-1.39-.875-.588.067-.576.067-.576.965.067 1.472 1.01 1.472 1.01.86 1.453 2.256 1.033 2.805.79.088-.613.336-1.033.635-1.27-2.14-.24-4.388-1.05-4.388-4.662 0-1.03.375-1.872 1-2.528-.1-.24-.434-1.2.094-2.49 0 0 .81-.256 2.656 1 .768-.212 1.59-.318 2.41-.322.82.004 1.64.11 2.41.322 1.845-1.256 2.654-1 2.654-1 .53 1.29.195 2.25.096 2.49.625.656 1 1.498 1 2.528 0 3.62-2.252 4.418-4.396 4.656.345.295.656.88.656 1.772 0 1.278-.012 2.31-.012 2.624 0 .258.195.557.688.463 3.832-1.09 6.636-4.696 6.636-8.93C21.46 6.12 17.23 1.992 12.016 1.992z" />
    </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16.75 13.96c-.25.13-.5.25-.75.38a.49.49 0 0 1-.5-.25c-.25-.5-.5-1-.75-1.5a.49.49 0 0 1 0-.5c.25-.25.5-.5.75-.75a.49.49 0 0 1 .5.13c.25.38.5.75.75 1.13a.49.49 0 0 1 0 .5c-.13.25-.25.5-.38.75m-3.5-2.25c-.25.13-.5.25-.75.38a.49.49 0 0 1-.5-.25c-.25-.5-.5-1-.75-1.5a.49.49 0 0 1 0-.5c.25-.25.5-.5.75-.75a.49.49 0 0 1 .5.13c.25.38.5.75.75 1.13a.49.49 0 0 1 0 .5c-.13.25-.25.5-.38.75M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8" />
  </svg>
);


const ProductDetails = ({ product }: { product: Product }) => {
    const { addToCart } = useCart();
    const { user, setIsAuthDialogOpen } = useAuth();
    const { toast } = useToast();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [productUrl, setProductUrl] = useState('');

     useEffect(() => {
        if (typeof window !== 'undefined') {
            setProductUrl(window.location.href);
        }
    }, []);
    
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

    const handleAddToCart = () => {
        if (!user) {
            setIsAuthDialogOpen(true);
            return;
        }
        const cartItem = {
            productId: product.id,
            name: product.title,
            price: `₹${product.pricing.offered.toFixed(2)}`,
            image: product.mainImage,
            hint: product.title,
            category: product.categories?.[0] || 'N/A'
        };
        addToCart(cartItem);
    };

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


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(32 reviews)</span>
                </div>
            </div>

            <p className="text-3xl font-semibold">₹{product.pricing.offered.toFixed(2)}</p>

            <p className="text-muted-foreground text-sm">
                {product.shortDesc}
            </p>

            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button size="lg" className="rounded-full" onClick={handleAddToCart}>Add to Bag</Button>
                <Button size="lg" variant="outline" className="rounded-full" onClick={handleWishlistToggle}>
                    <Heart className={cn("mr-2 h-5 w-5", { "fill-red-500 text-red-500": isWishlisted })} />
                    Add to Wishlist
                </Button>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
                <span className="text-sm font-medium">Share:</span>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full" asChild>
                        <Link href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`} target="_blank">
                            <Facebook className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </Button>
                     <Button variant="ghost" size="icon" className="rounded-full" asChild>
                        <Link href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.title + " " + productUrl)}`} target="_blank">
                            <WhatsAppIcon className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full" asChild>
                         <Link href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product.title)}`} target="_blank">
                            <Twitter className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full" asChild>
                        <Link href={`http://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(product.mainImage)}&description=${encodeURIComponent(product.title)}`} target="_blank">
                            <PinterestIcon className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails;
