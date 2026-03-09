"use client";

import { AdminAuthUtil, type AdminSession } from "@/lib/admin-auth";
import { AdminAuthStore } from "@/stores/admin-auth.store";
import { useCallback, useMemo } from "react";
import { useEffect } from "react";

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

export function useAdminAuth() {
    const session = AdminAuthStore.useStore((state) => state.session);
    const isLoading = AdminAuthStore.useStore((state) => state.isLoading);

    useEffect(() => {
        void AdminAuthStore.actions.ensureHydrated();
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
                login: AdminAuthStore.actions.login,
                logout: AdminAuthStore.actions.logout,
                hasPermission,
                hasAnyPermission,
                canAccessPath,
                refreshProfile: AdminAuthStore.actions.refreshProfile,
            }) satisfies AdminAuthValue,
        [canAccessPath, hasAnyPermission, hasPermission, isLoading, session],
    );
}
