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

export interface RbacRolePayload {
    name: string;
    description?: string;
    status?: "ACTIVE" | "INACTIVE" | string;
    page_ids?: number[];
}

export interface RbacGroupPermissionPayload {
    name: string;
    description?: string;
    status?: string;
    url?: string;
    icon?: string;
    permission_ids: number[];
}

export interface RbacPageCatalogItem {
    id: number;
    title: string;
    icon?: string;
    sort_order?: number;
    items?: RbacGroupPermission[];
}

export type RoleListResponse = ApiResponse<PageResponse<RbacRole>>;
export type GroupPermissionListResponse = ApiResponse<PageResponse<RbacGroupPermission>>;
