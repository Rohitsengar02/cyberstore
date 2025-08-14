
"use client"
import ProductCard from "./product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import Autoplay from "embla-carousel-autoplay";


type SectionProps = {
  id: string;
  title: string;
  products: Product[];
  showViewAll: boolean;
  displayType: 'slider' | 'grid';
  productsPerViewDesktop: number;
  productsPerViewMobile: number;
  sliderSettings?: {
      autoplay: boolean;
      loop: boolean;
      speed: number;
  }
}

const FeaturedProducts = ({ section }: { section: SectionProps }) => {
  if (!section || !section.products || section.products.length === 0) {
    return null;
  }
  
  const desktopBasis = `lg:basis-1/${section.productsPerViewDesktop || 5}`;


  return (
    <section className="py-4 md:py-8 bg-background">
      <div className="container mx-auto px-0 md:px-4">
        <div className="flex items-center justify-between mb-6 px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{section.title}</h2>
            {section.showViewAll && (
              <Link href={`/shop/section/${section.id}`} className="flex items-center text-sm font-medium text-primary hover:text-primary/80">
                  <span className="hidden md:inline">View All</span>
                  <ChevronRight className="h-5 w-5" />
              </Link>
            )}
        </div>
        
        {section.displayType === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 px-4 md:px-0">
                {section.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        ) : (
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
                loop: section.sliderSettings?.loop,
              }}
              plugins={[
                Autoplay({
                  delay: section.sliderSettings?.speed || 3000,
                  stopOnInteraction: true,
                  active: section.sliderSettings?.autoplay,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="pl-4 -ml-2 md:pl-0 md:-ml-4">
                {section.products.map((product) => (
                  <CarouselItem key={product.id} className={`basis-1/2 md:basis-1/3 ${desktopBasis} pl-2 md:pl-4`}>
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-4" />
                <CarouselNext className="-right-4" />
              </div>
            </Carousel>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
