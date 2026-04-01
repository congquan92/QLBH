import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Voucher, VoucherQuery } from "@/types/voucher";

const WARNING_PREFIX = "[WARNING][VoucherApi]";

export const VoucherApi = {
    getPublicOrMyVouchers: async (query?: VoucherQuery) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/voucher/list", { params: { ...query, page, size } });
            return res.data as ApiResponse<PageResponse<Voucher>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /voucher/list failed.`, error);
            throw error;
        }
    },

    getAdminVouchers: async (query?: VoucherQuery) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/voucher/admin/list", { params: { ...query, page, size } });
            return res.data as ApiResponse<PageResponse<Voucher>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /voucher/admin/list failed.`, error);
            throw error;
        }
    },

    getMyAvailableVouchers: async (query?: Pick<VoucherQuery, "page" | "size" | "sort">) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/voucher/my-available", { params: { ...query, page, size } });
            return res.data as ApiResponse<PageResponse<Voucher>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /voucher/my-available failed.`, error);
            throw error;
        }
    },

    getDetail: async (id: number): Promise<ApiResponse<Voucher>> => {
        try {
            const res = await axiosInstance.get(`/voucher/detail/${id}`);
            return res.data as ApiResponse<Voucher>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /voucher/detail/{id} failed.`, error);
            throw error;
        }
    },

    create: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/voucher/add", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /voucher/add failed.`, error);
            throw error;
        }
    },

    update: async (id: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/voucher/update/${id}`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /voucher/update/{id} failed.`, error);
            throw error;
        }
    },
};
