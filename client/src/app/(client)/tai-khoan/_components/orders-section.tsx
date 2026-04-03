import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Helper } from "@/lib/helper";
import { OrderItem, OrderSummary } from "@/types/order";
import { ChevronDown, ChevronUp, Loader2, Receipt, RotateCcw, TicketPercent, Truck, XCircle } from "lucide-react";
import Image from "next/image";
import { formatDate, formatDateTime, getDeliveryStatusMeta, getPaymentStatusMeta, parseVariantSnapshot } from "./account-utils";

function getPaymentTypeLabel(value?: string) {
    const raw = String(value ?? "").toUpperCase();
    if (raw === "COD") return "COD";
    if (raw === "BANK_TRANSFER" || raw === "BANK_TRANFER") return "Thanh toán ngân hàng";
    return value || "-";
}

interface OrdersSectionProps {
    orders: OrderSummary[];
    orderDetails: Record<number, OrderSummary>;
    expandedOrderId: number | null;
    loadingOrderId: number | null;
    retryingOrderId: number | null;
    cancellingOrderId: number | null;
    reorderingOrderId: number | null;
    onToggleOrderDetail: (orderId: number) => void;
    onRetryPayment: (orderId: number) => void;
    onCancelOrder: (orderId: number) => void;
    onReorderOrder: (orderId: number) => void;
}

function getLineItems(order: OrderSummary): OrderItem[] {
    return (order.orderItemResponses ?? order.orderItem ?? []).map((item) => ({
        ...item,
        nameProductSnapshot: item.nameProductSnapshot ?? item.nameProductSnapShot,
    }));
}

function toNumber(value: unknown) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getVoucherTypeLabel(type?: string) {
    const raw = String(type ?? "").toUpperCase();
    if (raw === "PERCENTAGE") return "Giảm theo phần trăm";
    if (raw === "FIXED_AMOUNT") return "Giảm số tiền cố định";
    return raw || "Không xác định";
}

export function OrdersSection({
    orders,
    orderDetails,
    expandedOrderId,
    loadingOrderId,
    retryingOrderId,
    cancellingOrderId,
    reorderingOrderId,
    onToggleOrderDetail,
    onRetryPayment,
    onCancelOrder,
    onReorderOrder,
}: OrdersSectionProps) {
    return (
        <div className="border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <h2 className="mt-2 text-2xl font-semibold text-gray-900">Đơn hàng của tôi</h2>
                    <p className="mt-2 text-sm text-gray-600">Xem các đơn hàng của bạn.</p>
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">{orders.length} đơn hàng</div>
            </div>

            <div className="mt-6 space-y-4">
                {orders.length === 0 ? (
                    <div className="border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">Bạn chưa có đơn hàng nào.</div>
                ) : (
                    orders.map((order) => {
                        const detail = orderDetails[order.id];
                        const mergedOrder = detail ? { ...order, ...detail } : order;
                        const deliveryMeta = getDeliveryStatusMeta(mergedOrder.deliveryStatus || mergedOrder.orderStatus);
                        const paymentMeta = getPaymentStatusMeta(mergedOrder.paymentStatus);
                        const lineItems = getLineItems(mergedOrder);
                        const isExpanded = expandedOrderId === order.id;
                        const voucher = mergedOrder.voucherResponse;
                        const voucherDiscountValue = toNumber(voucher?.discountValue ?? voucher?.discount_value);
                        const voucherMaxDiscount = toNumber(voucher?.maxDiscountValue ?? voucher?.max_discount_value);
                        const voucherMinOrder = toNumber(voucher?.minDiscountValue ?? voucher?.min_discount_value);
                        const actualDiscount = toNumber(mergedOrder.discountValue);
                        const isShippingVoucher = Boolean(voucher?.isShipping ?? voucher?.is_shipping);
                        const currentStatus = String(mergedOrder.deliveryStatus || mergedOrder.orderStatus || "").toUpperCase();
                        const canCancelOrder = currentStatus === "PENDING";
                        const canReorderOrder = currentStatus === "CANCELLED";
                        const isCancellingOrder = cancellingOrderId === mergedOrder.id;
                        const isReorderingOrder = reorderingOrderId === mergedOrder.id;

                        return (
                            <article key={order.id} className="overflow-hidden border border-gray-200 bg-white">
                                <div className="border-b border-gray-200 bg-[#fffaf8] px-5 py-4">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Mã đơn {mergedOrder.orderTrackingCode || `#${order.id}`}</span>
                                                <Badge variant="outline" className={`rounded-md border px-2.5 py-1 text-xs ${deliveryMeta.className}`}>
                                                    {deliveryMeta.label}
                                                </Badge>
                                                <Badge variant="outline" className={`rounded-md border px-2.5 py-1 text-xs ${paymentMeta.className}`}>
                                                    {paymentMeta.label}
                                                </Badge>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-600">Đặt lúc: {formatDateTime(mergedOrder.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Tổng thanh toán</p>
                                            <p className="mt-1 text-xl font-bold text-red-600">{Helper.formatPrice(String(mergedOrder.totalAmount ?? 0))}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 px-5 py-4">
                                    {lineItems.map((item, index) => {
                                        const variants = parseVariantSnapshot(item.variantSnapShot);
                                        return (
                                            <div key={`${mergedOrder.id}-${item.orderItemId ?? item.id ?? index}`} className="grid gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[84px_1fr_auto] sm:items-start">
                                                <div className="relative aspect-square overflow-hidden border border-gray-200 bg-gray-100">
                                                    {item.urlImageSnapShot ? <Image src={item.urlImageSnapShot} alt={item.nameProductSnapshot || "Order item"} fill className="object-cover" sizes="84px" /> : null}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900">{item.nameProductSnapshot || `Sản phẩm #${index + 1}`}</h3>
                                                    {variants.length > 0 ? (
                                                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                                            {variants.map((variant) => (
                                                                <span key={`${variant.key}-${variant.value}`} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                                                                    {variant.key}: {variant.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                    <p className="mt-2 text-xs text-gray-500">Số lượng: x{item.quantity}</p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="text-sm font-semibold text-gray-900">{Helper.formatPrice(String(item.finalPrice ?? item.listPriceSnapShot ?? 0))}</p>
                                                    <p className="mt-1 text-xs text-gray-500">{item.isReviewed ? "Đã đánh giá" : "Chưa đánh giá"}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                            <span className="inline-flex items-center gap-1">
                                                <Truck className="h-3.5 w-3.5" />
                                                Giao tới: {[mergedOrder.deliveryAddress, mergedOrder.deliveryWardName, mergedOrder.deliveryDistrictName, mergedOrder.deliveryProvinceName].filter(Boolean).join(", ") || "Chưa cập nhật"}
                                            </span>
                                            {voucher ? (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-red-700">
                                                    <TicketPercent className="h-3.5 w-3.5" />
                                                    {voucher.description || "Có áp dụng voucher"}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {canCancelOrder ? (
                                                <Button
                                                    variant="outline"
                                                    className="rounded-none border-red-200 text-red-700 hover:border-red-600 hover:text-red-700"
                                                    onClick={() => onCancelOrder(mergedOrder.id)}
                                                    disabled={isCancellingOrder}
                                                >
                                                    {isCancellingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                                    Hủy đơn
                                                </Button>
                                            ) : null}
                                            {canReorderOrder ? (
                                                <Button
                                                    variant="outline"
                                                    className="rounded-none"
                                                    onClick={() => onReorderOrder(mergedOrder.id)}
                                                    disabled={isReorderingOrder}
                                                >
                                                    {isReorderingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                                                    Mua lại
                                                </Button>
                                            ) : null}
                                            <Button variant="outline" className="rounded-none" onClick={() => onToggleOrderDetail(order.id)}>
                                                {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                                                {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                                            </Button>
                                        </div>
                                    </div>

                                    {isExpanded ? (
                                        <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-700">
                                            {loadingOrderId === order.id ? (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Đang tải chi tiết đơn hàng...
                                                </div>
                                            ) : (
                                                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                                    <div className="space-y-3">
                                                        <div className="rounded-none border border-gray-200 bg-white p-4">
                                                            <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">Thông tin giao nhận</h4>
                                                            <div className="mt-3 space-y-1">
                                                                <p>
                                                                    <span className="font-semibold text-gray-900">Người nhận:</span> {mergedOrder.customerName || "-"}
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-gray-900">Số điện thoại:</span> {mergedOrder.customerPhone || "-"}
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-gray-900">Địa chỉ:</span>{" "}
                                                                    {[mergedOrder.deliveryAddress, mergedOrder.deliveryWardName, mergedOrder.deliveryDistrictName, mergedOrder.deliveryProvinceName].filter(Boolean).join(", ") || "-"}
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-gray-900">Ghi chú:</span> {mergedOrder.note || "Không có"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="rounded-none border border-gray-200 bg-white p-4">
                                                            <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">Theo dõi đơn hàng</h4>
                                                            <div className="mt-3 space-y-1">
                                                                <p>
                                                                    <span className="font-semibold text-gray-900">Mã tracking:</span> {mergedOrder.orderTrackingCode || `#${mergedOrder.id}`}
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-gray-900">Cập nhật cuối:</span> {formatDateTime(mergedOrder.updatedAt)}
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-gray-900">Đã xác nhận hoàn tất:</span> {mergedOrder.isConfirmed ? "Có" : "Chưa"}
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-gray-900">Phương thức thanh toán:</span> {getPaymentTypeLabel(mergedOrder.paymentType)}
                                                                </p>
                                                                {String(mergedOrder.paymentStatus ?? "").toUpperCase() === "UNPAID" && ["BANK_TRANSFER", "BANK_TRANFER"].includes(String(mergedOrder.paymentType ?? "").toUpperCase()) ? (
                                                                    <div className="space-y-2">
                                                                        <p className="font-medium text-amber-700">Đơn thanh toán ngân hàng đang ở trạng thái chưa thanh toán.</p>
                                                                        <Button
                                                                            size="sm"
                                                                            className="rounded-none bg-amber-600 hover:bg-amber-700"
                                                                            onClick={() => onRetryPayment(mergedOrder.id)}
                                                                            disabled={retryingOrderId === mergedOrder.id}
                                                                        >
                                                                            {retryingOrderId === mergedOrder.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                                            Thanh toán lại
                                                                        </Button>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-none border border-gray-200 bg-white p-4">
                                                        <h4 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
                                                            <Receipt className="h-4 w-4" />
                                                            Tổng kết thanh toán
                                                        </h4>
                                                        <div className="mt-4 space-y-2 text-sm">
                                                            <p className="flex items-center justify-between">
                                                                <span>Tạm tính</span>
                                                                <span>{Helper.formatPrice(String(mergedOrder.originalOrderAmount ?? 0))}</span>
                                                            </p>
                                                            <p className="flex items-center justify-between">
                                                                <span>Phí vận chuyển</span>
                                                                <span>{Helper.formatPrice(String(mergedOrder.totalFeeShip ?? 0))}</span>
                                                            </p>
                                                            <p className="flex items-center justify-between">
                                                                <span>Giảm giá</span>
                                                                <span>- {Helper.formatPrice(String(mergedOrder.discountValue ?? 0))}</span>
                                                            </p>
                                                            {voucher ? (
                                                                <div className="rounded-none border border-red-200 bg-red-50/40 p-3 text-xs text-red-900">
                                                                    <p className="font-semibold">Chi tiết voucher áp dụng</p>
                                                                    <div className="mt-2 space-y-1.5">
                                                                        <p className="flex items-start justify-between gap-3">
                                                                            <span className="text-red-800/80">Mô tả</span>
                                                                            <span className="text-right font-medium">{voucher.description || "Voucher khuyến mãi"}</span>
                                                                        </p>
                                                                        <p className="flex items-start justify-between gap-3">
                                                                            <span className="text-red-800/80">Loại</span>
                                                                            <span className="text-right font-medium">{getVoucherTypeLabel(String(voucher.type ?? ""))}</span>
                                                                        </p>
                                                                        <p className="flex items-start justify-between gap-3">
                                                                            <span className="text-red-800/80">Giá trị voucher</span>
                                                                            <span className="text-right font-medium">
                                                                                {String(voucher.type ?? "").toUpperCase() === "PERCENTAGE"
                                                                                    ? `${voucherDiscountValue}%`
                                                                                    : Helper.formatPrice(String(voucherDiscountValue))}
                                                                            </span>
                                                                        </p>
                                                                        <p className="flex items-start justify-between gap-3">
                                                                            <span className="text-red-800/80">Đơn tối thiểu</span>
                                                                            <span className="text-right font-medium">{Helper.formatPrice(String(voucherMinOrder))}</span>
                                                                        </p>
                                                                        <p className="flex items-start justify-between gap-3">
                                                                            <span className="text-red-800/80">Giảm tối đa</span>
                                                                            <span className="text-right font-medium">{voucherMaxDiscount > 0 ? Helper.formatPrice(String(voucherMaxDiscount)) : "Không giới hạn"}</span>
                                                                        </p>
                                                                        <p className="flex items-start justify-between gap-3">
                                                                            <span className="text-red-800/80">Phạm vi áp dụng</span>
                                                                            <span className="text-right font-medium">{isShippingVoucher ? "Áp dụng phí vận chuyển" : "Áp dụng tiền hàng"}</span>
                                                                        </p>
                                                                        <p className="flex items-start justify-between gap-3">
                                                                            <span className="text-red-800/80">Hiệu lực</span>
                                                                            <span className="text-right font-medium">{formatDate(String(voucher.startDate ?? voucher.start_date ?? ""))} - {formatDate(String(voucher.endDate ?? voucher.end_date ?? ""))}</span>
                                                                        </p>
                                                                        <p className="flex items-start justify-between gap-3 border-t border-red-200 pt-1.5">
                                                                            <span className="text-red-800/80">Giảm thực tế đơn này</span>
                                                                            <span className="text-right font-semibold">- {Helper.formatPrice(String(actualDiscount))}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                            <div className="border-t border-gray-200 pt-2">
                                                                <p className="flex items-center justify-between text-base font-bold text-gray-900">
                                                                    <span>Tổng cộng</span>
                                                                    <span>{Helper.formatPrice(String(mergedOrder.totalAmount ?? 0))}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </article>
                        );
                    })
                )}
            </div>
        </div>
    );
}
