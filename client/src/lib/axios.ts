import axios from "axios";
import { AdminAuthUtil, handleAuthFailure } from "@/hooks/useAdminAuth";
import { UserAuthUtil } from "@/lib/user-auth";
import type { AxiosRequestConfig } from "axios";

type RetryableRequestConfig = AxiosRequestConfig & {
    _retry?: boolean;
};

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const REFRESH_EXCLUDED_PATHS = ["/auth/login", "/auth/logout", "/auth/refresh", "/auth/register", "/auth/social/google", "/otp/send", "/otp/verify-otp", "/user/forgot-password"];

function getRequestPath(url?: string) {
    if (!url) return "";
    if (!url.startsWith("http")) return url;

    try {
        const parsed = new URL(url);
        return parsed.pathname;
    } catch {
        return url;
    }
}

function shouldSkipRefresh(url?: string) {
    const path = getRequestPath(url);
    if (!path) return false;
    return REFRESH_EXCLUDED_PATHS.some((item) => path.includes(item));
}

let refreshInFlight: Promise<string | null> | null = null;

function getSessionPreference() {
    if (typeof window === "undefined") {
        const adminSession = AdminAuthUtil.getSession();
        if (adminSession?.token) return { source: "admin" as const, token: adminSession.token };

        const userSession = UserAuthUtil.getSession();
        if (userSession?.token) return { source: "user" as const, token: userSession.token };

        return null;
    }

    const pathname = window.location.pathname;
    if (pathname.startsWith("/admin")) {
        const adminSession = AdminAuthUtil.getSession();
        if (adminSession?.token) return { source: "admin" as const, token: adminSession.token };

        const userSession = UserAuthUtil.getSession();
        if (userSession?.token) return { source: "user" as const, token: userSession.token };

        return null;
    }

    const userSession = UserAuthUtil.getSession();
    if (userSession?.token) return { source: "user" as const, token: userSession.token };

    const adminSession = AdminAuthUtil.getSession();
    if (adminSession?.token) return { source: "admin" as const, token: adminSession.token };

    return null;
}

async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;

    const preferredSession = getSessionPreference();

    refreshInFlight = axios
        .post<{ access_token: string }>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            {
                withCredentials: true,
                headers: preferredSession?.token ? { Authorization: `Bearer ${preferredSession.token}` } : undefined,
            },
        )
        .then((response) => {
            const token = response.data?.access_token;
            if (!token) {
                handleAuthFailure();
                return null;
            }
            if (preferredSession?.source === "admin") {
                AdminAuthUtil.patchSession({ token });
            } else {
                UserAuthUtil.patchSession({ token });
            }
            return token;
        })
        .catch(() => {
            handleAuthFailure();
            return null;
        })
        .finally(() => {
            refreshInFlight = null;
        });

    return refreshInFlight;
}

axiosInstance.interceptors.request.use((config) => {
    const preferredSession = getSessionPreference();
    if (preferredSession?.token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, unknown>).Authorization = `Bearer ${preferredSession.token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const originalConfig = (error?.config ?? {}) as RetryableRequestConfig;

        if (status !== 401) {
            return Promise.reject(error);
        }

        if (shouldSkipRefresh(originalConfig.url)) {
            return Promise.reject(error);
        }

        if (originalConfig._retry) {
            handleAuthFailure();
            return Promise.reject(error);
        }

        originalConfig._retry = true;
        const nextToken = await refreshAccessToken();
        if (!nextToken) {
            return Promise.reject(error);
        }

        originalConfig.headers = {
            ...(originalConfig.headers as Record<string, unknown> | undefined),
            Authorization: `Bearer ${nextToken}`,
        };

        return axiosInstance.request(originalConfig);
    },
);
