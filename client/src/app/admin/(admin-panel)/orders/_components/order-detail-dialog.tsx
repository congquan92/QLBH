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

    const normalizeLabel = (label: string) => {
        const key = label.trim().toLowerCase();
        if (["color", "mau", "màu", "mau sac", "màu sắc"].includes(key)) return "Màu sắc";
        if (["size", "kich thuoc", "kích thước"].includes(key)) return "Kích thước";
        return label;
    };

    const normalizedText = (raw: unknown) => String(raw ?? "").trim();
    const raw = String(value);

    const parsed = (() => {
        try {
            return JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return null;
        }
    })();

    if (!parsed || typeof parsed !== "object") return "-";

    const entries: Array<{ label: string; value: string }> = [];

    const variantAttributes = (parsed.variantAttributes ?? parsed.variant_attributes) as unknown;
    if (Array.isArray(variantAttributes)) {
        variantAttributes.forEach((item) => {
            if (!item || typeof item !== "object") return;
            const row = item as Record<string, unknown>;
            const label = normalizeLabel(normalizedText(row.attribute ?? row.name ?? row.key));
            const val = normalizedText(row.value ?? row.option ?? row.attributeValue);
            if (!val) return;
            if (["Màu sắc", "Kích thước"].includes(label)) {
                entries.push({ label, value: val });
            }
        });
    }

    if (entries.length === 0) {
        const colorVal = normalizedText(parsed.color ?? parsed.mau ?? parsed["màu"]);
        const sizeVal = normalizedText(parsed.size ?? parsed.kich_thuoc ?? parsed["kích_thước"]);
        if (colorVal) entries.push({ label: "Màu sắc", value: colorVal });
        if (sizeVal) entries.push({ label: "Kích thước", value: sizeVal });
    }

    if (entries.length === 0) return "-";
    return entries.map((item) => `${item.label}: ${item.value}`).join(", ");
}

function getVoucherTypeLabel(value: unknown): string {
    const type = String(value ?? "").toUpperCase();
    if (type === "PERCENTAGE") return "Giảm theo %";
    if (type === "FIXED") return "Giảm trực tiếp";
    return type || "-";
}

function getPaymentTypeLabel(value: unknown): string {
    const raw = String(value ?? "").toUpperCase();
    if (raw === "COD") return "COD";
    if (raw === "BANK_TRANSFER" || raw === "BANK_TRANFER") return "Thanh toán ngân hàng";
    return String(value ?? "-");
}

function toNumber(value: unknown): number {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
}

export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
    const items = Array.isArray(order?.orderItemResponses) ? order.orderItemResponses : Array.isArray(order?.orderItem) ? order.orderItem : [];
    const voucher = order?.voucherResponse ?? null;
    const voucherDiscountValue = Number(voucher?.discountValue ?? 0);
    const voucherMaxDiscount = Number(voucher?.maxDiscountValue ?? 0);
    const voucherMinOrder = Number(voucher?.minDiscountValue ?? 0);
    const isShippingVoucher = Boolean(voucher?.isShipping ?? false);
    const shippingFee = toNumber(order?.totalFeeShip);
    const voucherDiscount = toNumber(order?.discountValue);
    const productSubtotal = items.reduce((sum, item) => {
        const qty = Math.max(0, toNumber(item.quantity));
        const unitPrice = toNumber(item.finalPrice) > 0 ? toNumber(item.finalPrice) : toNumber(item.listPriceSnapShot);
        return sum + qty * unitPrice;
    }, 0);
    const finalTotal = toNumber(order?.totalAmount);

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
                                <p className="mt-1 text-xs text-muted-foreground">Hình thức: {getPaymentTypeLabel(order.paymentType)}</p>
                                {String(order.paymentStatus ?? "").toUpperCase() === "UNPAID" && ["BANK_TRANSFER", "BANK_TRANFER"].includes(String(order.paymentType ?? "").toUpperCase()) ? (
                                    <p className="mt-1 text-xs font-medium text-amber-700">Đơn chưa thanh toán qua ngân hàng.</p>
                                ) : null}
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Giá trị đơn</p>
                                <p className="font-medium">{Helper.formatPrice(String(order.totalAmount ?? 0))}</p>
                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                    <p>Tiền hàng: {Helper.formatPrice(String(productSubtotal > 0 ? productSubtotal : toNumber(order.originalOrderAmount)))}</p>
                                    <p>Phí ship: {Helper.formatPrice(String(shippingFee))}</p>
                                    {voucherDiscount > 0 ? <p>Giảm voucher: -{Helper.formatPrice(String(voucherDiscount))}</p> : null}
                                </div>
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

                        {voucher ? (
                            <div className="rounded-md border bg-emerald-50/40 p-3">
                                <p className="mb-2 text-sm font-semibold">Thông tin voucher áp dụng</p>
                                <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                                    <p><span className="text-muted-foreground">Mô tả:</span> {String(voucher.description ?? "Voucher khuyến mãi")}</p>
                                    <p><span className="text-muted-foreground">Loại:</span> {getVoucherTypeLabel(voucher.type)}</p>
                                    <p><span className="text-muted-foreground">Giá trị:</span> {String(voucher.type ?? "").toUpperCase() === "PERCENTAGE" ? `${voucherDiscountValue}%` : Helper.formatPrice(String(voucherDiscountValue))}</p>
                                    <p><span className="text-muted-foreground">Đơn tối thiểu:</span> {Helper.formatPrice(String(voucherMinOrder))}</p>
                                    <p><span className="text-muted-foreground">Giảm tối đa:</span> {voucherMaxDiscount > 0 ? Helper.formatPrice(String(voucherMaxDiscount)) : "Không giới hạn"}</p>
                                    <p><span className="text-muted-foreground">Phạm vi:</span> {isShippingVoucher ? "Áp dụng phí vận chuyển" : "Áp dụng tiền hàng"}</p>
                                </div>
                            </div>
                        ) : null}

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
                                                <p className="font-semibold">
                                                    {Helper.formatPrice(String((toNumber(item.finalPrice) > 0 ? toNumber(item.finalPrice) : toNumber(item.listPriceSnapShot)) * Math.max(0, toNumber(item.quantity))))}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-muted-foreground">Không có dữ liệu sản phẩm.</div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border bg-slate-50/70 p-3">
                            <p className="mb-2 text-sm font-semibold">Tổng hợp thanh toán</p>
                            <div className="space-y-1 text-xs">
                                <div className="flex items-center justify-between"><span className="text-muted-foreground">Tiền hàng</span><span>{Helper.formatPrice(String(productSubtotal > 0 ? productSubtotal : toNumber(order.originalOrderAmount)))}</span></div>
                                <div className="flex items-center justify-between"><span className="text-muted-foreground">Phí ship</span><span>{Helper.formatPrice(String(shippingFee))}</span></div>
                                {voucherDiscount > 0 ? <div className="flex items-center justify-between"><span className="text-muted-foreground">Giảm voucher</span><span>-{Helper.formatPrice(String(voucherDiscount))}</span></div> : null}
                                <div className="border-t pt-1 flex items-center justify-between text-sm font-semibold"><span>Tổng thanh toán</span><span>{Helper.formatPrice(String(finalTotal))}</span></div>
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
