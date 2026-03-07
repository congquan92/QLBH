"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { ProductApi } from "@/api/product.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Loader2, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Helper } from "@/lib/helper";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types/product";

type ProductForm = {
    id?: number;
    name: string;
    description: string;
    salePrice: string;
    category_id: string;
};

const emptyForm: ProductForm = {
    name: "",
    description: "",
    salePrice: "",
    category_id: "",
};

export default function ProductsPage() {
    const { hasPermission } = useAdminAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [searchKeyword, setSearchKeyword] = useState("");

    const canViewProducts = hasPermission("VIEW_PRODUCTS_ADMIN");

    async function fetchProducts() {
        if (!canViewProducts) {
            setProducts([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const productRes = await ProductApi.getAdminProducts(1, 100);
        setProducts(productRes.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchProducts();
    }, [canViewProducts]);

    function resetForm() {
        setForm(emptyForm);
        setShowForm(false);
    }

    function startEdit(item: Product) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            description: String(item.description ?? ""),
            salePrice: String(item.salePrice ?? ""),
            category_id: String((item as { category_id?: number }).category_id ?? ""),
        });
        setShowForm(true);
    }

    async function submitProduct() {
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên sản phẩm.");
            return;
        }

        const payload: Record<string, unknown> = {
            name: form.name.trim(),
            description: form.description.trim(),
            salePrice: Number(form.salePrice),
        };
        if (form.category_id) {
            payload.category_id = Number(form.category_id);
        }
        if (form.id) {
            payload.id = form.id;
        }

        setIsSaving(true);
        try {
            if (form.id) {
                await ProductApi.updateProduct(payload);
                toast.success("Cập nhật sản phẩm thành công.");
            } else {
                await ProductApi.addProduct(payload);
                toast.success("Tạo sản phẩm thành công.");
            }
            resetForm();
            await fetchProducts();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    async function removeProduct(id: number) {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

        setIsSaving(true);
        try {
            await ProductApi.deleteProduct(id);
            toast.success("Đã xóa sản phẩm.");
            if (form.id === id) {
                resetForm();
            }
            await fetchProducts();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleRestore(id: number) {
        setIsSaving(true);
        try {
            await ProductApi.restoreProduct(id);
            toast.success("Đã khôi phục sản phẩm.");
            await fetchProducts();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    const filteredProducts = searchKeyword.trim()
        ? products.filter(
              (p) =>
                  String(p.name ?? "")
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase()) ||
                  String(p.description ?? "")
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase()),
          )
        : products;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
                    <p className="text-muted-foreground">Quản lý danh sách sản phẩm của cửa hàng</p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(true); }}>
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

            {/* Product Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</CardTitle>
                        <CardDescription>Nhập thông tin sản phẩm</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Tên sản phẩm</Label>
                                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nhập tên sản phẩm" />
                            </div>
                            <div className="space-y-2">
                                <Label>Giá bán</Label>
                                <Input type="number" value={form.salePrice} onChange={(e) => setForm((prev) => ({ ...prev, salePrice: e.target.value }))} placeholder="Nhập giá" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Mô tả</Label>
                            <Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Nhập mô tả sản phẩm" />
                        </div>
                        <div className="space-y-2">
                            <Label>Danh mục (ID)</Label>
                            <Input value={form.category_id} onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))} placeholder="Nhập category ID" />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitProduct()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {form.id ? "Lưu" : "Tạo"}
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                                Hủy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách sản phẩm</CardTitle>
                            <CardDescription>{canViewProducts ? `${filteredProducts.length} sản phẩm` : "Bạn chưa có quyền VIEW_PRODUCTS_ADMIN"}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="pl-8 w-62.5"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                            </div>
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
                                    filteredProducts.map((product) => (
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
                                                    <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => void removeProduct(product.id)} disabled={isSaving}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    {product.status !== "ACTIVE" && (
                                                        <Button variant="outline" size="sm" onClick={() => void handleRestore(product.id)} disabled={isSaving} title="Khôi phục">
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    )}
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
                                {canViewProducts && filteredProducts.length === 0 && !isLoading && (
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
