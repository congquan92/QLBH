import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";

export default function OrdersPage() {
    const orders = [
        { id: 1001, customer: "Nguyễn Văn A", date: "2024-02-03", total: "2,500,000đ", status: "Đang xử lý", items: 3 },
        { id: 1002, customer: "Trần Thị B", date: "2024-02-03", total: "1,800,000đ", status: "Đã giao", items: 2 },
        { id: 1003, customer: "Lê Văn C", date: "2024-02-02", total: "3,200,000đ", status: "Đang giao", items: 5 },
        { id: 1004, customer: "Phạm Thị D", date: "2024-02-02", total: "950,000đ", status: "Đã hủy", items: 1 },
        { id: 1005, customer: "Hoàng Văn E", date: "2024-02-01", total: "4,500,000đ", status: "Đã giao", items: 4 },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Đang xử lý":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "Đang giao":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "Đã giao":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "Đã hủy":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Đơn hàng</h1>
                    <p className="text-muted-foreground">Quản lý và theo dõi tất cả đơn hàng</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo đơn hàng
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách đơn hàng</CardTitle>
                            <CardDescription>Theo dõi tình trạng và chi tiết đơn hàng</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Tìm kiếm đơn hàng..." className="pl-8 w-[250px]" />
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
                                    <th className="px-6 py-3">Mã đơn</th>
                                    <th className="px-6 py-3">Khách hàng</th>
                                    <th className="px-6 py-3">Ngày đặt</th>
                                    <th className="px-6 py-3">Số lượng</th>
                                    <th className="px-6 py-3">Tổng tiền</th>
                                    <th className="px-6 py-3">Trạng thái</th>
                                    <th className="px-6 py-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b hover:bg-muted/50">
                                        <td className="px-6 py-4 font-medium">#{order.id}</td>
                                        <td className="px-6 py-4">{order.customer}</td>
                                        <td className="px-6 py-4">{order.date}</td>
                                        <td className="px-6 py-4">{order.items} sản phẩm</td>
                                        <td className="px-6 py-4 font-medium">{order.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    Xem
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Cập nhật
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
