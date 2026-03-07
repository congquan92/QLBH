import axios from "axios";
import { clearAdminSession, getAdminSession, patchAdminSession } from "@/lib/admin-auth";
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

async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = axios
        .post<{ access_token: string }>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            {
                withCredentials: true,
                headers: (() => {
                    const token = getAdminSession()?.token;
                    return token ? { Authorization: `Bearer ${token}` } : undefined;
                })(),
            },
        )
        .then((response) => {
            const token = response.data?.access_token;
            if (!token) {
                clearAdminSession();
                return null;
            }
            patchAdminSession({ token });
            return token;
        })
        .catch(() => {
            clearAdminSession();
            return null;
        })
        .finally(() => {
            refreshInFlight = null;
        });

    return refreshInFlight;
}

axiosInstance.interceptors.request.use((config) => {
    const session = getAdminSession();
    if (session?.token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, unknown>).Authorization = `Bearer ${session.token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const originalConfig = (error?.config ?? {}) as RetryableRequestConfig;

        if (status !== 401 || originalConfig._retry || shouldSkipRefresh(originalConfig.url)) {
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
