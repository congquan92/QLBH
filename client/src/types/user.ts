import type { ApiResponse, PageResponse } from "@/types/api";

export interface UserRankResponse {
    id: number;
    name: string;
    minSpent?: string;
    status?: string;
}

export interface UserRoleResponse {
    id: number;
    name: string;
    description?: string;
    status?: string;
    page?: unknown[];
}

export interface UserProfile {
    id: number;
    userName?: string;
    fullName?: string;
    gender?: "MALE" | "FEMALE" | "OTHER" | string;
    dateOfBirth?: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
    status?: string;
    point?: number;
    verifiedEmail?: boolean;
    verifiedPhone?: boolean;
    totalSpent?: number | string;
    addressResponses?: UserAddress[];
    userRankResponse?: UserRankResponse | null;
    role?: UserRoleResponse | unknown;
    [key: string]: unknown;
}

export interface UserAddress {
    id: number;
    address?: string;
    customer_name?: string;
    phone_number?: string;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    address_type?: string;
    is_default?: boolean | number;
    customerName?: string;
    phoneNumber?: string;
    province?: string;
    district?: string;
    ward?: string;
    provinceId?: number;
    districtId?: number;
    wardId?: number;
    addressType?: string;
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
