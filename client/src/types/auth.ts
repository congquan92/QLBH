export type UserRole = "ADMIN" | "MANAGER" | "STAFF" | "USER";

export interface LoginResponse {
    token: string;
    authenticated: boolean;
    role: UserRole;
    expiredAt: string;
}

export interface AuthData {
    token: string;
    role: UserRole;
    expiredAt: string;
}
