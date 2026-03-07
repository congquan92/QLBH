import { OrderApi } from "@/api/order.api";
import { ProductApi } from "@/api/product.api";
import { UserApi } from "@/api/user.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Helper } from "@/lib/helper";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
    const [orderRes, productRes, userRes] = await Promise.all([OrderApi.getAdminOrders({ page: 1, size: 20 }), ProductApi.getAllProducts(1, 20), UserApi.getUsers({ page: 1, size: 20 })]);

    const orders = orderRes.data.data;
    const products = productRes.data.data;
    const users = userRes.data.data;

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
    const completedOrders = orders.filter((order) => String(order.orderStatus) === "COMPLETED").length;

    const stats = [
        {
            title: "Tổng doanh thu",
            value: Helper.formatPrice(String(totalRevenue)),
            description: `Tu ${orders.length} don hang gan nhat`,
            icon: TrendingUp,
            trend: "up",
        },
        {
            title: "Đơn hàng",
            value: String(orders.length),
            description: `${completedOrders} don da hoan tat`,
            icon: ShoppingCart,
            trend: "up",
        },
        {
            title: "Sản phẩm",
            value: String(products.length),
            description: "Nguon du lieu tu Product API",
            icon: Package,
            trend: "neutral",
        },
        {
            title: "Khách hàng",
            value: String(users.length),
            description: "Nguon du lieu tu User API",
            icon: Users,
            trend: "up",
        },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Xin chào! Đây là tổng quan về cửa hàng của bạn.</p>
            </div>

            <p className="text-xs text-amber-600">WARNING: Du lieu dashboard co the den tu fallback static neu backend loi auth/contract.</p>

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
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            <p>Biểu đồ sẽ được thêm vào sau</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Đơn hàng gần đây</CardTitle>
                        <CardDescription>Bạn có 15 đơn hàng mới trong tuần này</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orders.slice(0, 5).map((order) => (
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
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
