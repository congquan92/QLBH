"use client";

import { AuthApi } from "@/api/auth";
import { buildAdminSession, canAccessUrl, clearAdminSession, getAdminSession, hasAnyPermission, hasPermission, isAdminSession, patchAdminSession, persistAdminSession, type AdminSession } from "@/lib/admin-auth";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AdminAuthContextValue {
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

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

interface AdminAuthProviderProps {
    children: React.ReactNode;
    guard?: boolean;
}

export function AdminAuthProvider({ children, guard = false }: AdminAuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [session, setSession] = useState<AdminSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const hydrateSession = useCallback(async () => {
        const local = getAdminSession();

        if (!local || !isAdminSession(local)) {
            setSession(null);
            setIsLoading(false);
            return;
        }

        setSession(local);

        try {
            const profile = await AuthApi.introspect();
            const next = {
                ...local,
                userId: profile.id,
                email: profile.email,
                roles: profile.roles,
            };
            persistAdminSession(next);
            setSession(next);
        } catch {
            clearAdminSession();
            setSession(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        hydrateSession();
    }, [hydrateSession]);

    useEffect(() => {
        if (!guard || isLoading) return;

        if (!session) {
            router.replace("/admin/login");
            return;
        }

        if (pathname && pathname.startsWith("/admin") && pathname !== "/admin" && pathname !== "/admin/login") {
            if (!canAccessUrl(session, pathname)) {
                router.replace("/admin/dashboard");
            }
        }
    }, [guard, isLoading, pathname, router, session]);

    const refreshProfile = useCallback(async () => {
        if (!session) return;

        const profile = await AuthApi.introspect();
        const next = {
            ...session,
            userId: profile.id,
            email: profile.email,
            roles: profile.roles,
        };

        patchAdminSession({ userId: next.userId, email: next.email, roles: next.roles });
        setSession(next);
    }, [session]);

    const login = useCallback(async (username: string, password: string) => {
        const response = await AuthApi.login(username, password);
        const nextSession = buildAdminSession(response);

        if (!isAdminSession(nextSession)) {
            clearAdminSession();
            setSession(null);
            throw new Error("Tài khoản không có quyền truy cập admin.");
        }

        persistAdminSession(nextSession);
        setSession(nextSession);

        try {
            const profile = await AuthApi.introspect();
            const enriched = {
                ...nextSession,
                userId: profile.id,
                email: profile.email,
                roles: profile.roles,
            };
            persistAdminSession(enriched);
            setSession(enriched);
        } catch {
            // Ignore introspect error here; token is already present.
        }
    }, []);

    const logout = useCallback(async () => {
        const token = getAdminSession()?.token;
        try {
            await AuthApi.logout(token);
        } finally {
            clearAdminSession();
            setSession(null);
            router.replace("/admin/login");
        }
    }, [router]);

    const value = useMemo<AdminAuthContextValue>(
        () => ({
            session,
            isLoading,
            isAuthenticated: Boolean(session),
            login,
            logout,
            hasPermission: (permission: string) => hasPermission(session, permission),
            hasAnyPermission: (permissionList: string[]) => hasAnyPermission(session, permissionList),
            canAccessPath: (path: string) => canAccessUrl(session, path),
            refreshProfile,
        }),
        [isLoading, login, logout, refreshProfile, session],
    );

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error("useAdminAuth phải được dùng bên trong AdminAuthProvider.");
    }
    return context;
}
