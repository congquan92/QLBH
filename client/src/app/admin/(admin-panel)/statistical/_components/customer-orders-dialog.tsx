import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Helper } from "@/lib/helper";
import type { TopCustomerStats } from "@/types/statistics";

type CustomerOrdersDialogProps = {
    customer: TopCustomerStats | null;
    onClose: () => void;
};

export function CustomerOrdersDialog({ customer, onClose }: CustomerOrdersDialogProps) {
    return (
        <Dialog open={Boolean(customer)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Đơn hàng của {customer?.customerName ?? "-"}</DialogTitle>
                    <DialogDescription>
                        Tổng mua: {Helper.formatCurrency(Number(customer?.totalPurchase ?? 0))} | Số đơn: {Helper.formatNumber(customer?.orderCount ?? 0)}
                    </DialogDescription>
                </DialogHeader>

                {customer ? (
                    customer.orders.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/60 text-xs uppercase">
                                    <tr>
                                        <th className="px-3 py-2">Mã đơn</th>
                                        <th className="px-3 py-2">Ngày đặt</th>
                                        <th className="px-3 py-2">Trạng thái</th>
                                        <th className="px-3 py-2">Giá trị</th>
                                        <th className="px-3 py-2 text-right">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.orders.map((order) => (
                                        <tr key={order.orderId} className="border-t">
                                            <td className="px-3 py-2 font-medium">#{order.orderId}</td>
                                            <td className="px-3 py-2">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}</td>
                                            <td className="px-3 py-2">{order.orderStatus || "-"}</td>
                                            <td className="px-3 py-2">{Helper.formatCurrency(Number(order.totalAmount || 0))}</td>
                                            <td className="px-3 py-2 text-right">
                                                <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/orders?orderId=${order.orderId}`}>
                                                    Xem chi tiết
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Khách hàng chưa có đơn trong kỳ thống kê.</p>
                    )
                ) : null}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
