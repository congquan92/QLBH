import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CustomersPage() {
    const customers = [
        {
            id: 1,
            name: "Nguyễn Văn A",
            email: "nguyenvana@email.com",
            phone: "0123456789",
            rank: "Vàng",
            orders: 15,
            spent: "12,500,000đ",
            status: "Hoạt động",
        },
        {
            id: 2,
            name: "Trần Thị B",
            email: "tranthib@email.com",
            phone: "0987654321",
            rank: "Bạc",
            orders: 8,
            spent: "6,800,000đ",
            status: "Hoạt động",
        },
        {
            id: 3,
            name: "Lê Văn C",
            email: "levanc@email.com",
            phone: "0369852147",
            rank: "Đồng",
            orders: 3,
            spent: "2,300,000đ",
            status: "Hoạt động",
        },
        {
            id: 4,
            name: "Phạm Thị D",
            email: "phamthid@email.com",
            phone: "0258963147",
            rank: "Kim cương",
            orders: 25,
            spent: "28,500,000đ",
            status: "VIP",
        },
        {
            id: 5,
            name: "Hoàng Văn E",
            email: "hoangvane@email.com",
            phone: "0147258369",
            rank: "Bạc",
            orders: 6,
            spent: "4,200,000đ",
            status: "Hoạt động",
        },
    ];

    const getRankColor = (rank: string) => {
        switch (rank) {
            case "Kim cương":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "Vàng":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "Bạc":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
            case "Đồng":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Khách hàng</h1>
                    <p className="text-muted-foreground">Quản lý thông tin khách hàng</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm khách hàng
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách khách hàng</CardTitle>
                            <CardDescription>Quản lý và theo dõi thông tin khách hàng</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Tìm kiếm khách hàng..." className="pl-8 w-[250px]" />
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
                                    <th className="px-6 py-3">Khách hàng</th>
                                    <th className="px-6 py-3">Liên hệ</th>
                                    <th className="px-6 py-3">Xếp hạng</th>
                                    <th className="px-6 py-3">Đơn hàng</th>
                                    <th className="px-6 py-3">Tổng chi tiêu</th>
                                    <th className="px-6 py-3">Trạng thái</th>
                                    <th className="px-6 py-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={`/avatars/${customer.id}.png`} alt={customer.name} />
                                                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{customer.name}</div>
                                                    <div className="text-xs text-muted-foreground">ID: #{customer.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Mail className="h-3 w-3" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Phone className="h-3 w-3" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankColor(customer.rank)}`}>{customer.rank}</span>
                                        </td>
                                        <td className="px-6 py-4">{customer.orders} đơn</td>
                                        <td className="px-6 py-4 font-medium">{customer.spent}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    customer.status === "VIP" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                }`}
                                            >
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    Xem
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Sửa
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
