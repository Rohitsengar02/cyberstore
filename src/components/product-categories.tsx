
"use client"
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Category = {
    id: string;
    title: string;
    image: string;
};

const categoryColors = [
    "bg-rose-100/50",
    "bg-sky-100/50",
    "bg-amber-100/50",
    "bg-teal-100/50",
    "bg-purple-100/50",
    "bg-lime-100/50",
    "bg-pink-100/50",
    "bg-indigo-100/50"
];


export const ProductCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setCategories(categoriesData);
        });

        return () => unsubscribe();
    }, []);

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    };

    return (
        <section className="py-0 md:py-6 bg-background">
            <div className="md:hidden">
                <Carousel
                    opts={{
                        align: "start",
                        dragFree: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="pl-4 -ml-2">
                        {categories.map((category, index) => {
                            return (
                                <CarouselItem key={category.id} className="basis-1/5 pl-2">
                                    <Link href={`/shop/category/${encodeURIComponent(category.title)}`} className="block group text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden", categoryColors[index % categoryColors.length])}>
                                                <Image src={category.image} alt={category.title} fill className="object-cover" />
                                            </div>
                                            <h3 className="text-[10px] font-semibold text-foreground whitespace-nowrap truncate w-16">
                                                {truncateText(category.title, 8)}
                                            </h3>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
};

export default ProductCategories;
