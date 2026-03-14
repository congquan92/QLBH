import type { LoginResponse, LoginRole } from "@/types/auth";

export const ADMIN_SESSION_STORAGE_KEY = "qlbh_admin_session";
export const ADMIN_STORAGE_PREFIX = "qlbh_admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

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

export function buildAdminSession(loginResponse: LoginResponse): AdminSession {
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
