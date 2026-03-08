import { createFallbackOrderDetailResponse, createFallbackOrderListResponse } from "@/data/static-fallback";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { CreateOrderPayload, OrderSummary } from "@/types/order";

const WARNING_PREFIX = "[WARNING][OrderApi]";

function isPageOrder(value: unknown): value is PageResponse<OrderSummary> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<OrderSummary>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function isWrappedOrder(value: unknown): value is ApiResponse<PageResponse<OrderSummary>> {
    if (!value || typeof value !== "object") return false;
    const payload = value as ApiResponse<PageResponse<OrderSummary>>;
    return isPageOrder(payload.data);
}

function normalizeOrderList(payload: unknown, page: number, size: number): ApiResponse<PageResponse<OrderSummary>> {
    if (isWrappedOrder(payload)) return payload;
    if (isPageOrder(payload)) {
        return { status: 200, message: "Order list fetched", data: payload };
    }
    console.warn(`${WARNING_PREFIX} Invalid order list response shape. Fallback static data is used.`);
    return createFallbackOrderListResponse(page, size);
}

function normalizeOrderDetail(payload: unknown): ApiResponse<OrderSummary> {
    if (payload && typeof payload === "object") {
        const wrapped = payload as ApiResponse<OrderSummary>;
        if (wrapped.data && typeof wrapped.data === "object") {
            return wrapped;
        }
        if (typeof (payload as OrderSummary).id === "number") {
            return {
                status: 200,
                message: "Order detail fetched",
                data: payload as OrderSummary,
            };
        }
    }
    console.warn(`${WARNING_PREFIX} Invalid order detail response shape. Fallback static data is used.`);
    return createFallbackOrderDetailResponse();
}

export const OrderApi = {
    create: async (payload: CreateOrderPayload): Promise<ApiResponse<unknown>> => {
        try {
            const res = await axiosInstance.post("/order/add", payload);
            if (res.data && typeof res.data === "object") {
                if ("status" in res.data && "message" in res.data) {
                    return res.data as ApiResponse<unknown>;
                }
                return {
                    status: 201,
                    message: "Order created",
                    data: res.data,
                };
            }
            return { status: 201, message: "Order created", data: null };
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/add failed.`, error);
            return { status: 500, message: "Create order failed", data: null };
        }
    },

    getMyOrders: async (query?: { keyword?: string; sort?: string; page?: number; size?: number; startDate?: string; endDate?: string; deliveryStatus?: string }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/order/list", { params: { ...query, page, size } });
            return normalizeOrderList(res.data, page, size);
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/list failed. Fallback static data is used.`, error);
            return createFallbackOrderListResponse(page, size);
        }
    },

    getAdminOrders: async (query?: { keyword?: string; sort?: string; page?: number; size?: number; startDate?: string; endDate?: string; deliveryStatus?: string }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/order/admin/list", { params: { ...query, page, size } });
            return normalizeOrderList(res.data, page, size);
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/admin/list failed. Fallback static data is used.`, error);
            return createFallbackOrderListResponse(page, size);
        }
    },

    getMyOrderDetail: async (id: number) => {
        try {
            const res = await axiosInstance.get(`/order/${id}`);
            return normalizeOrderDetail(res.data);
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/{id} failed. Fallback static data is used.`, error);
            return createFallbackOrderDetailResponse();
        }
    },

    getAdminOrderDetail: async (id: number) => {
        try {
            const res = await axiosInstance.get(`/order/admin/${id}`);
            return normalizeOrderDetail(res.data);
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/admin/{id} failed. Fallback static data is used.`, error);
            return createFallbackOrderDetailResponse();
        }
    },

    changeStatus: async (id: number, status: string) => {
        try {
            const res = await axiosInstance.post(`/order/changestatus/${id}`, { status });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/changestatus/{id} failed.`, error);
            return { status: 500, message: "Change order status failed", data: null };
        }
    },

    complete: async (id: number) => {
        try {
            const res = await axiosInstance.put(`/order/complete/${id}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/complete/{id} failed.`, error);
            return { status: 500, message: "Complete order failed", data: null };
        }
    },

    cancel: async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/order/cancel/${id}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/cancel/{id} failed.`, error);
            return { status: 500, message: "Cancel order failed", data: null };
        }
    },
};
