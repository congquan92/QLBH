import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helper } from "@/lib/helper";
import type { Product } from "@/types/product";
import { Loader2, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import type { CategoryOption } from "./product-types";

type ProductTableProps = {
    products: Product[];
    isLoading: boolean;
    isSaving: boolean;
    searchKeyword: string;
    categoryFilterValue: string;
    categoryFilterOptions: CategoryOption[];
    onSearchChange: (value: string) => void;
    onCategoryFilterChange: (value: string) => void;
    getCategoryLabel: (categoryId: number) => string;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onRestore: (productId: number) => void;
};

function StatusBadge({ status }: { status: string }) {
    if (status === "ACTIVE") {
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Đang bán</Badge>;
    }

    if (status === "INACTIVE") {
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Đang ẩn</Badge>;
    }

    return <Badge variant="secondary">Ngừng sử dụng</Badge>;
}

export function ProductTable({ products, isLoading, isSaving, searchKeyword, categoryFilterValue, categoryFilterOptions, onSearchChange, onCategoryFilterChange, getCategoryLabel, onEdit, onDelete, onRestore }: ProductTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalItems = products.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword, categoryFilterValue]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedProducts = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return products.slice(start, start + pageSize);
    }, [products, safePage, pageSize]);

    const fromItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const toItem = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

    const visiblePages = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (safePage <= 4) {
            return [1, 2, 3, 4, 5, -1, totalPages];
        }

        if (safePage >= totalPages - 3) {
            return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, -1, safePage - 1, safePage, safePage + 1, -1, totalPages];
    }, [safePage, totalPages]);

    return (
        <Card>
            <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <CardTitle>Danh sách sản phẩm</CardTitle>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={searchKeyword} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm theo tên hoặc mô tả..." className="pl-9" />
                    </div>

                    <Select value={categoryFilterValue} onValueChange={onCategoryFilterChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Lọc theo phân loại" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all">Tất cả phân loại</SelectItem>
                            {categoryFilterOptions.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-230 text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3">Phân loại</th>
                                    <th className="px-4 py-3">Giá</th>
                                    <th className="px-4 py-3">Đã bán</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-4">
                                            <div className="flex gap-3">
                                                <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                                                <div className="space-y-2 pt-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-56" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : totalItems === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-8 text-sm text-muted-foreground">Không có sản phẩm nào khớp điều kiện tìm kiếm.</div>
                ) : (
                    <div className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-230 text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Sản phẩm</th>
                                        <th className="px-4 py-3">Phân loại</th>
                                        <th className="px-4 py-3">Giá</th>
                                        <th className="px-4 py-3">Đã bán</th>
                                        <th className="px-4 py-3">Trạng thái</th>
                                        <th className="px-4 py-3 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedProducts.map((product) => (
                                        <tr key={product.id} className="border-b align-top last:border-b-0 hover:bg-muted/20">
                                            <td className="px-4 py-4">
                                                <div className="flex gap-3">
                                                    <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted/40">
                                                        {product.urlImageCover ? (
                                                            <>
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={product.urlImageCover} alt={product.name} className="h-full w-full object-cover" />
                                                            </>
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-medium">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">Mã #{product.id}</p>
                                                        <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">{product.description || "Chưa có mô tả"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-medium">{getCategoryLabel(product.categoryId)}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-medium">{Helper.formatCurrency(product.salePrice)}</p>
                                                <p className="text-xs text-muted-foreground">Niêm yết: {Helper.formatCurrency(product.listPrice)}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-medium">{Helper.formatNumber(product.soldQuantity)}</p>
                                                <p className="text-xs text-muted-foreground">{product.soldQuantity > 0 ? "Sẽ chuyển sang ẩn khi xoá" : "Có thể xoá vĩnh viễn"}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <StatusBadge status={product.status} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {product.status === "ACTIVE" && (
                                                        <Button variant="outline" size="sm" onClick={() => onDelete(product)} disabled={isSaving}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {product.status === "INACTIVE" && (
                                                        <Button variant="outline" size="sm" onClick={() => onRestore(product.id)} disabled={isSaving} title="Khôi phục hiển thị">
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-muted-foreground">
                                Hiển thị {fromItem}-{toItem} trên {totalItems} sản phẩm
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Mỗi trang</span>
                                    <Select
                                        value={String(pageSize)}
                                        onValueChange={(value) => {
                                            setPageSize(Number(value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-9 w-22.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={safePage === 1}>
                                    Trước
                                </Button>

                                {visiblePages.map((page, index) =>
                                    page === -1 ? (
                                        <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
                                            ...
                                        </span>
                                    ) : (
                                        <Button key={page} variant={page === safePage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="min-w-9 px-3">
                                            {page}
                                        </Button>
                                    ),
                                )}

                                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={safePage === totalPages}>
                                    Sau
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
