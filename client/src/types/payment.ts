import type { ApiResponse } from "@/types/api";

export interface AddPaymentPayload {
    paymentType: string;
    returnUrl?: string;
    amount?: number;
    note?: string;
    [key: string]: unknown;
}

export interface PaymentResult {
    paymentUrl?: string;
    orderId?: number;
    status?: string;
    [key: string]: unknown;
}

export type PaymentResponse = ApiResponse<PaymentResult>;
