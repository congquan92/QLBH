import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Helper } from "@/lib/helper";
import type { Product } from "@/types/product";
import { Loader2, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";

type ProductTableProps = {
    products: Product[];
    isLoading: boolean;
    isSaving: boolean;
    canViewProducts: boolean;
    canUpdateProduct: boolean;
    canDeleteProduct: boolean;
    canRestoreProduct: boolean;
    searchKeyword: string;
    onSearchChange: (value: string) => void;
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

export function ProductTable({ products, isLoading, isSaving, canViewProducts, canUpdateProduct, canDeleteProduct, canRestoreProduct, searchKeyword, onSearchChange, getCategoryLabel, onEdit, onDelete, onRestore }: ProductTableProps) {
    return (
        <Card>
            <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <CardTitle>Danh sách sản phẩm</CardTitle>
                    <CardDescription>{canViewProducts ? `${products.length} sản phẩm phù hợp bộ lọc hiện tại` : "Bạn chưa có quyền xem danh sách sản phẩm."}</CardDescription>
                </div>

                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={searchKeyword} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm theo tên hoặc mô tả..." className="pl-9" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải danh sách sản phẩm...
                    </div>
                ) : !canViewProducts ? (
                    <div className="rounded-lg border border-dashed px-4 py-8 text-sm text-muted-foreground">Bạn chưa được cấp quyền VIEW_PRODUCTS_ADMIN.</div>
                ) : products.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-8 text-sm text-muted-foreground">Không có sản phẩm nào khớp điều kiện tìm kiếm.</div>
                ) : (
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
                                {products.map((product) => (
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
                                                {canUpdateProduct && (
                                                    <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDeleteProduct && product.status === "ACTIVE" && (
                                                    <Button variant="outline" size="sm" onClick={() => onDelete(product)} disabled={isSaving}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canRestoreProduct && product.status === "INACTIVE" && (
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
                )}
            </CardContent>
        </Card>
    );
}
