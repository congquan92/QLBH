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
    page_id?: number | null;
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
    assigned_group_permission_ids?: number[];
    page?: RbacPage[];
}

export interface RbacRolePayload {
    name: string;
    description?: string;
    status?: "ACTIVE" | "INACTIVE" | string;
    group_permission_ids?: number[];
}

export interface RbacGroupPermissionPayload {
    name: string;
    description?: string;
    status?: string;
    url?: string;
    icon?: string;
    permission_ids: number[];
}

export interface RbacGroupPermissionUpdatePayload {
    name?: string;
    description?: string;
    status?: string;
    url?: string;
    icon?: string;
    page_id?: number | null;
    permission_ids?: number[];
}

export interface RbacPageCatalogItem {
    id: number;
    title: string;
    icon?: string;
    sort_order?: number;
    items?: RbacGroupPermission[];
}
