import { AuthApi } from "@/api/auth";
import { AdminAuthUtil, ADMIN_STORAGE_PREFIX, ADMIN_LOGIN_PATH } from "@/lib/AdminAuth-util";
import type { AdminSession } from "@/lib/AdminAuth-util";
import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";

export type { AdminSession } from "@/lib/AdminAuth-util";
export { AdminAuthUtil } from "@/lib/AdminAuth-util";

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

function extractRoleNames(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeRoleName(String(item ?? ""))).filter(Boolean);
    }

    if (value && typeof value === "object") {
        const payload = value as { name?: unknown };
        const roleName = normalizeRoleName(typeof payload.name === "string" ? payload.name : "");
        return roleName ? [roleName] : [];
    }

    return [];
}

function clearStorageByPrefix(storage: Storage) {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(ADMIN_STORAGE_PREFIX)) {
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
    return ADMIN_LOGIN_PATH;
}

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
                roles: extractRoleNames(profile.roles),
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
            roles: extractRoleNames(profile.roles),
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
                roles: extractRoleNames(profile.roles),
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

export function handleAdminAuthFailure() {
    if (!isBrowser() || isHandlingAuthFailure) return;

    isHandlingAuthFailure = true;
    AdminAuthUtil.clearSession();
    useAdminAuthStore.setState({ session: null, isLoading: false, hasHydrated: true });
    clearStorageByPrefix(window.localStorage);
    clearStorageByPrefix(window.sessionStorage);

    void clearBrowserCaches().finally(() => {
        window.location.replace(resolveRedirectTarget());
    });
}

export const handleAuthFailure = handleAdminAuthFailure;

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
