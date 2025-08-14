
"use client"
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { ShoppingCart, Copy, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import ProductImageGallery from './product-image-gallery';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';


type SingleProductOfferSection = {
    id: string;
    title: string;
    product: Product;
    discountCode: string;
    offerEndDate: string;
}

type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const CountdownClock = ({ endDate }: { endDate: string }) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        const calculateTimeLeft = (): TimeLeft | null => {
            const difference = +new Date(endDate) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        }

        // Set initial value on client-side only
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);


    if (timeLeft === null) {
        return <div className="text-center text-red-500 font-bold">Offer Expired!</div>;
    }

    const timeParts = [
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Mins", value: timeLeft.minutes },
        { label: "Secs", value: timeLeft.seconds },
    ];

    return (
         <div className="flex justify-center md:justify-start gap-2 md:gap-4">
            {timeParts.map(part => (
                <div key={part.label} className="flex flex-col items-center p-2 bg-primary/10 rounded-lg w-16">
                    <span className="text-xl md:text-2xl font-bold text-primary">{part.value.toString().padStart(2, '0')}</span>
                    <span className="text-xs text-muted-foreground">{part.label}</span>
                </div>
            ))}
        </div>
    )
}

const SingleProductOffer = ({ section }: { section: SingleProductOfferSection }) => {
    const { toast } = useToast();
    const { product } = section;
    const { addToCart } = useCart();
    const { user, setIsAuthDialogOpen } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(false);
    
    if (!product) return null;
    
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


    const copyToClipboard = () => {
        navigator.clipboard.writeText(section.discountCode);
        toast({ title: "Copied!", description: "Discount code copied to clipboard." });
    }
    
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


    const images = [
        product.mainImage,
        ...(product.gallery || []),
    ].filter(Boolean);


    return (
        <section className="container mx-auto px-4 md:px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                 <ProductImageGallery images={images} productName={product.title} productId={product.id} />
                 <div className="flex flex-col justify-center text-center md:text-left space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold">{section.title}</h2>
                    <p className="text-lg text-muted-foreground">{product.title}</p>
                    <p className="text-sm text-muted-foreground">{product.shortDesc}</p>
                    
                    <CountdownClock endDate={section.offerEndDate} />

                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="text-sm text-muted-foreground">Use Code:</span>
                        <div className="flex items-center gap-2 border-2 border-dashed border-primary/50 px-3 py-1 rounded-lg">
                            <span className="text-lg font-bold text-primary">{section.discountCode}</span>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyToClipboard}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-center md:justify-start">
                        <Button size="lg" className="rounded-full" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-0 md:mr-2 h-5 w-5" />
                            <span className="hidden md:inline">Add to Cart</span>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full" asChild>
                           <Link href={`/shop/${product.id}`}>
                                <span className="hidden md:inline">View Product</span>
                                <span className="md:hidden">View</span>
                           </Link>
                        </Button>
                         <Button size="lg" variant="outline" className="rounded-full" onClick={handleWishlistToggle}>
                            <Heart className={cn("mr-0 md:mr-2 h-5 w-5", { "fill-red-500 text-red-500": isWishlisted })} />
                            <span className="hidden md:inline">Wishlist</span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SingleProductOffer;
