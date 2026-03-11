"use client";

import ProductGrid from "@/components/feature/ProductGrid";
import { Product, ProductListResponse } from "@/types/product";
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
            <ProductGrid products={products} />

            {/* Pagination */}
            <ProductPagination currentPage={data.data.pageNumber} totalPages={data.data.totalPages} />
        </div>
    );
}
