import { ProductApi } from "@/api/product.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { Helper } from "@/lib/helper";

export default async function ProductsPage() {
    const productRes = await ProductApi.getAllProducts(1, 20);
    const products = productRes.data.data;

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

            <p className="text-xs text-amber-600">WARNING: Danh sach nay tu API + fallback tinh neu backend loi auth/contract.</p>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách sản phẩm</CardTitle>
                            <CardDescription>Quản lý và theo dõi tất cả sản phẩm</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Tìm kiếm sản phẩm..." className="pl-8 w-[250px]" />
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
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b hover:bg-muted/50">
                                        <td className="px-6 py-4 font-medium">#{product.id}</td>
                                        <td className="px-6 py-4">{product.name}</td>
                                        <td className="px-6 py-4 max-w-[260px] truncate">{product.description}</td>
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
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
