
"use client"
import type { Product } from '@/lib/types';
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/context/cart-context";

type QuickAddProductCardProps = {
  product: Product;
};

const QuickAddProductCard = ({ product }: QuickAddProductCardProps) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
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

  return (
    <div className="block group">
      <div className="relative overflow-hidden rounded-2xl aspect-square bg-secondary/50">
        <Link href={`/shop/${product.id}`}>
          <Image
            src={product.mainImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={product.title}
          />
        </Link>
        <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 bg-background/70 hover:bg-background" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Add to cart</span>
            </Button>
        </div>
      </div>
      <div className="pt-2 text-left">
        <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{product.title}</h3>
        <p className="text-sm font-bold mt-1 text-primary">₹{product.pricing.offered.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default QuickAddProductCard;
