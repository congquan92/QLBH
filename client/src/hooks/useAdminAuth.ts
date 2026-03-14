import { AuthApi } from "@/api/auth";
import { UserAuthUtil } from "@/lib/user-auth";
import type { LoginResponse, LoginRole } from "@/types/auth";
import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";

const ADMIN_SESSION_STORAGE_KEY = "qlbh_admin_session";
const STORAGE_PREFIX = "qlbh_";
const USER_LOGIN_PATH = "/dang-nhap";
const ADMIN_LOGIN_PATH = "/admin/login";

export interface AdminSession {
    token: string;
    expiredAt: string;
    authenticated: boolean;
    role: LoginRole;
    roleName: string;
    userId?: number;
    email?: string;
    roles?: string[];
    permissions: string[];
    allowedUrls: string[];
}

interface AdminAuthValue {
    session: AdminSession | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissionList: string[]) => boolean;
    canAccessPath: (path: string) => boolean;
    refreshProfile: () => Promise<void>;
}

interface AdminAuthState {
    session: AdminSession | null;
    isLoading: boolean;
    hasHydrated: boolean;
    hydrateSession: () => Promise<void>;
    ensureHydrated: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

let hydrateInFlight: Promise<void> | null = null;
let isHandlingAuthFailure = false;

function isBrowser() {
    return typeof window !== "undefined";
}

function normalizeRoleName(value?: string) {
    return String(value ?? "")
        .trim()
        .toUpperCase();
}

function normalizeAdminPath(raw?: string) {
    const value = String(raw ?? "").trim();
    if (!value) return "";

    let pathname = value;

    if (value.startsWith("http://") || value.startsWith("https://")) {
        try {
            pathname = new URL(value).pathname;
        } catch {
            pathname = value;
        }
    }

    pathname = pathname.split("?")[0]?.split("#")[0] ?? "";
    if (!pathname) return "";

    if (!pathname.startsWith("/")) {
        pathname = `/${pathname}`;
    }

    if (!pathname.startsWith("/admin")) {
        pathname = pathname === "/admin" ? pathname : `/admin${pathname}`;
    }

    pathname = pathname.replace(/\/+$/, "");
    return pathname || "/admin";
}

function getRoleAccess(role?: LoginRole) {
    const permissions = new Set<string>();
    const allowedUrls = new Set<string>();

    for (const page of role?.page ?? []) {
        for (const item of page.items ?? []) {
            const normalizedUrl = normalizeAdminPath(item.url);
            if (normalizedUrl) {
                allowedUrls.add(normalizedUrl);
            }

            for (const permission of item.permissions ?? []) {
                const name = normalizeRoleName(permission?.name);
                if (name) {
                    permissions.add(name);
                }
            }
        }
    }

    return {
        permissions: Array.from(permissions),
        allowedUrls: Array.from(allowedUrls),
    };
}

function buildAdminSession(loginResponse: LoginResponse): AdminSession {
    const access = getRoleAccess(loginResponse.role);

    return {
        token: loginResponse.token,
        authenticated: Boolean(loginResponse.authenticated),
        role: loginResponse.role,
        roleName: normalizeRoleName(loginResponse.role?.name),
        expiredAt: loginResponse.expiredAt,
        permissions: access.permissions,
        allowedUrls: access.allowedUrls,
    };
}

function readStoredSession(): AdminSession | null {
    if (!isBrowser()) return null;

    const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as Partial<AdminSession>;
        if (!parsed || typeof parsed !== "object" || !parsed.token || !parsed.role) {
            window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
            return null;
        }

        const role = parsed.role as LoginRole;
        const access = getRoleAccess(role);
        const storedPermissions = Array.isArray(parsed.permissions) ? parsed.permissions.map((permission) => normalizeRoleName(String(permission ?? ""))).filter(Boolean) : [];
        const storedAllowedUrls = Array.isArray(parsed.allowedUrls) ? parsed.allowedUrls.map((url) => normalizeAdminPath(String(url ?? ""))).filter(Boolean) : [];

        return {
            token: String(parsed.token),
            expiredAt: String(parsed.expiredAt ?? ""),
            authenticated: Boolean(parsed.authenticated),
            role,
            roleName: normalizeRoleName(typeof parsed.roleName === "string" ? parsed.roleName : role.name),
            userId: typeof parsed.userId === "number" ? parsed.userId : undefined,
            email: typeof parsed.email === "string" ? parsed.email : undefined,
            roles: Array.isArray(parsed.roles) ? parsed.roles.map((item) => String(item ?? "")).filter(Boolean) : undefined,
            permissions: Array.from(new Set([...access.permissions, ...storedPermissions])),
            allowedUrls: Array.from(new Set([...access.allowedUrls, ...storedAllowedUrls])),
        };
    } catch {
        window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
        return null;
    }
}

function writeStoredSession(session: AdminSession) {
    if (!isBrowser()) return;
    window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

function hasAdminAccess(session: AdminSession | null) {
    if (!session?.token || !session.authenticated || !session.roleName) {
        return false;
    }

    if (session.permissions.length > 0 || session.allowedUrls.length > 0) {
        return true;
    }

    return (session.role.page ?? []).some((page) => (page.items ?? []).length > 0);
}

function resolveAdminCandidates(session: AdminSession | null) {
    if (!session) return [];

    const candidates = new Set<string>();

    for (const page of session.role.page ?? []) {
        for (const item of page.items ?? []) {
            const normalized = normalizeAdminPath(item.url);
            if (normalized) {
                candidates.add(normalized);
            }
        }
    }

    for (const url of session.allowedUrls) {
        const normalized = normalizeAdminPath(url);
        if (normalized) {
            candidates.add(normalized);
        }
    }

    return Array.from(candidates);
}

function clearStorageByPrefix(storage: Storage) {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(STORAGE_PREFIX)) {
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

function resolveRedirectTarget() {
    if (!isBrowser()) return ADMIN_LOGIN_PATH;
    return window.location.pathname.startsWith("/admin") ? ADMIN_LOGIN_PATH : USER_LOGIN_PATH;
}

export const AdminAuthUtil = {
    buildSession(loginResponse: LoginResponse) {
        return buildAdminSession(loginResponse);
    },

    persistSession(session: AdminSession) {
        writeStoredSession(session);
    },

    getSession() {
        return readStoredSession();
    },

    clearSession() {
        clearStoredSession();
    },

    patchSession(partial: Partial<AdminSession>) {
        const current = readStoredSession();
        if (!current) return;

        writeStoredSession({
            ...current,
            ...partial,
            permissions: partial.permissions ?? current.permissions,
            allowedUrls: partial.allowedUrls ?? current.allowedUrls,
        });
    },

    isSessionValid(session: AdminSession | null) {
        return hasAdminAccess(session);
    },

    hasPermission(session: AdminSession | null, permission: string) {
        if (!session) return false;
        return session.permissions.includes(normalizeRoleName(permission));
    },

    hasAnyPermission(session: AdminSession | null, permissionList: string[]) {
        if (!session) return false;
        return permissionList.some((permission) => session.permissions.includes(normalizeRoleName(permission)));
    },

    canAccessUrl(session: AdminSession | null, url: string) {
        if (!session) return false;

        const normalized = normalizeAdminPath(url);
        if (normalized === "/admin/forbidden") {
            return true;
        }

        if (!normalized) {
            return false;
        }

        if (session.allowedUrls.length === 0) {
            return true;
        }

        const candidates = new Set<string>([normalized]);
        if (normalized.startsWith("/admin/")) {
            candidates.add(normalized.replace("/admin", ""));
        } else if (normalized.startsWith("/")) {
            candidates.add(`/admin${normalized}`);
        }

        return session.allowedUrls.some((allowed) => {
            const base = normalizeAdminPath(allowed);
            if (!base) return false;
            if (candidates.has(base)) return true;

            for (const candidate of candidates) {
                if (candidate.startsWith(`${base}/`)) {
                    return true;
                }
            }

            return false;
        });
    },

    resolveDefaultAdminPath(session: AdminSession | null, fallback = "/admin/categories") {
        const candidates = resolveAdminCandidates(session);
        return candidates.find((path) => path !== "/admin/dashboard") ?? candidates[0] ?? fallback;
    },
};

const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
    session: null,
    isLoading: true,
    hasHydrated: false,

    hydrateSession: async () => {
        const localSession = AdminAuthUtil.getSession();

        if (!localSession || !AdminAuthUtil.isSessionValid(localSession)) {
            AdminAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
            return;
        }

        set({ session: localSession, isLoading: true });

        try {
            const profile = await AuthApi.introspect();
            const nextSession: AdminSession = {
                ...localSession,
                userId: profile.id,
                email: profile.email,
                roles: profile.roles,
            };

            AdminAuthUtil.persistSession(nextSession);
            set({ session: nextSession, isLoading: false, hasHydrated: true });
        } catch {
            AdminAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
        }
    },

    ensureHydrated: async () => {
        if (get().hasHydrated) return;
        if (!hydrateInFlight) {
            hydrateInFlight = get()
                .hydrateSession()
                .finally(() => {
                    hydrateInFlight = null;
                });
        }

        await hydrateInFlight;
    },

    refreshProfile: async () => {
        const currentSession = get().session;
        if (!currentSession) return;

        const profile = await AuthApi.introspect();
        const nextSession: AdminSession = {
            ...currentSession,
            userId: profile.id,
            email: profile.email,
            roles: profile.roles,
        };

        AdminAuthUtil.persistSession(nextSession);
        set({ session: nextSession });
    },

    login: async (username: string, password: string) => {
        const loginResponse = await AuthApi.login(username, password);
        const nextSession = AdminAuthUtil.buildSession(loginResponse);

        if (!AdminAuthUtil.isSessionValid(nextSession)) {
            AdminAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
            throw new Error("Tai khoan khong co quyen truy cap admin.");
        }

        AdminAuthUtil.persistSession(nextSession);
        set({ session: nextSession, isLoading: false, hasHydrated: true });

        try {
            const profile = await AuthApi.introspect();
            const enrichedSession: AdminSession = {
                ...nextSession,
                userId: profile.id,
                email: profile.email,
                roles: profile.roles,
            };

            AdminAuthUtil.persistSession(enrichedSession);
            set({ session: enrichedSession, isLoading: false, hasHydrated: true });
        } catch {
            // Token is already stored. Profile sync can retry later.
        }
    },

    logout: async () => {
        const token = get().session?.token;

        try {
            await AuthApi.logout(token);
        } finally {
            AdminAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
        }
    },
}));

export function handleAuthFailure() {
    if (!isBrowser() || isHandlingAuthFailure) return;

    isHandlingAuthFailure = true;
    AdminAuthUtil.clearSession();
    UserAuthUtil.clearSession();
    useAdminAuthStore.setState({ session: null, isLoading: false, hasHydrated: true });
    clearStorageByPrefix(window.localStorage);
    clearStorageByPrefix(window.sessionStorage);

    void clearBrowserCaches().finally(() => {
        window.location.replace(resolveRedirectTarget());
    });
}

export function useAdminAuth() {
    const session = useAdminAuthStore((state) => state.session);
    const isLoading = useAdminAuthStore((state) => state.isLoading);

    useEffect(() => {
        void useAdminAuthStore.getState().ensureHydrated();
    }, []);

    const hasPermission = useCallback((permission: string) => AdminAuthUtil.hasPermission(session, permission), [session]);
    const hasAnyPermission = useCallback((permissionList: string[]) => AdminAuthUtil.hasAnyPermission(session, permissionList), [session]);
    const canAccessPath = useCallback((path: string) => AdminAuthUtil.canAccessUrl(session, path), [session]);

    return useMemo(
        () =>
            ({
                session,
                isLoading,
                isAuthenticated: Boolean(session),
                login: useAdminAuthStore.getState().login,
                logout: useAdminAuthStore.getState().logout,
                hasPermission,
                hasAnyPermission,
                canAccessPath,
                refreshProfile: useAdminAuthStore.getState().refreshProfile,
            }) satisfies AdminAuthValue,
        [canAccessPath, hasAnyPermission, hasPermission, isLoading, session],
    );
}
