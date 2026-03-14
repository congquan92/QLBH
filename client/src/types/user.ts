import type { ApiResponse, PageResponse } from "@/types/api";

export interface UserProfile {
    id: number;
    userName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    status?: string;
    role?: unknown;
    [key: string]: unknown;
}

export interface UserAddress {
    id: number;
    fullName?: string;
    phone?: string;
    provinceName?: string;
    districtName?: string;
    wardName?: string;
    detail?: string;
    isDefault?: boolean;
    [key: string]: unknown;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    password: string;
    confirmPassword: string;
}

export type UserListResponse = ApiResponse<PageResponse<UserProfile>>;
export type AddressListResponse = ApiResponse<PageResponse<UserAddress>>;
