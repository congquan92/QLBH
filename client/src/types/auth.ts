export type UserRole = "ADMIN" | "USER" | "WAREHOUSE_STAFF" | "ORDER_STAFF";

export interface RolePermission {
    id: number;
    name: string;
    description?: string | null;
}

export interface RoleGroupPermission {
    id: number;
    name: string;
    url?: string;
    icon?: string;
    status?: string;
    permissions?: RolePermission[];
}

export interface RolePage {
    id: number;
    title: string;
    icon?: string;
    sort_order?: number;
    items?: RoleGroupPermission[];
}

export interface LoginRole {
    id: number;
    name: UserRole | string;
    description?: string | null;
    status: string;
    page: RolePage[];
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
