import type { ApiResponse, PageResponse } from "@/types/api";

export interface RbacPermission {
    id: number;
    name: string;
    description?: string | null;
}

export interface RbacGroupPermission {
    id: number;
    name: string;
    description?: string | null;
    status?: string;
    url?: string;
    icon?: string;
    permissions?: RbacPermission[];
}

export interface RbacPage {
    id: number;
    title: string;
    icon?: string;
    sort_order?: number;
    items?: RbacGroupPermission[];
}

export interface RbacRole {
    id: number;
    name: string;
    description?: string | null;
    status?: string;
    page?: RbacPage[];
}

export type RoleListResponse = ApiResponse<PageResponse<RbacRole>>;
export type GroupPermissionListResponse = ApiResponse<PageResponse<RbacGroupPermission>>;
