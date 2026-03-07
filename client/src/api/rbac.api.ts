import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { RbacGroupPermission, RbacRole } from "@/types/rbac";

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
};
