
"use client"
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Slider } from "./ui/slider";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Filters } from "@/app/shop/page";

const brands = ["Gucci", "Nike", "Stone Island", "Adidas", "Puma"];
const sizes = ["S", "M", "L", "XL", "XXL"];
const ratings = [5, 4, 3, 2, 1];

type Category = {
  id: string;
  title: string;
};

type ShopSidebarProps = {
    filters: Filters,
    setFilters: React.Dispatch<React.SetStateAction<Filters>>
}

const ShopSidebar = ({ filters, setFilters }: ShopSidebarProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    
    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesCol = collection(db, 'categories');
            const snapshot = await getDocs(categoriesCol);
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { title: string } })));
        };
        fetchCategories();
    }, []);

    const handleCategoryToggle = (category: string) => {
        setFilters(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleRatingSelect = (rating: number) => {
        setFilters(prev => ({
            ...prev,
            rating: prev.rating === rating ? null : rating
        }));
    };

    const handlePriceChange = (value: number[]) => {
        setFilters(prev => ({ ...prev, priceRange: value }));
    };
    
    const handleReset = () => {
        setFilters({
            categories: [],
            rating: null,
            priceRange: [50000]
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Sort By</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                             <Button 
                                key={category.id}
                                variant={filters.categories.includes(category.title) ? "default" : "outline"}
                                size="sm" 
                                className={cn("rounded-full", {
                                    'bg-primary text-primary-foreground shadow-lg': filters.categories.includes(category.title),
                                    'bg-secondary text-secondary-foreground hover:bg-secondary/80': !filters.categories.includes(category.title)
                                })}
                                onClick={() => handleCategoryToggle(category.title)}
                            >
                                {category.title}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Rating</h3>
                    <div className="flex flex-wrap gap-2">
                         {ratings.map((rating) => (
                            <Button 
                                key={rating}
                                variant={filters.rating === rating ? "default" : "outline"}
                                size="sm" 
                                className={cn("rounded-full", {
                                    'bg-primary text-primary-foreground shadow-lg': filters.rating === rating,
                                    'bg-secondary text-secondary-foreground hover:bg-secondary/80': filters.rating !== rating
                                })}
                                onClick={() => handleRatingSelect(rating)}
                            >
                                {rating} <Star className="w-4 h-4 ml-1 fill-current" />
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Price Range</h3>
                        <span className="font-semibold text-primary">₹{filters.priceRange[0]}</span>
                    </div>
                    <Slider
                        value={filters.priceRange}
                        onValueChange={handlePriceChange}
                        max={50000}
                        step={100}
                    />
                </div>

                 <div className="space-y-4">
                    <h3 className="font-bold text-lg">Brands</h3>
                    <div className="flex flex-wrap gap-2">
                        {brands.map((brand) => (
                            <Button key={brand} variant="outline" size="sm" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">{brand}</Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                            <Button key={size} variant="outline" size="sm" className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">{size}</Button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="pt-6 mt-auto grid grid-cols-2 gap-4">
                 <Button variant="outline" size="lg" className="rounded-full" onClick={handleReset}>Reset</Button>
                 <Button size="lg" className="rounded-full">Apply</Button>
            </div>
        </div>
    )
}

export default ShopSidebar;
