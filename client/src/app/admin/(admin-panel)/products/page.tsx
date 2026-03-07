"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { ProductApi } from "@/api/product.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { Helper } from "@/lib/helper";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";

export default function ProductsPage() {
    const { hasPermission } = useAdminAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const canViewProducts = hasPermission("VIEW_PRODUCTS_ADMIN");

    useEffect(() => {
        let mounted = true;

        async function fetchProducts() {
            if (!canViewProducts) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const productRes = await ProductApi.getAllProducts(1, 20);
            if (!mounted) return;

            setProducts(productRes.data.data);
            setIsLoading(false);
        }

        void fetchProducts();

        return () => {
            mounted = false;
        };
    }, [canViewProducts]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
                    <p className="text-muted-foreground">Quản lý danh sách sản phẩm của cửa hàng</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm sản phẩm
                </Button>
            </div>

            {isLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải danh sách sản phẩm...
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách sản phẩm</CardTitle>
                            <CardDescription>{canViewProducts ? "Quản lý và theo dõi tất cả sản phẩm" : "Bạn chưa có quyền VIEW_PRODUCTS_ADMIN"}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Tìm kiếm sản phẩm..." className="pl-8 w-62.5" />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted">
                                <tr>
                                    <th className="px-6 py-3">Mã SP</th>
                                    <th className="px-6 py-3">Tên sản phẩm</th>
                                    <th className="px-6 py-3">Mô tả</th>
                                    <th className="px-6 py-3">Giá</th>
                                    <th className="px-6 py-3">Đã bán</th>
                                    <th className="px-6 py-3">Trạng thái</th>
                                    <th className="px-6 py-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {canViewProducts &&
                                    products.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-muted/50">
                                            <td className="px-6 py-4 font-medium">#{product.id}</td>
                                            <td className="px-6 py-4">{product.name}</td>
                                            <td className="px-6 py-4 max-w-65 truncate">{product.description}</td>
                                            <td className="px-6 py-4">{Helper.formatPrice(product.salePrice)}</td>
                                            <td className="px-6 py-4">{product.soldQuantity}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        product.status === "ACTIVE" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                    }`}
                                                >
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        Sửa
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {!canViewProducts && (
                                    <tr>
                                        <td className="px-6 py-8 text-muted-foreground" colSpan={7}>
                                            Bạn chưa được cấp quyền xem danh sách sản phẩm.
                                        </td>
                                    </tr>
                                )}
                                {canViewProducts && products.length === 0 && !isLoading && (
                                    <tr>
                                        <td className="px-6 py-8 text-muted-foreground" colSpan={7}>
                                            Chưa có dữ liệu sản phẩm.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
