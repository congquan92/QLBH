export type UserRole = "ADMIN" | "MANAGER" | "STAFF" | "USER";

export interface LoginRole {
    id: number;
    name: UserRole | string;
    description?: string | null;
    status: string;
    page: Array<unknown>;
}

export interface LoginResponse {
    token: string;
    authenticated: boolean;
    role: LoginRole;
    expiredAt: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
}

export interface AuthData {
    token: string;
    role: UserRole | string;
    expiredAt: string;
}
