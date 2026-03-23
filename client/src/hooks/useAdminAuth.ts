import { AuthApi } from "@/api/auth";
import { AdminAuthUtil, ADMIN_STORAGE_PREFIX, ADMIN_LOGIN_PATH } from "@/lib/AdminAuth-util";
import { getAdminRealtimeClient } from "@/lib/realtime/admin-reverb";
import type { AdminSession } from "@/lib/AdminAuth-util";
import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";
import type { LoginResponse, LoginRole } from "@/types/auth";

export type { AdminSession } from "@/lib/AdminAuth-util";
export { AdminAuthUtil } from "@/lib/AdminAuth-util";

interface AdminAuthValue {
    session: AdminSession | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
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

function resolveRoleFromIntrospect(value: unknown): LoginRole | null {
    if (Array.isArray(value)) {
        const firstRole = value.find((item) => item && typeof item === "object");
        return firstRole ? (firstRole as LoginRole) : null;
    }

    if (value && typeof value === "object") {
        return value as LoginRole;
    }

    return null;
}

function enrichSessionWithIntrospect(current: AdminSession, introspect: { id?: number; email?: string; roles?: unknown }): AdminSession {
    const nextRole = resolveRoleFromIntrospect(introspect.roles) ?? current.role;
    const rebuilt = AdminAuthUtil.buildSession({
        token: current.token,
        authenticated: true,
        role: nextRole,
        expiredAt: current.expiredAt,
    } satisfies LoginResponse);

    return {
        ...rebuilt,
        userId: introspect.id ?? current.userId,
        email: introspect.email ?? current.email,
        roles: extractRoleNames(introspect.roles),
    };
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

type AdminPermissionSyncPayload = {
    role_id?: number | null;
    user_id?: number | null;
    reason?: string;
    sent_at?: string;
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
            const nextSession = enrichSessionWithIntrospect(localSession, profile);

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
        const nextSession = enrichSessionWithIntrospect(currentSession, profile);

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
            const enrichedSession = enrichSessionWithIntrospect(nextSession, profile);

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

    useEffect(() => {
        if (!session) return;

        const echo = getAdminRealtimeClient();
        if (!echo) {
            return;
        }

        const shouldRefresh = (payload: AdminPermissionSyncPayload) => {
            const targetUserId = Number(payload.user_id ?? 0);
            if (targetUserId > 0 && targetUserId === Number(session.userId ?? 0)) {
                return true;
            }

            const targetRoleId = Number(payload.role_id ?? 0);
            if (targetRoleId > 0 && targetRoleId === Number(session.role?.id ?? 0)) {
                return true;
            }

            if (targetRoleId <= 0 && targetUserId <= 0) {
                return true;
            }

            return false;
        };

        const onSyncRequested = async (payload: AdminPermissionSyncPayload) => {
            if (!shouldRefresh(payload)) {
                return;
            }

            try {
                await useAdminAuthStore.getState().refreshProfile();
            } catch {
                // Auth failures are handled by axios interceptor + redirect.
            }
        };

        const channel = echo.channel("admin.permission-sync");
        channel.listen(".admin.permission.sync", onSyncRequested);

        return () => {
            channel.stopListening(".admin.permission.sync", onSyncRequested);
            echo.leaveChannel("admin.permission-sync");
        };
    }, [session]);

    const canAccessPath = useCallback((path: string) => AdminAuthUtil.canAccessUrl(session, path), [session]);

    return useMemo(
        () =>
            ({
                session,
                isLoading,
                isAuthenticated: Boolean(session),
                login: useAdminAuthStore.getState().login,
                logout: useAdminAuthStore.getState().logout,
                canAccessPath,
                refreshProfile: useAdminAuthStore.getState().refreshProfile,
            }) satisfies AdminAuthValue,
        [canAccessPath, isLoading, session],
    );
}
