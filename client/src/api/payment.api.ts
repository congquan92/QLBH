import { axiosInstance } from "@/lib/axios";
import type { AddPaymentPayload, PaymentResponse } from "@/types/payment";

const WARNING_PREFIX = "[WARNING][PaymentApi]";

export const PaymentApi = {
    addPayment: async (orderId: number, payload: AddPaymentPayload): Promise<PaymentResponse> => {
        try {
            const res = await axiosInstance.post<PaymentResponse>(`/payment/${orderId}/add`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /payment/{orderId}/add failed.`, error);
            throw error;
        }
    },

    getVnpayReturn: async (query?: Record<string, string | number | boolean>) => {
        try {
            const res = await axiosInstance.get("/payment/vnpay-return", { params: query });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /payment/vnpay-return failed.`, error);
            throw error;
        }
    },
};
