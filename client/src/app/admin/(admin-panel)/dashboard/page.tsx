"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { OrderApi } from "@/api/order.api";
import { ProductApi } from "@/api/product.api";
import { UserApi } from "@/api/user.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Helper } from "@/lib/helper";
import { Loader2, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { OrderSummary } from "@/types/order";
import type { Product } from "@/types/product";
import type { UserProfile } from "@/types/user";

export default function DashboardPage() {
    const { hasPermission, canAccessPath } = useAdminAuth();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const canViewOrders = hasPermission("VIEW_ORDERS_ADMIN");
    const canViewUsers = hasPermission("VIEW_USERS");
    const canViewProducts = hasPermission("VIEW_PRODUCTS_ADMIN") || canAccessPath("/admin/products");

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            setIsLoading(true);

            const [orderRes, productRes, userRes] = await Promise.all([
                canViewOrders ? OrderApi.getAdminOrders({ page: 1, size: 20 }) : Promise.resolve(null),
                canViewProducts ? ProductApi.getAllProducts(1, 20) : Promise.resolve(null),
                canViewUsers ? UserApi.getUsers({ page: 1, size: 20 }) : Promise.resolve(null),
            ]);

            if (!mounted) return;

            setOrders(orderRes?.data?.data ?? []);
            setProducts(productRes?.data?.data ?? []);
            setUsers(userRes?.data?.data ?? []);
            setIsLoading(false);
        }

        void fetchData();

        return () => {
            mounted = false;
        };
    }, [canViewOrders, canViewProducts, canViewUsers]);

    const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0), [orders]);
    const completedOrders = useMemo(() => orders.filter((order) => String(order.orderStatus) === "COMPLETED").length, [orders]);

    const stats = useMemo(
        () => [
            {
                title: "Tổng doanh thu",
                value: canViewOrders ? Helper.formatPrice(String(totalRevenue)) : "Không có quyền",
                description: canViewOrders ? `Từ ${orders.length} đơn hàng gần nhất` : "Yêu cầu quyền VIEW_ORDERS_ADMIN",
                icon: TrendingUp,
            },
            {
                title: "Đơn hàng",
                value: canViewOrders ? String(orders.length) : "Không có quyền",
                description: canViewOrders ? `${completedOrders} đơn đã hoàn tất` : "Yêu cầu quyền VIEW_ORDERS_ADMIN",
                icon: ShoppingCart,
            },
            {
                title: "Sản phẩm",
                value: canViewProducts ? String(products.length) : "Không có quyền",
                description: canViewProducts ? "Nguồn dữ liệu từ Product API" : "Yêu cầu quyền VIEW_PRODUCTS_ADMIN",
                icon: Package,
            },
            {
                title: "Khách hàng",
                value: canViewUsers ? String(users.length) : "Không có quyền",
                description: canViewUsers ? "Nguồn dữ liệu từ User API" : "Yêu cầu quyền VIEW_USERS",
                icon: Users,
            },
        ],
        [canViewOrders, canViewProducts, canViewUsers, completedOrders, orders.length, products.length, totalRevenue, users.length],
    );

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Xin chào! Đây là tổng quan về cửa hàng của bạn.</p>
            </div>

            {isLoading && (
                <div className="flex items-center text-muted-foreground text-sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải dữ liệu dashboard...
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Doanh thu</CardTitle>
                        <CardDescription>Biểu đồ doanh thu trong tháng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-50 flex items-center justify-center text-muted-foreground">
                            <p>Biểu đồ sẽ được thêm vào sau</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Đơn hàng gần đây</CardTitle>
                        <CardDescription>{canViewOrders ? `Bạn có ${orders.length} đơn hàng gần đây` : "Yêu cầu quyền VIEW_ORDERS_ADMIN"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {canViewOrders ? (
                                orders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Đơn hàng #{order.id}</p>
                                            <p className="text-sm text-muted-foreground">{order.createdAt ? new Date(String(order.createdAt)).toLocaleString("vi-VN") : "-"}</p>
                                        </div>
                                        <div className="ml-auto font-medium">{Helper.formatPrice(String(order.totalAmount ?? 0))}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground">Bạn chưa được cấp quyền xem danh sách đơn hàng.</div>
                            )}
                            {canViewOrders && orders.length === 0 && !isLoading && <div className="text-sm text-muted-foreground">Chưa có đơn hàng để hiển thị.</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
