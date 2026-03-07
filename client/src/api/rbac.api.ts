import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { RbacGroupPermission, RbacGroupPermissionPayload, RbacPageCatalogItem, RbacRole, RbacRolePayload } from "@/types/rbac";

const WARNING_PREFIX = "[WARNING][RbacApi]";

function isPage<T>(value: unknown): value is PageResponse<T> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<T>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function normalizeList<T>(payload: unknown, fallbackMessage: string): ApiResponse<PageResponse<T>> {
    if (payload && typeof payload === "object") {
        const wrapped = payload as ApiResponse<PageResponse<T>>;
        if (isPage<T>(wrapped.data)) {
            return wrapped;
        }
        if (isPage<T>(payload)) {
            return {
                status: 200,
                message: fallbackMessage,
                data: payload as PageResponse<T>,
            };
        }
    }

    return {
        status: 200,
        message: fallbackMessage,
        data: {
            data: [],
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
            totalElements: 0,
        },
    };
}

function normalizeEntity<T>(payload: unknown): T | null {
    if (!payload || typeof payload !== "object") return null;
    const wrapped = payload as ApiResponse<T>;
    if (wrapped.data && typeof wrapped.data === "object") {
        return wrapped.data;
    }
    return payload as T;
}

export const RbacApi = {
    getRoles: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/roles", { params: query });
            return normalizeList<RbacRole>(res.data, "Role list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /roles failed.`, error);
            return normalizeList<RbacRole>(null, "Role list fallback");
        }
    },

    getGroupPermissions: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/group-permissions", { params: query });
            return normalizeList<RbacGroupPermission>(res.data, "Group permission list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /group-permissions failed.`, error);
            return normalizeList<RbacGroupPermission>(null, "Group permission list fallback");
        }
    },

    getPages: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/pages", { params: query });
            return normalizeList<RbacPageCatalogItem>(res.data, "Page catalog fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /pages failed.`, error);
            return normalizeList<RbacPageCatalogItem>(null, "Page catalog fallback");
        }
    },

    createRole: async (payload: RbacRolePayload) => {
        const res = await axiosInstance.post("/roles", payload);
        return normalizeEntity<RbacRole>(res.data);
    },

    updateRole: async (id: number, payload: RbacRolePayload) => {
        const res = await axiosInstance.put(`/roles/${id}`, payload);
        return normalizeEntity<RbacRole>(res.data);
    },

    deleteRole: async (id: number) => {
        const res = await axiosInstance.delete(`/roles/${id}`);
        return res.data;
    },

    createGroupPermission: async (payload: RbacGroupPermissionPayload) => {
        const res = await axiosInstance.post("/group-permissions", payload);
        return normalizeEntity<RbacGroupPermission>(res.data);
    },

    updateGroupPermission: async (id: number, payload: Partial<RbacGroupPermissionPayload>) => {
        const res = await axiosInstance.put(`/group-permissions/${id}`, payload);
        return normalizeEntity<RbacGroupPermission>(res.data);
    },

    deleteGroupPermission: async (id: number) => {
        const res = await axiosInstance.delete(`/group-permissions/${id}`);
        return res.data;
    },
};
