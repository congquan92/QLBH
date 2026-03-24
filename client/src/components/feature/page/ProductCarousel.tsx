"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Helper } from "@/lib/helper";
import { Helper2 } from "@/lib/helper2";
import { Product } from "@/types/product";
import { Eye, ShoppingCart } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface ProductCarouselProps {
    products: Product[];
    emptyMessage?: string;
}

export default function ProductCarousel({ products, emptyMessage = "Không có sản phẩm nào." }: ProductCarouselProps) {
    // Khởi tạo Embla
    const [emblaRef] = useEmblaCarousel(
        {
            align: "start",
            loop: true,
            dragFree: true, // Cho phép vuốt tự do
        },
        [Autoplay({ delay: 4000, stopOnInteraction: false })],
    );

    if (!products || products.length === 0) {
        return <div className="border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">{emptyMessage}</div>;
    }

    return (
        <div className="w-full">
            {/* Viewport của Embla */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4">
                    {products.map((product) => {
                        const href = `/san-pham/${product.id}/${encodeURIComponent(product.name)}`;

                        return (
                            <div
                                key={product.id}
                                // Responsive: Mobile hiện 1.5 cái, Tablet 3 cái, Desktop 4-5 cái
                                className="flex-[0_0_70%] min-w-0 pl-4 sm:flex-[0_0_33.33%] lg:flex-[0_0_25%] xl:flex-[0_0_20%]"
                            >
                                <article className="group overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:border-red-500 hover:shadow-lg">
                                    {/* Phần ảnh */}
                                    <Link href={href} className="relative block aspect-square overflow-hidden bg-gray-100">
                                        <Image src={product.urlImageCover} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 70vw, (max-width: 1200px) 25vw, 20vw" />

                                        {product.status === "ACTIVE" && (
                                            <Badge variant="destructive" className="absolute left-2 top-2 text-xs font-semibold">
                                                Đang bán
                                            </Badge>
                                        )}

                                        {/* Overlay xem nhanh */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
                                            <span className="inline-flex items-center gap-2 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm">
                                                <Eye className="size-4" />
                                                Xem nhanh
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Phần thông tin */}
                                    <div className="space-y-3 p-3 md:p-4">
                                        <Link href={href}>
                                            <h3 className="min-h-[2.5rem] text-sm font-medium text-gray-900 hover:underline md:min-h-[3rem] md:text-base line-clamp-2">{product.name}</h3>
                                        </Link>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                {Helper2.renderStars(product.avgRating)}
                                                <span>({product.avgRating.toFixed(1)})</span>
                                            </div>
                                            <span>Đã bán {product.soldQuantity}</span>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className="text-base font-bold text-red-600 md:text-lg">{Helper.formatPrice(product.salePrice)}</span>
                                            {product.salePrice !== product.listPrice && <span className="text-xs text-gray-400 line-through md:text-sm">{Helper.formatPrice(product.listPrice)}</span>}
                                        </div>

                                        {/* Nút thao tác */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                href={href}
                                                className="inline-flex items-center justify-center gap-2 border border-gray-300 px-2 py-2 text-[12px] font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
                                            >
                                                <Eye className="size-3" />
                                                Chi tiết
                                            </Link>
                                            <Link href={href} className="inline-flex items-center justify-center gap-2 bg-red-600 px-2 py-2 text-[12px] font-medium text-white transition-colors hover:bg-red-700">
                                                <ShoppingCart className="size-3" />
                                                Mua
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
