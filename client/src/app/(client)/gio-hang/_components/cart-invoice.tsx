import { Helper } from "@/lib/helper";
import { OrderSummary } from "@/types/order";
import Link from "next/link";

interface CartInvoiceProps {
    invoice: OrderSummary;
    fallbackTotalAmount: number;
}

export function CartInvoice({ invoice, fallbackTotalAmount }: CartInvoiceProps) {
    const lineItems = invoice.orderItemResponses ?? invoice.orderItem ?? [];

    return (
        <section className="mt-10 border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Hóa đơn giao dịch</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">Đơn hàng #{invoice.id}</h2>
                </div>
                <div className="text-right text-sm text-gray-600">
                    <p>
                        Trạng thái đơn: <span className="font-semibold text-gray-900">{invoice.deliveryStatus || invoice.orderStatus || "PENDING"}</span>
                    </p>
                    <p>
                        Thanh toán: <span className="font-semibold text-gray-900">{invoice.paymentStatus || "UNPAID"}</span>
                    </p>
                </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                <p>
                    <span className="font-semibold text-gray-900">Người nhận:</span> {invoice.customerName || "-"}
                </p>
                <p>
                    <span className="font-semibold text-gray-900">Số điện thoại:</span> {invoice.customerPhone || "-"}
                </p>
                <p className="md:col-span-2">
                    <span className="font-semibold text-gray-900">Địa chỉ:</span> {[invoice.deliveryAddress, invoice.deliveryWardName, invoice.deliveryDistrictName, invoice.deliveryProvinceName].filter(Boolean).join(", ") || "-"}
                </p>
            </div>

            <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
                {lineItems.map((item, index) => (
                    <div key={`${item.id ?? item.orderItemId ?? index}`} className="flex items-center justify-between gap-3">
                        <span className="text-gray-700">
                            {item.nameProductSnapshot || item.nameProductSnapShot || `Sản phẩm #${index + 1}`} x{item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">{Helper.formatPrice(String((Number(item.finalPrice ?? item.listPriceSnapShot ?? 0) || 0) * Number(item.quantity || 0)))}</span>
                    </div>
                ))}
            </div>

            <div className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-700">
                <p className="flex items-center justify-between">
                    <span>Tạm tính</span>
                    <span>{Helper.formatPrice(String(invoice.originalOrderAmount ?? fallbackTotalAmount))}</span>
                </p>
                <p className="mt-1 flex items-center justify-between">
                    <span>Phí vận chuyển</span>
                    <span>{Helper.formatPrice(String(invoice.totalFeeShip ?? 0))}</span>
                </p>
                <p className="mt-1 flex items-center justify-between">
                    <span>Giảm giá</span>
                    <span>- {Helper.formatPrice(String(invoice.discountValue ?? 0))}</span>
                </p>
                <p className="mt-2 flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>Thành tiền</span>
                    <span>{Helper.formatPrice(String(invoice.totalAmount ?? 0))}</span>
                </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/tai-khoan" className="bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black">
                    Xem lịch sử mua hàng
                </Link>
                <Link href="/san-pham" className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900">
                    Tiếp tục mua sắm
                </Link>
            </div>
        </section>
    );
}
