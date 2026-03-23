import { axiosInstance } from "@/lib/axios";
import type { OtpSendPayload, OtpVerifyPayload, OtpVerifyResponse } from "@/types/otp";

const WARNING_PREFIX = "[WARNING][OtpApi]";

export const OtpApi = {
    send: async (payload: OtpSendPayload) => {
        try {
            const res = await axiosInstance.post("/otp/send", null, {
                params: payload,
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /otp/send failed.`, error);
            throw error;
        }
    },

    verify: async (payload: OtpVerifyPayload): Promise<OtpVerifyResponse> => {
        try {
            const res = await axiosInstance.post<OtpVerifyResponse>("/otp/verify-otp", null, {
                params: payload,
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /otp/verify-otp failed.`, error);
            throw error;
        }
    },
};
