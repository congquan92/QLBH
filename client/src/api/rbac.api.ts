import { axiosInstance } from "@/lib/axios";

import type { RbacGroupPermission, RbacGroupPermissionPayload, RbacGroupPermissionUpdatePayload, RbacPageCatalogItem, RbacRole, RbacRolePayload } from "@/types/rbac";

const WARNING_PREFIX = "[WARNING][RbacApi]";

export const RbacApi = {
    getRoles: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/roles", { params: query });
            return res.data as RbacRole[]; // chua check lai
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /roles failed.`, error);
            throw error;
        }
    },

    getGroupPermissions: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/group-permissions", { params: query });
            return res.data as RbacGroupPermission[]; // chua check lai
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /group-permissions failed.`, error);
            throw error;
        }
    },

    getPages: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/pages", { params: query });
            return res.data as RbacPageCatalogItem[]; // chua check lai
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /pages failed.`, error);
            throw error;
        }
    },

    createRole: async (payload: RbacRolePayload) => {
        const res = await axiosInstance.post("/roles", payload);
        return res.data as RbacRole; // chua check lai
    },

    getRoleDetail: async (id: number) => {
        const res = await axiosInstance.get(`/roles/${id}`);
        return res.data as RbacRole; // chua check lai
    },

    updateRole: async (id: number, payload: RbacRolePayload) => {
        const res = await axiosInstance.put(`/roles/${id}`, payload);
        return res.data;
    },

    deleteRole: async (id: number) => {
        const res = await axiosInstance.delete(`/roles/${id}`);
        return res.data;
    },

    detachRoleGroups: async (id: number, payload: { group_ids: number[] }) => {
        const res = await axiosInstance.post(`/roles/${id}/detach-groups`, payload);
        return res.data;
    },

    createGroupPermission: async (payload: RbacGroupPermissionPayload) => {
        const res = await axiosInstance.post("/group-permissions", payload);
        return res.data as RbacGroupPermission; // chua check lai
    },

    getGroupPermissionDetail: async (id: number) => {
        const res = await axiosInstance.get(`/group-permissions/${id}`);
        return res.data as RbacGroupPermission; // chua check lai
    },

    updateGroupPermission: async (id: number, payload: RbacGroupPermissionUpdatePayload) => {
        const res = await axiosInstance.put(`/group-permissions/${id}`, payload);
        return res.data;
    },

    deleteGroupPermission: async (id: number) => {
        const res = await axiosInstance.delete(`/group-permissions/${id}`);
        return res.data;
    },

    detachPermissionsFromGroup: async (id: number, payload: { permission_ids: number[] }) => {
        const res = await axiosInstance.post(`/group-permissions/${id}/detach-permissions`, payload);
        return res.data;
    },

    getPageDetail: async (id: number) => {
        const res = await axiosInstance.get(`/pages/${id}`);
        return res.data as RbacPageCatalogItem; // chua check lai
    },

    createPage: async (payload: Record<string, unknown>) => {
        const res = await axiosInstance.post("/pages", payload);
        return res.data;
    },

    updatePage: async (id: number, payload: Record<string, unknown>) => {
        const res = await axiosInstance.put(`/pages/${id}`, payload);
        return res.data;
    },

    deletePage: async (id: number) => {
        const res = await axiosInstance.delete(`/pages/${id}`);
        return res.data;
    },

    detachGroupsFromPage: async (id: number, payload: { group_ids: number[] }) => {
        const res = await axiosInstance.post(`/pages/${id}/detach-groups`, payload);
        return res.data;
    },
};
