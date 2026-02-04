"use client";

import { Product, ProductListResponse } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helper2 } from "@/lib/helper2";
import { Helper } from "@/lib/helper";
import ProductPagination from "./ProductPagination";

interface ListProductProps {
    products: Product[];
    data: ProductListResponse;
}

export default function ListProduct({ products, data }: ListProductProps) {
    if (!products || products.length === 0) {
        return (
            <div className="mx-auto px-4 py-16">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Không có sản phẩm nào</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 py-8">
            {/* Grid sản phẩm */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                    <div key={product.id} className="group bg-white border border-gray-200 hover:border-red-500 transition-all duration-300 hover:shadow-lg">
                        {/* Hình ảnh sản phẩm */}
                        <Link href={`/san-pham/${product.id}/${encodeURIComponent(product.name)}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                            <Image src={product.urlImageCover} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw" />

                            {/* Badge */}
                            {product.status === "ACTIVE" && (
                                <Badge variant="destructive" className="absolute top-2 left-2 text-xs font-semibold">
                                    Bán chạy
                                </Badge>
                            )}

                            {/* Quick view button - hiện khi hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button variant="secondary" size="sm" className="bg-white hover:bg-gray-100 cursor-pointer rounded-none">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Xem nhanh
                                </Button>
                            </div>
                        </Link>

                        {/* Thông tin sản phẩm */}
                        <div className="p-3 md:p-4 space-y-2">
                            <Link href={`/san-pham/${product.id}/${encodeURIComponent(product.name)}`}>
                                <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2 hover:underline min-h-[2.5rem] md:min-h-[3rem]">{product.name}</h3>
                            </Link>

                            {/* Rating và số lượng đã bán */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    {Helper2.renderStars(product.avgRating)}
                                    <span className="ml-1">({product.avgRating.toFixed(1)})</span>
                                </div>
                                <span>Đã bán {product.soldQuantity}</span>
                            </div>

                            {/* Giá */}
                            <div className="flex items-baseline gap-2">
                                {product.salePrice !== product.listPrice ? (
                                    <>
                                        <span className="text-base md:text-lg font-bold text-red-600">{Helper.formatPrice(product.salePrice)}</span>
                                        <span className="text-xs md:text-sm text-gray-400 line-through">{Helper.formatPrice(product.listPrice)}</span>
                                    </>
                                ) : (
                                    <span className="text-base md:text-lg font-bold text-red-600">{Helper.formatPrice(product.salePrice)}</span>
                                )}
                            </div>

                            {/* Các nút hành động */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer rounded-none">
                                    <ShoppingCart className="size-4 mr-1" />
                                    Thêm vào giỏ
                                </Button>
                                <Button variant="default" size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer rounded-none">
                                    <ShoppingCart className="size-4 mr-1" />
                                    Mua ngay
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <ProductPagination currentPage={data.data.pageNumber} totalPages={data.data.totalPages} />
        </div>
    );
}
