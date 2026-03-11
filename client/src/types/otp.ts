import type { ApiResponse } from "@/types/api";

export interface OtpSendPayload {
    email: string;
    type?: string;
}

export interface OtpVerifyPayload {
    email: string;
    otp: string;
    type?: string;
}

export interface OtpVerifyResult {
    valid?: boolean;
    message?: string;
    [key: string]: unknown;
}

export type OtpVerifyResponse = ApiResponse<OtpVerifyResult>;
