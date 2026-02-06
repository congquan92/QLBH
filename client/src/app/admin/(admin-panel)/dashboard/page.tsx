import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    const stats = [
        {
            title: "Tổng doanh thu",
            value: "124,500,000đ",
            description: "+20.1% so với tháng trước",
            icon: TrendingUp,
            trend: "up",
        },
        {
            title: "Đơn hàng",
            value: "1,234",
            description: "+15% so với tháng trước",
            icon: ShoppingCart,
            trend: "up",
        },
        {
            title: "Sản phẩm",
            value: "256",
            description: "8 sản phẩm mới",
            icon: Package,
            trend: "neutral",
        },
        {
            title: "Khách hàng",
            value: "3,456",
            description: "+45 khách hàng mới",
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
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                        <Package className="h-4 w-4" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Đơn hàng #{1000 + i}</p>
                                        <p className="text-sm text-muted-foreground">{i} giờ trước</p>
                                    </div>
                                    <div className="ml-auto font-medium">100.000đ</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
