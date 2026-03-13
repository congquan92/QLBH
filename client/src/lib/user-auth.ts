import type { LoginResponse, LoginRole } from "@/types/auth";

const USER_SESSION_STORAGE_KEY = "qlbh_user_session";

export interface UserSession {
    token: string;
    expiredAt: string;
    authenticated: boolean;
    role: LoginRole;
    roleName: string;
    userId?: number;
    email?: string;
    roles?: string[];
    fullName?: string;
    phone?: string;
}

function isBrowser() {
    return typeof window !== "undefined";
}

function normalizeRoleName(value?: string) {
    return String(value ?? "")
        .trim()
        .toUpperCase();
}

function extractStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

export const UserAuthUtil = {
    buildSession(loginResponse: LoginResponse): UserSession {
        return {
            token: loginResponse.token,
            authenticated: Boolean(loginResponse.authenticated),
            role: loginResponse.role,
            roleName: normalizeRoleName(loginResponse.role?.name),
            expiredAt: loginResponse.expiredAt,
        };
    },

    persistSession(session: UserSession) {
        if (!isBrowser()) return;
        window.localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
    },

    getSession(): UserSession | null {
        if (!isBrowser()) return null;

        const raw = window.localStorage.getItem(USER_SESSION_STORAGE_KEY);
        if (!raw) return null;

        try {
            const parsed = JSON.parse(raw) as Partial<UserSession>;
            if (!parsed || typeof parsed !== "object" || !parsed.token || !parsed.role) {
                window.localStorage.removeItem(USER_SESSION_STORAGE_KEY);
                return null;
            }

            return {
                token: String(parsed.token),
                expiredAt: String(parsed.expiredAt ?? ""),
                authenticated: Boolean(parsed.authenticated),
                role: parsed.role as LoginRole,
                roleName: normalizeRoleName(parsed.roleName ?? (parsed.role as LoginRole).name),
                userId: typeof parsed.userId === "number" ? parsed.userId : undefined,
                email: parsed.email,
                roles: extractStringArray(parsed.roles),
                fullName: typeof parsed.fullName === "string" ? parsed.fullName : undefined,
                phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
            };
        } catch {
            window.localStorage.removeItem(USER_SESSION_STORAGE_KEY);
            return null;
        }
    },

    clearSession() {
        if (!isBrowser()) return;
        window.localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    },

    patchSession(partial: Partial<UserSession>) {
        const current = this.getSession();
        if (!current) return;
        this.persistSession({ ...current, ...partial });
    },

    isSessionValid(session: UserSession | null) {
        return Boolean(session?.token && session?.authenticated);
    },
};
