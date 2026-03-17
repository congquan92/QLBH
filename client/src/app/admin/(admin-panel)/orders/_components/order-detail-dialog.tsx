import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Helper } from "@/lib/helper";
import type { OrderSummary } from "@/types/order";
import { getStatusLabel } from "./order-status";

type OrderDetailDialogProps = {
    order: OrderSummary | null;
    onClose: () => void;
};

function formatDateTime(value: unknown): string {
    if (!value) return "-";
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("vi-VN");
}

function parseVariantSnapshot(value: unknown): string {
    if (!value) return "-";
    const raw = String(value);

    try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return Object.entries(parsed)
            .map(([key, val]) => `${key}: ${String(val ?? "-")}`)
            .join(" | ");
    } catch {
        return raw;
    }
}

export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
    const items = Array.isArray(order?.orderItemResponses) ? order.orderItemResponses : Array.isArray(order?.orderItem) ? order.orderItem : [];

    return (
        <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] sm:max-w-200 overflow-y-auto ">
                <DialogHeader>
                    <DialogTitle>Chi tiết đơn hàng #{order?.id ?? "-"}</DialogTitle>
                    <DialogDescription>Xem thông tin khách hàng, giao hàng, thanh toán và danh sách sản phẩm của đơn.</DialogDescription>
                </DialogHeader>

                {order && (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Khách hàng</p>
                                <p className="font-medium">{String(order.customerName ?? "-")}</p>
                                <p className="text-muted-foreground">{String(order.customerPhone ?? "-")}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Trạng thái đơn</p>
                                <div className="mt-1">
                                    <Badge>{getStatusLabel(order.deliveryStatus ?? order.orderStatus)}</Badge>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">Thanh toán: {String(order.paymentStatus ?? "-")}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Giá trị đơn</p>
                                <p className="font-medium">{Helper.formatPrice(String(order.totalAmount ?? 0))}</p>
                                <p className="text-xs text-muted-foreground">Mã vận đơn: {String(order.orderTrackingCode ?? "-")}</p>
                            </div>
                        </div>

                        <div className="rounded-md border p-3">
                            <p className="mb-2 text-xs text-muted-foreground">Địa chỉ giao hàng</p>
                            <p>
                                {String(order.deliveryAddress ?? "-")}, {String(order.deliveryWardName ?? "-")}, {String(order.deliveryDistrictName ?? "-")}, {String(order.deliveryProvinceName ?? "-")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Ngày tạo đơn</p>
                                <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Cập nhật lần cuối</p>
                                <p className="font-medium">{formatDateTime(order.updatedAt)}</p>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <div className="border-b p-3">
                                <p className="text-sm font-semibold">Sản phẩm trong đơn</p>
                            </div>
                            <div className="divide-y">
                                {items.length > 0 ? (
                                    items.map((item, index) => (
                                        <div key={String(item.orderItemId ?? index)} className="grid grid-cols-1 gap-2 p-3 md:grid-cols-[1fr_auto]">
                                            <div>
                                                <p className="font-medium">{String(item.nameProductSnapShot ?? item.nameProductSnapshot ?? "Sản phẩm")}</p>
                                                <p className="text-xs text-muted-foreground">Phân loại: {parseVariantSnapshot(item.variantSnapShot)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    SL: {String(item.quantity ?? 0)} | Giá gốc: {Helper.formatPrice(String(item.listPriceSnapShot ?? 0))}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Thành tiền</p>
                                                <p className="font-semibold">{Helper.formatPrice(String(item.finalPrice ?? 0))}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-muted-foreground">Không có dữ liệu sản phẩm.</div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border p-3">
                            <p className="text-xs text-muted-foreground">Ghi chú</p>
                            <p>{String(order.note ?? "-")}</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
