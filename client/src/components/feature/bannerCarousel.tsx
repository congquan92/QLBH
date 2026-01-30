"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
// import type { Banner } from "@/api/banner.api";

// interface BannerCarouselProps {
//     banners?: Banner[];
//     autoplay?: boolean;
//     className?: string;
// }

interface BannerCarouselProps {
    banners?: Banner[];
    autoplay?: boolean;
    className?: string;
}

export type Banner = {
    id: string;
    imageUrl: string;
    name: string;
};

export default function BannerCarousel({ banners = [], autoplay = true, className }: BannerCarouselProps) {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    const autoplayPlugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

    React.useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const scrollPrev = React.useCallback(() => {
        api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
        api?.scrollNext();
    }, [api]);

    if (banners.length === 0) {
        return (
            <div className={cn("relative w-full aspect-video flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg", className)}>
                <p className="text-gray-500">Chưa có banner để hiển thị</p>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full group", className)}>
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={autoplay ? [autoplayPlugin.current] : []}
                className="w-full"
            >
                <CarouselContent>
                    {banners.map((banner) => (
                        <CarouselItem key={banner.id} className="basis-full">
                            <div className="relative aspect-video md:aspect-21/9 w-full overflow-hidden bg-gray-200">
                                <Image src={banner.imageUrl} alt={banner.name} fill className="object-cover object-top" sizes="100vw" quality={95} priority />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Navigation Arrows */}
            <Button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-none bg-white/80 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer "
                aria-label="Previous"
            >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
            </Button>
            <Button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-none bg-white/80 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                aria-label="Next"
            >
                <ChevronRight className="h-6 w-6 text-gray-700" />
            </Button>

            {/* Dots Navigation - Google Maps Style */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 ">
                {Array.from({ length: count }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn("w-2 h-2 rounded-full transition-all duration-300", current === index ? "bg-blue-500 scale-110" : "bg-white/70 hover:bg-white")}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 right-4 z-10 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                {current + 1} / {count}
            </div>
        </div>
    );
}
