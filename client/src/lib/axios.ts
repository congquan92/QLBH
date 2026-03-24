import axios from "axios";
import { AdminAuthUtil } from "@/lib/AdminAuth-util";
import { UserAuthUtil } from "@/lib/UserAuth-util";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

type AuthScope = "admin" | "user";
type ScopeResolver = (config: InternalAxiosRequestConfig) => AuthScope;

type RetryableRequestConfig = AxiosRequestConfig & {
    _retry?: boolean;
    _authScope?: AuthScope;
};

const createBaseAxios = () =>
    axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
    });

export const publicAxiosInstance = createBaseAxios();

const REFRESH_EXCLUDED_PATHS = ["/auth/login", "/auth/logout", "/auth/refresh", "/auth/register", "/auth/social/google", "/otp/send", "/otp/verify-otp", "/user/forgot-password"];
const ADMIN_LOGIN_PATH = "/admin/login";
const USER_LOGIN_PATH = "/dang-nhap";
const ADMIN_STORAGE_PREFIX = "qlbh_admin";
const USER_STORAGE_PREFIX = "qlbh_user";

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

const refreshByScope: Record<AuthScope, Promise<string | null> | null> = {
    admin: null,
    user: null,
};

function clearStorageByPrefix(storage: Storage, prefix: string) {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }

    for (const key of keysToRemove) {
        storage.removeItem(key);
    }
}

async function clearBrowserCaches() {
    if (typeof caches === "undefined") return;

    try {
        const keys = await caches.keys();
        await Promise.allSettled(keys.map((key) => caches.delete(key)));
    } catch {
        // Best effort only.
    }
}

function resolveAuthScope(url?: string): AuthScope {
    const requestPath = getRequestPath(url);

    if (requestPath.startsWith("/admin/")) {
        return "admin";
    }

    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        return "admin";
    }

    return "user";
}

function inferScope(config: InternalAxiosRequestConfig): AuthScope {
    return resolveAuthScope(config.url);
}

function getScopeToken(scope: AuthScope) {
    if (scope === "admin") {
        return AdminAuthUtil.getSession()?.token ?? null;
    }

    return UserAuthUtil.getSession()?.token ?? null;
}

function patchScopeToken(scope: AuthScope, token: string) {
    if (scope === "admin") {
        AdminAuthUtil.patchSession({ token });
        return;
    }

    UserAuthUtil.patchSession({ token });
}

function handleScopeAuthFailure(scope: AuthScope) {
    if (scope === "admin") {
        AdminAuthUtil.clearSession();
    } else {
        UserAuthUtil.clearSession();
    }

    if (typeof window === "undefined") {
        return;
    }

    if (scope === "admin") {
        clearStorageByPrefix(window.localStorage, ADMIN_STORAGE_PREFIX);
        clearStorageByPrefix(window.sessionStorage, ADMIN_STORAGE_PREFIX);
    } else {
        clearStorageByPrefix(window.localStorage, USER_STORAGE_PREFIX);
        clearStorageByPrefix(window.sessionStorage, USER_STORAGE_PREFIX);
    }

    void clearBrowserCaches().finally(() => {
        window.location.replace(scope === "admin" ? ADMIN_LOGIN_PATH : USER_LOGIN_PATH);
    });
}

async function refreshAccessToken(scope: AuthScope): Promise<string | null> {
    if (refreshByScope[scope]) {
        return refreshByScope[scope];
    }

    const token = getScopeToken(scope);

    refreshByScope[scope] = axios
        .post<{ access_token: string }>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            },
        )
        .then((response) => {
            const nextToken = response.data?.access_token;
            if (!nextToken) {
                handleScopeAuthFailure(scope);
                return null;
            }

            patchScopeToken(scope, nextToken);
            return nextToken;
        })
        .catch(() => {
            handleScopeAuthFailure(scope);
            return null;
        })
        .finally(() => {
            refreshByScope[scope] = null;
        });

    return refreshByScope[scope];
}

function attachAuthInterceptors(instance: ReturnType<typeof createBaseAxios>, scopeResolver: ScopeResolver) {
    instance.interceptors.request.use((config) => {
        const scope = scopeResolver(config);
        const token = getScopeToken(scope);
        const configWithScope = config as InternalAxiosRequestConfig & { _authScope?: AuthScope };

        // Store resolved scope so retry uses the same token bucket.
        configWithScope._authScope = scope;
        if (token) {
            (configWithScope.headers as Record<string, unknown>).Authorization = `Bearer ${token}`;
        }

        return config;
    });

    instance.interceptors.response.use(
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

            const scope = originalConfig._authScope ?? resolveAuthScope(originalConfig.url);

            if (originalConfig._retry) {
                handleScopeAuthFailure(scope);
                return Promise.reject(error);
            }

            originalConfig._retry = true;
            const nextToken = await refreshAccessToken(scope);
            if (!nextToken) {
                return Promise.reject(error);
            }

            originalConfig.headers = {
                ...(originalConfig.headers as Record<string, unknown> | undefined),
                Authorization: `Bearer ${nextToken}`,
            };

            return instance.request(originalConfig);
        },
    );
}

export const adminAxiosInstance = createBaseAxios();
export const userAxiosInstance = createBaseAxios();
export const axiosInstance = createBaseAxios();

attachAuthInterceptors(adminAxiosInstance, () => "admin");
attachAuthInterceptors(userAxiosInstance, () => "user");
attachAuthInterceptors(axiosInstance, inferScope);
