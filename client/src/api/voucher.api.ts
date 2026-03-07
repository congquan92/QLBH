import { createFallbackVoucherDetailResponse, createFallbackVoucherListResponse } from "@/data/static-fallback";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Voucher, VoucherQuery } from "@/types/voucher";

const WARNING_PREFIX = "[WARNING][VoucherApi]";

function isPageVoucher(value: unknown): value is PageResponse<Voucher> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<Voucher>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function isWrappedVoucher(value: unknown): value is ApiResponse<PageResponse<Voucher>> {
    if (!value || typeof value !== "object") return false;
    const payload = value as ApiResponse<PageResponse<Voucher>>;
    return isPageVoucher(payload.data);
}

function normalizeVoucherList(payload: unknown, page: number, size: number): ApiResponse<PageResponse<Voucher>> {
    if (isWrappedVoucher(payload)) return payload;
    if (isPageVoucher(payload)) {
        return { status: 200, message: "Voucher list fetched", data: payload };
    }
    console.warn(`${WARNING_PREFIX} Invalid voucher list response shape. Fallback static data is used.`);
    return createFallbackVoucherListResponse(page, size);
}

export const VoucherApi = {
    getPublicOrMyVouchers: async (query?: VoucherQuery) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/voucher/list", { params: { ...query, page, size } });
            return normalizeVoucherList(res.data, page, size);
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /voucher/list failed. Fallback static data is used.`, error);
            return createFallbackVoucherListResponse(page, size);
        }
    },

    getAdminVouchers: async (query?: VoucherQuery) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/voucher/admin/list", { params: { ...query, page, size } });
            return normalizeVoucherList(res.data, page, size);
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /voucher/admin/list failed. Fallback static data is used.`, error);
            return createFallbackVoucherListResponse(page, size);
        }
    },

    getMyAvailableVouchers: async (query?: Pick<VoucherQuery, "page" | "size" | "sort">) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/voucher/my-available", { params: { ...query, page, size } });
            return normalizeVoucherList(res.data, page, size);
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /voucher/my-available failed. Fallback static data is used.`, error);
            return createFallbackVoucherListResponse(page, size);
        }
    },

    getDetail: async (id: number): Promise<ApiResponse<Voucher>> => {
        try {
            const res = await axiosInstance.get(`/voucher/detail/${id}`);
            const payload = res.data as ApiResponse<Voucher>;
            if (!payload || typeof payload !== "object" || !payload.data) {
                console.warn(`${WARNING_PREFIX} Invalid /voucher/detail/{id} response shape. Fallback static data is used.`);
                return createFallbackVoucherDetailResponse();
            }
            return payload;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /voucher/detail/{id} failed. Fallback static data is used.`, error);
            return createFallbackVoucherDetailResponse();
        }
    },

    create: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/voucher/add", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /voucher/add failed.`, error);
            return { status: 500, message: "Create voucher failed", data: null };
        }
    },

    update: async (id: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/voucher/update/${id}`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /voucher/update/{id} failed.`, error);
            return { status: 500, message: "Update voucher failed", data: null };
        }
    },
};
