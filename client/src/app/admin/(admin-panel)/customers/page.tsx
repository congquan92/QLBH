"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { UserApi } from "@/api/user.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, Mail, Phone, UserCheck, UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Helper } from "@/lib/helper";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/types/user";

export default function CustomersPage() {
    const { hasPermission } = useAdminAuth();
    const [customers, setCustomers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");

    const canViewCustomers = hasPermission("VIEW_USERS");
    const canUpdateStatus = hasPermission("ASSIGN_STATUS");

    async function fetchCustomers() {
        if (!canViewCustomers) {
            setCustomers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const usersRes = await UserApi.getUsers({ page: 1, size: 100, sort: "id:desc" });
        setCustomers(usersRes.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchCustomers();
    }, [canViewCustomers]);

    async function handleToggleStatus(userId: number, currentStatus: string) {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        setIsSaving(true);
        try {
            await UserApi.updateUserStatus(userId, { status: newStatus });
            toast.success(`Đã ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} tài khoản.`);
            await fetchCustomers();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    const filteredCustomers = searchKeyword.trim()
        ? customers.filter(
              (c) =>
                  String(c.fullName ?? c.username ?? "")
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase()) ||
                  String(c.email ?? "")
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase()),
          )
        : customers;

    const getRankColor = (rank?: string) => {
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
            </div>

            {isLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải danh sách khách hàng...
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách khách hàng</CardTitle>
                            <CardDescription>{canViewCustomers ? `${filteredCustomers.length} khách hàng` : "Bạn chưa có quyền VIEW_USERS"}</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm khách hàng..."
                                className="pl-8 w-62.5"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
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
                                {canViewCustomers &&
                                    filteredCustomers.map((customer) => {
                                        const status = String(customer.status ?? "ACTIVE");
                                        return (
                                            <tr key={customer.id} className="border-b hover:bg-muted/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={`/avatars/${customer.id}.png`} alt={String(customer.fullName ?? customer.username ?? "U")} />
                                                            <AvatarFallback>{String(customer.fullName ?? customer.username ?? "U").charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{String(customer.fullName ?? customer.username ?? "Unknown")}</div>
                                                            <div className="text-xs text-muted-foreground">ID: #{customer.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Mail className="h-3 w-3" />
                                                            {String(customer.email ?? "-")}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Phone className="h-3 w-3" />
                                                            {String(customer.phone ?? "-")}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankColor(String((customer as { rank?: string }).rank ?? "Đồng"))}`}>{String((customer as { rank?: string }).rank ?? "Đồng")}</span>
                                                </td>
                                                <td className="px-6 py-4">{Number((customer as { orderCount?: number }).orderCount ?? 0)} đơn</td>
                                                <td className="px-6 py-4 font-medium">{Helper.formatPrice(String((customer as { totalSpent?: number }).totalSpent ?? 0))}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            status === "ACTIVE" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {canUpdateStatus && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => void handleToggleStatus(customer.id, status)}
                                                                disabled={isSaving}
                                                                title={status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
                                                            >
                                                                {status === "ACTIVE" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                {!canViewCustomers && (
                                    <tr>
                                        <td className="px-6 py-8 text-muted-foreground" colSpan={7}>
                                            Bạn chưa được cấp quyền xem danh sách khách hàng.
                                        </td>
                                    </tr>
                                )}
                                {canViewCustomers && filteredCustomers.length === 0 && !isLoading && (
                                    <tr>
                                        <td className="px-6 py-8 text-muted-foreground" colSpan={7}>
                                            Chưa có dữ liệu khách hàng.
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
