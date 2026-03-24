"use client";

import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Giả định data của bạn
const categories = [
    { id: 1, name: "Áo Khoác", url: "/category/home_category_1_img.jpg", linkUrl: "/ao-nam/ao-khoac" },
    { id: 2, name: "Quần Kaki", url: "/category/home_category_3_img.jpg", linkUrl: "/quan-nam/quan-tay--kaki" },
    { id: 4, name: "Áo Polo", url: "/category/home_category_5_img.jpg", linkUrl: "/ao-nam/ao-polo" },
    { id: 5, name: "Áo sơ mi", url: "/category/home_category_7_img.jpg", linkUrl: "/ao-nam/ao-so-mi" },
    { id: 6, name: "Áo Thun", url: "/category/home_category_8_img.jpg", linkUrl: "/ao-nam/ao-thun" },
];

export default function HomeCategory() {
    // 1. Khởi tạo Embla với Autoplay
    const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 py-8">
            {/* Header: Tiêu đề và nút điều hướng */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 md:text-2xl">Khám phám các danh mục</h2>
                <div className="flex gap-2">
                    {/* Bạn có thể thêm nút Prev/Next của Embla ở đây nếu muốn giống icon mũi tên trong ảnh */}
                    <Link href="/danh-muc" className="text-sm font-medium hover:underline">
                        Xem tất cả
                    </Link>
                </div>
            </div>

            {/* 2. Embla Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y -ml-4">
                    {categories.map((category) => (
                        <div key={category.id} className="flex-[0_0_70%] min-w-0 pl-4 sm:flex-[0_0_40%] lg:flex-[0_0_25%]">
                            <Link href={category.linkUrl} className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-gray-100">
                                {/* Next.js Image tối ưu */}
                                <Image src={category.url} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 25vw" />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                {/* Nội dung text chèn lên ảnh */}
                                <div className="absolute bottom-0 left-0 flex w-full items-center justify-between p-4 text-white">
                                    <span className="text-sm font-medium uppercase md:text-base">{category.name}</span>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-colors group-hover:bg-black group-hover:text-white">
                                        <span className="text-lg">→</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
