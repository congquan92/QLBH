"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { OrderApi } from "@/api/order.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Helper } from "@/lib/helper";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { OrderSummary } from "@/types/order";

const DELIVERY_STATUSES = [
    { value: "PENDING", label: "Chờ xử lý", color: "yellow" },
    { value: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
    { value: "PACKED", label: "Đã đóng gói", color: "purple" },
    { value: "SHIPPED", label: "Đang giao", color: "indigo" },
    { value: "DELIVERED", label: "Đã giao", color: "cyan" },
    { value: "COMPLETED", label: "Hoàn thành", color: "green" },
    { value: "CANCELLED", label: "Đã hủy", color: "red" },
] as const;

export default function OrdersPage() {
    const { hasPermission } = useAdminAuth();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    const canViewOrders = hasPermission("VIEW_ORDERS_ADMIN");
    const canUpdateStatus = hasPermission("UPDATE_ORDER_STATUS");

    async function fetchOrders() {
        if (!canViewOrders) {
            setOrders([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const orderRes = await OrderApi.getAdminOrders({ page: 1, size: 100, sort: "id:desc" });
        setOrders(orderRes.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchOrders();
    }, [canViewOrders]);

    async function handleChangeStatus(orderId: number, newStatus: string) {
        if (!canUpdateStatus) {
            toast.error("Bạn không có quyền cập nhật trạng thái đơn hàng");
            return;
        }

        setUpdatingOrderId(orderId);
        const res = await OrderApi.changeStatus(orderId, newStatus);
        setUpdatingOrderId(null);

        if (res.status === 200) {
            toast.success(`Đã cập nhật trạng thái đơn #${orderId} thành ${newStatus}`);
            await fetchOrders();
        } else {
            toast.error(res.message || "Không thể cập nhật trạng thái");
        }
    }

    async function handleCompleteOrder(orderId: number) {
        if (!canUpdateStatus) {
            toast.error("Bạn không có quyền hoàn thành đơn hàng");
            return;
        }

        setUpdatingOrderId(orderId);
        const res = await OrderApi.complete(orderId);
        setUpdatingOrderId(null);

        if (res.status === 200) {
            toast.success(`Đã hoàn thành đơn hàng #${orderId}`);
            await fetchOrders();
        } else {
            toast.error(res.message || "Không thể hoàn thành đơn hàng");
        }
    }

    async function handleCancelOrder(orderId: number) {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

        setUpdatingOrderId(orderId);
        const res = await OrderApi.cancel(orderId);
        setUpdatingOrderId(null);

        if (res.status === 200) {
            toast.success(`Đã hủy đơn hàng #${orderId}`);
            await fetchOrders();
        } else {
            toast.error(res.message || "Không thể hủy đơn hàng");
        }
    }

    const getStatusColor = (status?: string) => {
        const statusDef = DELIVERY_STATUSES.find((s) => s.value === status);
        const color = statusDef?.color || "gray";

        switch (color) {
            case "yellow":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "blue":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "purple":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
            case "indigo":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
            case "cyan":
                return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
            case "green":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "red":
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

            {isLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải danh sách đơn hàng...
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách đơn hàng</CardTitle>
                            <CardDescription>{canViewOrders ? "Theo dõi tình trạng và chi tiết đơn hàng" : "Bạn chưa có quyền VIEW_ORDERS_ADMIN"}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Tìm kiếm đơn hàng..." className="pl-8 w-62.5" />
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
                                {canViewOrders &&
                                    orders.map((order) => {
                                        const currentStatus = String(order.orderStatus ?? "PENDING");
                                        const isUpdating = updatingOrderId === order.id;
                                        const canDoActions = canUpdateStatus && currentStatus !== "CANCELLED" && currentStatus !== "COMPLETED";

                                        return (
                                            <tr key={order.id} className="border-b hover:bg-muted/50">
                                                <td className="px-6 py-4 font-medium">#{order.id}</td>
                                                <td className="px-6 py-4">{String(order.customer_name ?? order.customerName ?? "Unknown")}</td>
                                                <td className="px-6 py-4">{order.createdAt ? new Date(String(order.createdAt)).toLocaleDateString("vi-VN") : "-"}</td>
                                                <td className="px-6 py-4">{Array.isArray(order.orderItem) ? order.orderItem.length : 0} sản phẩm</td>
                                                <td className="px-6 py-4 font-medium">{Helper.formatPrice(String(order.totalAmount ?? 0))}</td>
                                                <td className="px-6 py-4">
                                                    {canUpdateStatus && canDoActions ? (
                                                        <Select value={currentStatus} onValueChange={(val) => handleChangeStatus(order.id, val)} disabled={isUpdating}>
                                                            <SelectTrigger className="w-40">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {DELIVERY_STATUSES.filter((s) => s.value !== "CANCELLED").map((status) => (
                                                                    <SelectItem key={status.value} value={status.value}>
                                                                        {status.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>{DELIVERY_STATUSES.find((s) => s.value === currentStatus)?.label || currentStatus}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {canUpdateStatus && currentStatus === "DELIVERED" && (
                                                            <Button variant="outline" size="sm" onClick={() => handleCompleteOrder(order.id)} disabled={isUpdating}>
                                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                            </Button>
                                                        )}
                                                        {canDoActions && (
                                                            <Button variant="destructive" size="sm" onClick={() => handleCancelOrder(order.id)} disabled={isUpdating}>
                                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                            </Button>
                                                        )}
                                                        {!canDoActions && currentStatus === "COMPLETED" && <span className="text-xs text-green-600 font-medium">✓ Đã hoàn thành</span>}
                                                        {!canDoActions && currentStatus === "CANCELLED" && <span className="text-xs text-red-600 font-medium">✗ Đã hủy</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                {!canViewOrders && (
                                    <tr>
                                        <td className="px-6 py-8 text-muted-foreground" colSpan={7}>
                                            Bạn chưa được cấp quyền xem danh sách đơn hàng.
                                        </td>
                                    </tr>
                                )}
                                {canViewOrders && orders.length === 0 && !isLoading && (
                                    <tr>
                                        <td className="px-6 py-8 text-muted-foreground" colSpan={7}>
                                            Chưa có dữ liệu đơn hàng.
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
