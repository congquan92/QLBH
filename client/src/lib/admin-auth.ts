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

const ADMIN_ROLE_SET = new Set(["ADMIN", "MANAGER", "STAFF"]);

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
            const normalized = String(raw).trim();
            if (!normalized) continue;
            values.add(normalized);
        }
    }

    return Array.from(values);
}

function canUseRoleForAdmin(roleName: string, permissions: string[]) {
    return ADMIN_ROLE_SET.has(roleName) || permissions.length > 0;
}

export function buildAdminSession(loginResponse: LoginResponse): AdminSession {
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
}

export function persistAdminSession(session: AdminSession) {
    if (!isBrowser()) return;
    window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getAdminSession(): AdminSession | null {
    if (!isBrowser()) return null;

    const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as Partial<AdminSession>;
        if (!parsed || typeof parsed !== "object" || !parsed.token || !parsed.role) {
            return null;
        }

        return {
            token: String(parsed.token),
            expiredAt: String(parsed.expiredAt ?? ""),
            authenticated: Boolean(parsed.authenticated),
            role: parsed.role,
            roleName: normalizeRoleName(parsed.roleName ?? parsed.role.name),
            userId: typeof parsed.userId === "number" ? parsed.userId : undefined,
            email: parsed.email,
            roles: Array.isArray(parsed.roles) ? parsed.roles : undefined,
            permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
            allowedUrls: Array.isArray(parsed.allowedUrls) ? parsed.allowedUrls : [],
        };
    } catch {
        return null;
    }
}

export function clearAdminSession() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export function patchAdminSession(partial: Partial<AdminSession>) {
    const current = getAdminSession();
    if (!current) return;
    persistAdminSession({ ...current, ...partial });
}

export function isAdminSession(session: AdminSession | null) {
    if (!session || !session.token || !session.roleName) return false;
    return canUseRoleForAdmin(session.roleName, session.permissions);
}

export function hasPermission(session: AdminSession | null, permission: string) {
    if (!session) return false;
    return session.permissions.includes(permission.trim().toUpperCase());
}

export function hasAnyPermission(session: AdminSession | null, permissionList: string[]) {
    if (!session) return false;
    return permissionList.some((permission) => hasPermission(session, permission));
}

export function canAccessUrl(session: AdminSession | null, url: string) {
    if (!session) return false;
    if (session.allowedUrls.length === 0) {
        return true;
    }

    const normalized = url.replace(/\/$/, "");
    const candidates = new Set<string>([normalized]);

    if (normalized.startsWith("/admin/")) {
        candidates.add(normalized.replace("/admin", ""));
    } else if (normalized.startsWith("/")) {
        candidates.add(`/admin${normalized}`);
    }

    return session.allowedUrls.some((allowed) => {
        const base = allowed.replace(/\/$/, "");
        if (candidates.has(base)) return true;
        return Array.from(candidates).some((candidate) => candidate.startsWith(`${base}/`));
    });
}
