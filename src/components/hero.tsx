
"use client";

import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Banner = {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    price: string;
    link: string;
    hint: string;
};

type HeroCard = {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    price: string;
    hint: string;
};

const Hero = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [cards, setCards] = useState<HeroCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const heroRef = doc(db, 'heroContent', 'main');
        const unsub = onSnapshot(heroRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setBanners(data.banners || []);
                setCards(data.cards || []);
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    if (isLoading) {
        // You can return a skeleton loader here
        return <section className="container mx-auto py-0 md:py-8 px-0 md:px-4">Loading...</section>;
    }

  return (
    <section className="container mx-auto py-0 md:py-8 px-0 md:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4  lg:px-0">
        {/* Main Banner */}
        <div className="lg:col-span-2">
            <Carousel 
              className="w-full h-full pl-4"
              opts={{
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: true,
                }),
              ]}
              >
              <CarouselContent>
                {banners.map((banner, index) => (
                  <CarouselItem key={index}>
                    <Link href={banner.link || '#'}>
                      <Card 
                       className={`relative w-full h-full md:min-h-[400px] flex items-center justify-start text-left border-none overflow-hidden aspect-[2/1] md:aspect-auto`}
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/15 to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute inset-0">
                            <Image
                              src={banner.imageUrl}
                              alt={banner.title}
                              fill
                              className="object-cover"
                              data-ai-hint={banner.hint}
                            />
                        </div>
                        <CardContent className="relative z-10 p-4 md:p-10 w-3/5 md:w-auto">
                          <h1 className="text-lg md:text-4xl font-bold my-2 text-white leading-tight"
                            dangerouslySetInnerHTML={{ __html: banner.description.replace(banner.description.split(" ").slice(-3).join(" "), "<br />" + banner.description.split(" ").slice(-3).join(" ")) }}>
                          </h1>
                          <p className="text-sm md:text-md text-white mb-3">
                            FROM : Rs. <span className="text-white font-bold text-base md:text-xl">{banner.price}</span>
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </div>
            </Carousel>
        </div>

        {/* Side Banners */}
        <div className="hidden lg:flex flex-col gap-4">
          {cards.slice(0, 3).map(card => (
            <Card key={card.id} className="relative w-full flex-1 bg-secondary border-none overflow-hidden">
                <CardContent className="p-6">
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <h3 className="text-xl font-bold text-gray-800 mt-1">{card.description}</h3>
                    <p className="text-md mt-2">FROM <span className="text-red-500 font-bold text-lg">{card.price}</span></p>
                </CardContent>
                <Image
                    src={card.imageUrl}
                    alt={card.title}
                    width={120}
                    height={120}
                    className="absolute right-4 bottom-0 object-contain"
                    data-ai-hint={card.hint}
                />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
