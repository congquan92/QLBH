import type { ApiResponse } from "@/types/api";

export interface OtpSendPayload {
    userId: number;
    otpType: string;
    isEmail: boolean;
}

export interface OtpVerifyPayload {
    userId: number;
    inputOtp: string;
    otpType: string;
}

export interface OtpVerifyResult {
    valid?: boolean;
    message?: string;
    [key: string]: unknown;
}

export type OtpVerifyResponse = ApiResponse<OtpVerifyResult>;
