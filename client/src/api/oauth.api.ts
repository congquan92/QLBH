import { axiosInstance } from "@/lib/axios";
import type { GoogleLoginPayload, GoogleLoginResponse } from "@/types/oauth";

const WARNING_PREFIX = "[WARNING][OAuthApi]";

export const OAuthApi = {
    loginWithGoogle: async (payload: GoogleLoginPayload): Promise<GoogleLoginResponse> => {
        try {
            const res = await axiosInstance.post<GoogleLoginResponse>("/auth/social/google", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /auth/social/google failed.`, error);
            throw error;
        }
    },
};
