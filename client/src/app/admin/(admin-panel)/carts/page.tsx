"use client";

import { CartApi } from "@/api/cart.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBasket } from "lucide-react";
import { useEffect, useState } from "react";
import type { CartItem } from "@/types/cart";

export default function CartsPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            setIsLoading(true);
            const response = await CartApi.getMyCart({ page: 1, size: 30, sort: "id:desc" });
            if (!mounted) return;
            setItems(response.data.data);
            setIsLoading(false);
        }

        void fetchData();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <AdminPageShell title="Giỏ hàng" description="Theo dõi dữ liệu giỏ hàng hiện tại của người dùng">
            <Card>
                <CardHeader>
                    <CardTitle>Dữ liệu giỏ hàng</CardTitle>
                    <CardDescription>{items.length} dòng sản phẩm trong giỏ</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải giỏ hàng...
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={item.id ?? item.productId ?? index} className="rounded-md border p-3 flex items-center gap-2">
                                    <ShoppingBasket className="h-4 w-4" />
                                    <span>Cart #{String(item.id ?? "-")}</span>
                                </div>
                            ))}
                            {items.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu giỏ hàng.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
