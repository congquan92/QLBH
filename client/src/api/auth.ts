import { axiosInstance } from "@/lib/axios";
import type { LoginResponse, LoginRole, RegisterPayload } from "@/types/auth";

export const AuthApi = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const res = await axiosInstance.post<LoginResponse>("/auth/login", { username, password });
        return res.data;
    },

    register: async (payload: RegisterPayload): Promise<void> => {
        await axiosInstance.post("/auth/register", payload);
    },

    socialGoogleLogin: async (idToken: string): Promise<LoginResponse> => {
        const res = await axiosInstance.post<LoginResponse>("/auth/social/google", { idToken });
        return res.data;
    },

    logout: async (token?: string): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>(
            "/auth/logout",
            {},
            token
                ? {
                      headers: { Authorization: `Bearer ${token}` },
                  }
                : undefined,
        );
        return res.data;
    },

    refresh: async (): Promise<{ access_token: string; type: "Bearer" | string }> => {
        const res = await axiosInstance.post<{ access_token: string; type: "Bearer" | string }>("/auth/refresh");
        return res.data;
    },

    introspect: async (): Promise<{ valid: boolean; id: number; email: string; roles: string[] }> => {
        const res = await axiosInstance.get<{ valid: boolean; id: number; email: string; roles: string[] }>("/auth/introspect");
        return res.data;
    },

    // Utility helper for old call sites expecting a role string.
    getRoleName: (role: LoginRole | undefined): string | undefined => {
        return role?.name;
    },
};
