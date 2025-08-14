
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

type Category = {
    id: string;
    title: string;
    image: string;
};

type CategoryCardProps = {
    category: Category;
    index: number;
}

const CategoryCard = ({ category, index }: CategoryCardProps) => {
    return (
        <Link href={`/shop/category/${encodeURIComponent(category.title)}`} className="block group">
            <div className="relative overflow-hidden rounded-2xl aspect-square bg-secondary/50">
                 <Image 
                    src={category.image} 
                    alt={category.title} 
                    fill 
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="pt-2 text-left">
                <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{category.title}</h3>
            </div>
        </Link>
    )
}

export default CategoryCard;
