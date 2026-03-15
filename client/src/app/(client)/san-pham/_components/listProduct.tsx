"use client";

import { CategoryApi } from "@/api/category.api";
import { ProductApi } from "@/api/product.api";
import ProductGrid from "@/components/feature/page/ProductGrid";
import { Category } from "@/types/navbar";
import { Product, ProductListResponse } from "@/types/product";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import ProductPagination from "./ProductPagination";

interface ListProductProps {
    products: Product[];
    data: ProductListResponse;
    categoryId?: number;
    initialKeyword?: string;
    allowAdvancedFilter?: boolean;
}

type CategoryOption = {
    id: number;
    label: string;
};

function flattenCategoryOptions(categories: Category[], parentLabel = ""): CategoryOption[] {
    return categories.flatMap((category) => {
        const label = parentLabel ? `${parentLabel} / ${category.name}` : category.name;
        const children = flattenCategoryOptions(category.childCategory ?? [], label);
        return [{ id: category.id, label }, ...children];
    });
}

function parsePrice(value: string) {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return undefined;
    return parsed;
}

export default function ListProduct({ products, data, categoryId, initialKeyword = "", allowAdvancedFilter = false }: ListProductProps) {
    const pageSize = data.data.pageSize || 10;
    const [items, setItems] = useState<Product[]>(products);
    const [currentPage, setCurrentPage] = useState(data.data.pageNumber || 1);
    const [totalPages, setTotalPages] = useState(data.data.totalPages || 1);
    const [totalElements, setTotalElements] = useState(data.data.totalElements || products.length);
    const [isFetching, setIsFetching] = useState(false);

    const [keyword, setKeyword] = useState(initialKeyword);
    const [sort, setSort] = useState("id:desc");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId ? String(categoryId) : "");

    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

    useEffect(() => {
        setItems(products);
        setCurrentPage(data.data.pageNumber || 1);
        setTotalPages(data.data.totalPages || 1);
        setTotalElements(data.data.totalElements || products.length);
        setKeyword(initialKeyword);
    }, [products, data]);

    useEffect(() => {
        if (!allowAdvancedFilter || categoryId) {
            return;
        }

        let cancelled = false;
        const loadCategories = async () => {
            try {
                const response = await CategoryApi.getPublicCategories({ page: 1, size: 200 });
                if (cancelled) return;
                const options = flattenCategoryOptions(response.data.data).sort((a, b) => a.label.localeCompare(b.label, "vi"));
                setCategoryOptions(options);
            } catch {
                if (!cancelled) {
                    toast.error("Không tải được danh mục để lọc nâng cao.");
                }
            }
        };

        void loadCategories();
        return () => {
            cancelled = true;
        };
    }, [allowAdvancedFilter, categoryId]);

    const loadProducts = async (page: number) => {
        const normalizedMin = parsePrice(minPrice);
        const normalizedMax = parsePrice(maxPrice);

        if (normalizedMin !== undefined && normalizedMax !== undefined && normalizedMin > normalizedMax) {
            toast.error("Giá tối thiểu không được lớn hơn giá tối đa.");
            return;
        }

        setIsFetching(true);

        try {
            const activeCategoryId = categoryId ?? (selectedCategoryId ? Number(selectedCategoryId) : undefined);
            const query = {
                page,
                size: pageSize,
                keyword: keyword.trim() || undefined,
                sort,
                minPrice: normalizedMin,
                maxPrice: normalizedMax,
            };

            const response = activeCategoryId ? await ProductApi.getProductsByCategory(activeCategoryId, query) : await ProductApi.getAllProducts(query);

            setItems(response.data.data);
            setCurrentPage(response.data.pageNumber || page);
            setTotalPages(response.data.totalPages || 1);
            setTotalElements(response.data.totalElements || response.data.data.length);
        } catch {
            toast.error("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void loadProducts(1);
    };

    const handleReset = () => {
        setKeyword("");
        setSort("id:desc");
        setMinPrice("");
        setMaxPrice("");
        setSelectedCategoryId(categoryId ? String(categoryId) : "");
        window.setTimeout(() => {
            void loadProducts(1);
        }, 0);
    };

    const visibleCount = items.length;

    return (
        <div className="mx-auto px-4 py-8">
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                <aside className="h-fit border border-gray-200 bg-gray-50 p-4 md:p-5 lg:sticky lg:top-24">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-700">
                            <SlidersHorizontal className="size-4" />
                            Bộ lọc tìm kiếm
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Tên sản phẩm</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={keyword}
                                        onChange={(event) => setKeyword(event.target.value)}
                                        placeholder="Tìm tương đối theo tên..."
                                        className="h-10 w-full border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-red-500"
                                    />
                                </div>
                            </div>

                            {allowAdvancedFilter && (
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Phân loại</label>
                                    <select
                                        value={selectedCategoryId}
                                        onChange={(event) => setSelectedCategoryId(event.target.value)}
                                        disabled={!!categoryId}
                                        className="h-10 w-full border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-red-500 disabled:bg-gray-100"
                                    >
                                        <option value="">Tất cả danh mục</option>
                                        {categoryOptions.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Giá từ (VND)</label>
                                <input
                                    value={minPrice}
                                    onChange={(event) => setMinPrice(event.target.value)}
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    className="h-10 w-full border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Đến (VND)</label>
                                <input
                                    value={maxPrice}
                                    onChange={(event) => setMaxPrice(event.target.value)}
                                    type="number"
                                    min={0}
                                    placeholder="1000000"
                                    className="h-10 w-full border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Sắp xếp</label>
                                <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 w-full border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-red-500">
                                    <option value="id:desc">Mới nhất</option>
                                    <option value="id:asc">Cũ nhất</option>
                                    <option value="sale_price:asc">Giá tăng dần</option>
                                    <option value="sale_price:desc">Giá giảm dần</option>
                                    <option value="sold_quantity:desc">Bán chạy</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button type="submit" className="inline-flex h-10 items-center bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700" disabled={isFetching}>
                                {isFetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                                Tìm kiếm (AJAX)
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex h-10 items-center border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                                disabled={isFetching}
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </form>
                </aside>

                <section>
                    <div className="text-sm text-gray-600">
                        Hiển thị <span className="font-semibold text-gray-900">{visibleCount}</span> sản phẩm trên tổng <span className="font-semibold text-gray-900">{totalElements}</span> kết quả.
                    </div>

                    <div className="mt-6">
                        {isFetching ? (
                            <div className="border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">Đang tải sản phẩm...</div>
                        ) : !items || items.length === 0 ? (
                            <div className="border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">Không có sản phẩm phù hợp điều kiện tìm kiếm.</div>
                        ) : (
                            <ProductGrid products={items} />
                        )}
                    </div>

                    <ProductPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            if (page === currentPage || isFetching) return;
                            void loadProducts(page);
                        }}
                    />
                </section>
            </div>
        </div>
    );
}
