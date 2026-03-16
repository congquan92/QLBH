"use client";

import { CartApi } from "@/api/cart.api";
import { PaymentApi } from "@/api/payment.api";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ResultState = "loading" | "success" | "fail";

type CallbackPayload = {
    status?: number;
    message?: string;
    data?: boolean;
};

type PaymentMeta = {
    orderCode: string;
    transactionCode: string;
    paidAt: string;
};

function parseQuery(searchParams: URLSearchParams) {
    const result: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
        if (key.startsWith("vnp_")) {
            result[key] = value;
        }
    }
    return result;
}

function formatVnpPayDate(payDate?: string) {
    if (!payDate || !/^\d{14}$/.test(payDate)) {
        return "Không có";
    }

    const year = Number(payDate.slice(0, 4));
    const month = Number(payDate.slice(4, 6)) - 1;
    const day = Number(payDate.slice(6, 8));
    const hour = Number(payDate.slice(8, 10));
    const minute = Number(payDate.slice(10, 12));
    const second = Number(payDate.slice(12, 14));

    const date = new Date(year, month, day, hour, minute, second);

    if (Number.isNaN(date.getTime())) {
        return "Không có";
    }

    return date.toLocaleString("vi-VN", {
        hour12: false,
    });
}

function extractOrderCode(txnRef?: string) {
    if (!txnRef) {
        return "Không có";
    }

    const normalized = txnRef.startsWith("ORD") ? txnRef.slice(3) : txnRef;
    const [orderPart] = normalized.split("_");
    const orderId = Number(orderPart);
    if (!Number.isFinite(orderId) || orderId <= 0) {
        return txnRef;
    }

    return `#${orderId}`;
}

function extractOrderId(txnRef?: string) {
    if (!txnRef) {
        return null;
    }

    const normalized = txnRef.startsWith("ORD") ? txnRef.slice(3) : txnRef;
    const [orderPart] = normalized.split("_");
    const orderId = Number(orderPart);

    if (!Number.isFinite(orderId) || orderId <= 0) {
        return null;
    }

    return orderId;
}

export default function PaymentResultPage() {
    const searchParams = useSearchParams();
    const [state, setState] = useState<ResultState>("loading");
    const [message, setMessage] = useState("Đang xác thực kết quả thanh toán...");

    const queryPayload = useMemo(() => parseQuery(searchParams), [searchParams]);
    const paymentMeta = useMemo<PaymentMeta>(
        () => ({
            orderCode: extractOrderCode(queryPayload.vnp_TxnRef),
            transactionCode: queryPayload.vnp_TransactionNo || queryPayload.vnp_BankTranNo || queryPayload.vnp_TransactionStatus || "Không có",
            paidAt: formatVnpPayDate(queryPayload.vnp_PayDate),
        }),
        [queryPayload],
    );

    useEffect(() => {
        let cancelled = false;

        const verifyPayment = async () => {
            if (Object.keys(queryPayload).length === 0) {
                if (!cancelled) {
                    setState("fail");
                    setMessage("Không tìm thấy dữ liệu thanh toán VNPay.");
                }
                return;
            }

            try {
                const response = (await PaymentApi.getVnpayReturn(queryPayload)) as CallbackPayload;
                const isSuccess = Boolean(response?.data);

                if (cancelled) return;

                if (isSuccess) {
                    const orderId = extractOrderId(queryPayload.vnp_TxnRef);
                    if (orderId) {
                        const pendingKey = `pending_vnpay_cart_${orderId}`;
                        const rawPendingIds = sessionStorage.getItem(pendingKey);
                        const pendingIds = rawPendingIds ? (JSON.parse(rawPendingIds) as number[]) : [];

                        if (Array.isArray(pendingIds) && pendingIds.length > 0) {
                            await Promise.allSettled(pendingIds.map((id) => CartApi.deleteItem(id)));
                        }

                        sessionStorage.removeItem(pendingKey);
                    }

                    setState("success");
                    setMessage(response?.message || "Thanh toán thành công. Đơn hàng đã được xác nhận.");
                } else {
                    setState("fail");
                    setMessage(response?.message || "Thanh toán thất bại hoặc bị hủy.");
                }
            } catch {
                if (!cancelled) {
                    setState("fail");
                    setMessage("Không thể xác thực giao dịch. Vui lòng kiểm tra trong lịch sử đơn hàng.");
                }
            }
        };

        void verifyPayment();

        return () => {
            cancelled = true;
        };
    }, [queryPayload]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <div className="border border-gray-200 bg-white p-8 text-center">
                {state === "loading" ? <Loader2 className="mx-auto h-10 w-10 animate-spin text-gray-500" /> : state === "success" ? <ShieldCheck className="mx-auto h-12 w-12 text-green-600" /> : <ShieldX className="mx-auto h-12 w-12 text-red-600" />}

                <h1 className="mt-4 text-2xl font-bold text-gray-900">{state === "loading" ? "Đang xử lý thanh toán" : state === "success" ? "Thanh toán thành công" : "Thanh toán không thành công"}</h1>

                <p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>

                {state !== "loading" && (
                    <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
                        <div className="border border-gray-200 bg-gray-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">Mã đơn</p>
                            <p className="mt-1 text-sm font-bold text-gray-900">{paymentMeta.orderCode}</p>
                        </div>
                        <div className="border border-gray-200 bg-gray-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">Mã giao dịch</p>
                            <p className="mt-1 text-sm font-bold text-gray-900">{paymentMeta.transactionCode}</p>
                        </div>
                        <div className="border border-gray-200 bg-gray-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">Thời gian</p>
                            <p className="mt-1 text-sm font-bold text-gray-900">{paymentMeta.paidAt}</p>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/tai-khoan?tab=orders" className="bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black">
                        Xem lịch sử mua hàng
                    </Link>
                    <Link href="/gio-hang" className="border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900">
                        Quay lại giỏ hàng
                    </Link>
                    <Link href="/san-pham" className="border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
}
