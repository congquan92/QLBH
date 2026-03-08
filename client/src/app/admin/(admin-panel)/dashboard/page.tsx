"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { OrderApi } from "@/api/order.api";
import { ProductApi } from "@/api/product.api";
import { UserApi } from "@/api/user.api";
import { StatisticsApi } from "@/api/statistics.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helper } from "@/lib/helper";
import { Loader2, Package, ShoppingCart, Users, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { OrderSummary } from "@/types/order";
import type { Product } from "@/types/product";
import type { ActiveUserStats, MonthlyRevenue, OrderStats, TopProduct } from "@/types/statistics";
import type { UserProfile } from "@/types/user";

export default function DashboardPage() {
    const { hasPermission, canAccessPath } = useAdminAuth();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Statistics state
    const [period, setPeriod] = useState(1);
    const [userStats, setUserStats] = useState<ActiveUserStats | null>(null);
    const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
    const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    const canViewOrders = hasPermission("VIEW_ORDERS_ADMIN");
    const canViewUsers = hasPermission("VIEW_USERS");
    const canViewProducts = hasPermission("VIEW_PRODUCTS_ADMIN") || canAccessPath("/admin/products");
    const canViewStats = hasPermission("VIEW_STATISTICAL");

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            setIsLoading(true);

            const [orderRes, productRes, userRes] = await Promise.all([
                canViewOrders ? OrderApi.getAdminOrders({ page: 1, size: 20 }) : Promise.resolve(null),
                canViewProducts ? ProductApi.getAdminProducts(1, 20) : Promise.resolve(null),
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

    useEffect(() => {
        let mounted = true;

        async function fetchStats() {
            if (!canViewStats) return;

            setIsLoadingStats(true);
            try {
                const [usersRes, ordersRes, revenueRes, topProdRes] = await Promise.all([StatisticsApi.getActiveUsers(period), StatisticsApi.getOrders(period), StatisticsApi.getRevenue12Months(), StatisticsApi.getTopProducts(period, 5)]);

                if (!mounted) return;

                setUserStats(usersRes.data);
                setOrderStats(ordersRes.data);
                setRevenueData(revenueRes.data || []);
                setTopProducts(topProdRes.data || []);
            } catch (error) {
                console.error("Failed to fetch statistics", error);
            } finally {
                setIsLoadingStats(false);
            }
        }

        void fetchStats();

        return () => {
            mounted = false;
        };
    }, [canViewStats, period]);

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Xin chào! Đây là tổng quan về cửa hàng của bạn.</p>
                </div>
                {canViewStats && (
                    <Select value={String(period)} onValueChange={(val) => setPeriod(Number(val))}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">7 ngày</SelectItem>
                            <SelectItem value="2">30 ngày</SelectItem>
                            <SelectItem value="3">90 ngày</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center text-muted-foreground text-sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải dữ liệu dashboard...
                </div>
            )}

            {/* Basic Stats */}
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

            {/* Statistics Section */}
            {canViewStats && (
                <>
                    {isLoadingStats ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="text-muted-foreground">Đang tải thống kê...</span>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* User & Order Stats */}
                            <div className="grid gap-4 md:grid-cols-2">
                                {userStats && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Thống kê người dùng
                                            </CardTitle>
                                            <CardDescription>Dữ liệu người dùng hoạt động</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tổng người dùng:</span>
                                                <span className="font-semibold">{userStats.total_users}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Người dùng hoạt động:</span>
                                                <span className="font-semibold">{userStats.active_users}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Người dùng mới:</span>
                                                <span className="font-semibold text-green-600">+{userStats.new_users}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tỷ lệ tăng trưởng:</span>
                                                <span className="font-semibold">{userStats.growth_rate.toFixed(2)}%</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                {orderStats && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <ShoppingCart className="h-5 w-5" />
                                                Thống kê đơn hàng
                                            </CardTitle>
                                            <CardDescription>Dữ liệu đơn hàng trong kỳ</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tổng đơn hàng:</span>
                                                <span className="font-semibold">{orderStats.total_orders}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Hoàn thành:</span>
                                                <span className="font-semibold text-green-600">{orderStats.completed_orders}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Đã hủy:</span>
                                                <span className="font-semibold text-red-600">{orderStats.cancelled_orders}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tổng doanh thu:</span>
                                                <span className="font-semibold">{Helper.formatPrice(String(orderStats.total_revenue))}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Giá trị TB/đơn:</span>
                                                <span className="font-semibold">{Helper.formatPrice(String(orderStats.average_order_value))}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Revenue Chart */}
                            {revenueData.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Doanh thu 12 tháng
                                        </CardTitle>
                                        <CardDescription>Biểu đồ doanh thu, chi phí và lợi nhuận</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {revenueData.map((item, idx) => {
                                                const maxValue = Math.max(...revenueData.map((d) => d.revenue));
                                                const revenueWidth = (item.revenue / maxValue) * 100;
                                                const costWidth = (item.cost / maxValue) * 100;
                                                const profitWidth = (item.profit / maxValue) * 100;

                                                return (
                                                    <div key={idx} className="space-y-1">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium">{item.month}</span>
                                                            <span className="text-muted-foreground">{Helper.formatPrice(String(item.revenue))}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="h-2 w-full bg-muted rounded overflow-hidden">
                                                                <div className="h-full bg-blue-500" style={{ width: `${revenueWidth}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 bg-blue-500 rounded"></div>
                                                <span>Doanh thu</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Top Products */}
                            {topProducts.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <PieChart className="h-5 w-5" />
                                            Top sản phẩm bán chạy
                                        </CardTitle>
                                        <CardDescription>Top {topProducts.length} sản phẩm có doanh thu cao nhất</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {topProducts.map((product, idx) => (
                                                <div key={product.product_id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{idx + 1}</div>
                                                        <div>
                                                            <p className="font-medium">{product.product_name}</p>
                                                            <p className="text-xs text-muted-foreground">Đã bán: {product.total_sold}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{Helper.formatPrice(String(product.total_revenue))}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Đơn hàng gần đây</CardTitle>
                    <CardDescription>{canViewOrders ? `Bạn có ${orders.length} đơn hàng gần nhất` : "Yêu cầu quyền VIEW_ORDERS_ADMIN"}</CardDescription>
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
    );
}
