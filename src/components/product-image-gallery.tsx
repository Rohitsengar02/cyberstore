
"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

type ProductImageGalleryProps = {
    images: string[];
    productName: string;
    productId: string;
}

const ProductImageGallery = ({ images, productName, productId }: ProductImageGalleryProps) => {
    const [mainImage, setMainImage] = useState(images[0]);
    const { user, setIsAuthDialogOpen } = useAuth();
    const { toast } = useToast();
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        setMainImage(images[0]);
    }, [images]);

    useEffect(() => {
        if (!user) {
            setIsWishlisted(false);
            return;
        };
        const unsub = onSnapshot(doc(db, `users/${user.uid}/wishlist`, productId), (doc) => {
            setIsWishlisted(doc.exists());
        });
        return () => unsub();
    }, [user, productId]);

    const handleWishlistToggle = async () => {
        if (!user) {
            setIsAuthDialogOpen(true);
            return;
        }

        const wishlistRef = doc(db, `users/${user.uid}/wishlist`, productId);

        if (isWishlisted) {
            await deleteDoc(wishlistRef);
            toast({ title: 'Removed from wishlist' });
        } else {
            await setDoc(wishlistRef, { productId: productId, addedAt: new Date() });
            toast({ title: 'Added to wishlist' });
        }
    }


    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-secondary/50">
                <Image
                    src={mainImage}
                    alt={`Main image of ${productName}`}
                    fill
                    className="object-cover"
                />
                 <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full bg-background/70 hover:bg-background md:hidden" onClick={handleWishlistToggle}>
                    <Heart className={cn("h-5 w-5", { "fill-red-500 text-red-500": isWishlisted })} />
                    <span className="sr-only">Add to wishlist</span>
                </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative aspect-square overflow-hidden rounded-lg cursor-pointer transition-all bg-secondary/50",
                            mainImage === image ? "ring-2 ring-primary ring-offset-2" : "hover:ring-2 hover:ring-primary/50"
                        )}
                        onClick={() => setMainImage(image)}
                    >
                        <Image
                            src={image}
                            alt={`Thumbnail ${index + 1} of ${productName}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProductImageGallery;
