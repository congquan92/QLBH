import type { LoginResponse, LoginRole } from "@/types/auth";

const ADMIN_SESSION_STORAGE_KEY = "qlbh_admin_session";

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

interface RolePagePermission {
    name?: string;
}

interface RolePageItem {
    url?: string;
    permissions?: RolePagePermission[];
}

interface RolePage {
    items?: RolePageItem[];
}

function normalizeAdminPath(raw?: string) {
    const value = String(raw ?? "").trim();
    if (!value) return "";

    let candidate = value;

    // Some backend payloads can include absolute URLs; keep only pathname for ACL checks.
    if (/^https?:\/\//i.test(candidate)) {
        try {
            candidate = new URL(candidate).pathname;
        } catch {
            // Ignore parse failure and continue with raw candidate.
        }
    }

    const pathOnly = candidate.split(/[?#]/)[0]?.trim() ?? "";
    if (!pathOnly) return "";

    const normalized = pathOnly.replace(/\/+$/, "");
    if (!normalized) return "/admin";
    if (normalized.startsWith("/admin")) return normalized;
    if (normalized.startsWith("/")) return `/admin${normalized}`;
    return `/admin/${normalized}`;
}

function isBrowser() {
    return typeof window !== "undefined";
}

function normalizeRoleName(value?: string) {
    return String(value ?? "")
        .trim()
        .toUpperCase();
}

function extractRolePages(role: LoginRole): RolePage[] {
    if (!Array.isArray(role.page)) {
        return [];
    }
    return role.page as RolePage[];
}

function extractStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    return value.map((item) => String(item ?? "").trim()).filter((item) => item.length > 0);
}

function extractPermissionsFromRole(role: LoginRole): string[] {
    const values = new Set<string>();

    for (const page of extractRolePages(role)) {
        for (const item of page.items ?? []) {
            for (const permission of item.permissions ?? []) {
                const name = permission?.name;
                if (!name) continue;
                values.add(String(name).trim().toUpperCase());
            }
        }
    }

    return Array.from(values);
}

function extractAllowedUrlsFromRole(role: LoginRole): string[] {
    const values = new Set<string>();

    for (const page of extractRolePages(role)) {
        for (const item of page.items ?? []) {
            const raw = item?.url;
            if (!raw) continue;
            const normalized = normalizeAdminPath(String(raw).trim());
            if (!normalized) continue;
            values.add(normalized);
        }
    }

    return Array.from(values);
}

function canUseRoleForAdmin(role: LoginRole, permissions: string[], allowedUrls: string[]) {
    const hasPages = extractRolePages(role).some((page) => (page.items?.length ?? 0) > 0);
    return hasPages || permissions.length > 0 || allowedUrls.length > 0;
}

function extractCandidateAdminPaths(role: LoginRole, allowedUrls: string[]) {
    const values = new Set<string>();

    for (const allowedUrl of allowedUrls) {
        const normalized = normalizeAdminPath(allowedUrl);
        if (normalized) values.add(normalized);
    }

    for (const page of extractRolePages(role)) {
        for (const item of page.items ?? []) {
            const normalized = normalizeAdminPath(item?.url);
            if (normalized) values.add(normalized);
        }
    }

    return Array.from(values);
}

export const AdminAuthUtil = {
    buildSession(loginResponse: LoginResponse): AdminSession {
        const roleName = normalizeRoleName(loginResponse.role?.name);
        const permissions = extractPermissionsFromRole(loginResponse.role);
        const allowedUrls = extractAllowedUrlsFromRole(loginResponse.role);

        return {
            token: loginResponse.token,
            authenticated: Boolean(loginResponse.authenticated),
            role: loginResponse.role,
            roleName,
            expiredAt: loginResponse.expiredAt,
            permissions,
            allowedUrls,
        };
    },

    persistSession(session: AdminSession) {
        if (!isBrowser()) return;
        window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
    },

    getSession(): AdminSession | null {
        if (!isBrowser()) return null;

        const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
        if (!raw) return null;

        try {
            const parsed = JSON.parse(raw) as Partial<AdminSession>;
            if (!parsed || typeof parsed !== "object" || !parsed.token || !parsed.role) {
                return null;
            }

            const role = parsed.role as LoginRole;
            const rolePermissions = extractPermissionsFromRole(role);
            const roleAllowedUrls = extractAllowedUrlsFromRole(role);
            const storedPermissions = extractStringArray(parsed.permissions).map((permission) => permission.toUpperCase());
            const storedAllowedUrls = extractStringArray(parsed.allowedUrls);

            return {
                token: String(parsed.token),
                expiredAt: String(parsed.expiredAt ?? ""),
                authenticated: Boolean(parsed.authenticated),
                role,
                roleName: normalizeRoleName(parsed.roleName ?? role.name),
                userId: typeof parsed.userId === "number" ? parsed.userId : undefined,
                email: parsed.email,
                roles: Array.isArray(parsed.roles) ? parsed.roles : undefined,
                permissions: Array.from(new Set([...rolePermissions, ...storedPermissions])),
                allowedUrls: Array.from(new Set([...roleAllowedUrls, ...storedAllowedUrls])),
            };
        } catch {
            return null;
        }
    },

    clearSession() {
        if (!isBrowser()) return;
        window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    },

    patchSession(partial: Partial<AdminSession>) {
        const current = this.getSession();
        if (!current) return;
        this.persistSession({ ...current, ...partial });
    },

    isSessionValid(session: AdminSession | null) {
        if (!session || !session.token || !session.roleName) return false;
        return canUseRoleForAdmin(session.role, session.permissions, session.allowedUrls);
    },

    hasPermission(session: AdminSession | null, permission: string) {
        if (!session) return false;
        return session.permissions.includes(permission.trim().toUpperCase());
    },

    hasAnyPermission(session: AdminSession | null, permissionList: string[]) {
        if (!session) return false;
        return permissionList.some((permission) => this.hasPermission(session, permission));
    },

    canAccessUrl(session: AdminSession | null, url: string) {
        if (!session) return false;

        const normalized = normalizeAdminPath(url);
        if (normalized === "/admin/forbidden") {
            return true;
        }

        if (session.allowedUrls.length === 0) {
            return true;
        }

        if (!normalized) return false;
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
            return Array.from(candidates).some((candidate) => candidate.startsWith(`${base}/`));
        });
    },

    resolveDefaultAdminPath(session: AdminSession | null, fallback = "/admin/categories") {
        if (!session) return fallback;

        const candidates = extractCandidateAdminPaths(session.role, session.allowedUrls);
        const preferred = candidates.find((path) => path !== "/admin/dashboard");
        return preferred ?? fallback;
    },
};
