
"use client"
import type { Product } from '@/lib/types';
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { user, setIsAuthDialogOpen } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

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

  if (!product || !product.pricing) {
    return (
        <div className="block group">
            <Skeleton className="relative overflow-hidden rounded-2xl aspect-square bg-secondary/50" />
            <div className="pt-2 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    )
  }
  return (
    <Link href={`/shop/${product.id}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl aspect-square bg-secondary/50">
          <Image
            src={product.mainImage || 'https://placehold.co/600x600.png'}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={product.title}
          />
           <button onClick={handleWishlistToggle} className="absolute top-3 right-3 rounded-full h-8 w-8 bg-background/70 hover:bg-background flex items-center justify-center">
              <Heart className={cn("h-4 w-4 text-muted-foreground", { "fill-red-500 text-red-500": isWishlisted })} />
              <span className="sr-only">Add to wishlist</span>
          </button>
      </div>
      <div className="pt-2 text-left">
        <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{product.title}</h3>
        <p className="text-sm font-bold mt-1 text-primary">₹{product.pricing.offered.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
