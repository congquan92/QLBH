import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helper } from "@/lib/helper";
import type { OrderSummary } from "@/types/order";
import { Eye, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderDetailDialog } from "./order-detail-dialog";
import { DELIVERY_STATUSES, type DeliveryStatusValue, getOrderStatus, getStatusColorClass, getStatusLabel } from "./order-status";

const STATUS_PROGRESS: DeliveryStatusValue[] = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED"];

function getProgressIndex(status: DeliveryStatusValue): number {
    return STATUS_PROGRESS.indexOf(status);
}

type OrdersTableProps = {
    orders: OrderSummary[];
    isLoading: boolean;
    updatingOrderId: number | null;
    onChangeStatus: (orderId: number, nextStatus: string) => Promise<void>;
    onCancelOrder: (orderId: number) => Promise<void>;
};

export function OrdersTable({ orders, isLoading, updatingOrderId, onChangeStatus, onCancelOrder }: OrdersTableProps) {
    const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);

    function handleSelectStatus(orderId: number, currentStatus: DeliveryStatusValue, selectedStatus: string) {
        const targetStatus = selectedStatus as DeliveryStatusValue;

        if (targetStatus === currentStatus) {
            toast.info("Đơn hàng đang ở trạng thái này");
            return;
        }

        if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
            toast.warning("Đơn đã ở trạng thái cuối, không thể chuyển thêm");
            return;
        }

        const currentIndex = getProgressIndex(currentStatus);
        const targetIndex = getProgressIndex(targetStatus);

        if (targetIndex === -1) {
            toast.warning("Trạng thái này không thể cập nhật từ danh sách");
            return;
        }

        if (targetIndex < currentIndex) {
            toast.warning("Không thể quay ngược về trạng thái đã đi qua");
            return;
        }

        if (targetIndex > currentIndex + 1) {
            toast.warning("Không thể nhảy cóc trạng thái. Vui lòng chuyển theo thứ tự.");
            return;
        }

        void onChangeStatus(orderId, targetStatus);
    }

    return (
        <>
            <div className="relative overflow-x-auto rounded-xl border">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Mã đơn</th>
                            <th className="px-6 py-3">Khách hàng</th>
                            <th className="px-6 py-3">Địa điểm giao</th>
                            <th className="px-6 py-3">Ngày đặt</th>
                            <th className="px-6 py-3">Số lượng</th>
                            <th className="px-6 py-3">Tổng tiền</th>
                            <th className="px-6 py-3">Trạng thái</th>
                            <th className="px-6 py-3">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const rawStatus = String(order.deliveryStatus ?? order.orderStatus ?? "PENDING");
                            const currentStatus = getOrderStatus(rawStatus);
                            const currentIndex = getProgressIndex(currentStatus);
                            const isUpdating = updatingOrderId === order.id;
                            const canCancel = currentStatus === "PENDING";
                            const itemCount = Array.isArray(order.orderItemResponses) ? order.orderItemResponses.length : Array.isArray(order.orderItem) ? order.orderItem.length : 0;

                            return (
                                <tr key={order.id} className="border-b align-top hover:bg-muted/40">
                                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                                    <td className="px-6 py-4">{String(order.customerName ?? order.customer_name ?? "Unknown")}</td>
                                    <td className="px-6 py-4 text-xs text-muted-foreground">
                                        <div>{String(order.deliveryDistrictName ?? "-")}</div>
                                        <div>{String(order.deliveryProvinceName ?? "-")}</div>
                                    </td>
                                    <td className="px-6 py-4">{order.createdAt ? new Date(String(order.createdAt)).toLocaleDateString("vi-VN") : "-"}</td>
                                    <td className="px-6 py-4">{itemCount} sản phẩm</td>
                                    <td className="px-6 py-4 font-medium">{Helper.formatPrice(String(order.totalAmount ?? 0))}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColorClass(currentStatus)}`}>{getStatusLabel(currentStatus)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex min-w-52 flex-wrap items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                <Eye className="h-4 w-4" />
                                                Xem chi tiết
                                            </Button>

                                            <Select value={currentStatus} onValueChange={(value) => handleSelectStatus(order.id, currentStatus, value)} disabled={isUpdating || currentStatus === "COMPLETED" || currentStatus === "CANCELLED"}>
                                                <SelectTrigger className="w-48">
                                                    <SelectValue placeholder={isUpdating ? "Đang cập nhật..." : "Chuyển trạng thái"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DELIVERY_STATUSES.map((status) => {
                                                        const targetIndex = getProgressIndex(status.value);
                                                        const isPassedOrCurrent = targetIndex !== -1 && targetIndex <= currentIndex;
                                                        const isCancelledOption = status.value === "CANCELLED";

                                                        return (
                                                            <SelectItem key={status.value} value={status.value} disabled={isPassedOrCurrent || isCancelledOption}>
                                                                {status.label}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>

                                            {canCancel && (
                                                <Button variant="destructive" size="sm" onClick={() => void onCancelOrder(order.id)} disabled={isUpdating}>
                                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                    Hủy đơn
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {!isLoading && orders.length === 0 && (
                            <tr>
                                <td className="px-6 py-8 text-muted-foreground" colSpan={8}>
                                    Chưa có dữ liệu đơn hàng theo bộ lọc hiện tại.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </>
    );
}
