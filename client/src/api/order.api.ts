import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { CreateOrderPayload, OrderSummary } from "@/types/order";
import type { PageResponse } from "@/types/api";

const WARNING_PREFIX = "[WARNING][OrderApi]";

type OrderListQuery = {
    keyword?: string;
    sort?: string;
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
    deliveryStatus?: string;
    deliveryDistrict?: string;
    deliveryProvince?: string;
    deliveryWard?: string;
};

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

    getMyOrders: async (query?: OrderListQuery): Promise<ApiResponse<PageResponse<OrderSummary>>> => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/order/list", { params: { ...query, page, size } });
            return res.data as ApiResponse<PageResponse<OrderSummary>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /order/list failed.`, error);
            throw error;
        }
    },

    getAdminOrders: async (query?: OrderListQuery): Promise<ApiResponse<PageResponse<OrderSummary>>> => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/order/admin/list", { params: { ...query, page, size } });
            return res.data as ApiResponse<PageResponse<OrderSummary>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /order/admin/list failed.`, error);
            throw error;
        }
    },

    getMyOrderDetail: async (id: number): Promise<ApiResponse<OrderSummary>> => {
        try {
            const res = await axiosInstance.get(`/order/${id}`);
            return res.data as ApiResponse<OrderSummary>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /order/{id} failed.`, error);
            throw error;
        }
    },

    getAdminOrderDetail: async (id: number): Promise<ApiResponse<OrderSummary>> => {
        try {
            const res = await axiosInstance.get(`/order/admin/${id}`);
            return res.data as ApiResponse<OrderSummary>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /order/admin/{id} failed.`, error);
            throw error;
        }
    },

    changeStatus: async (id: number, status: string) => {
        try {
            const res = await axiosInstance.post(`/order/changestatus/${id}`, { status });
            return {
                status: res.status,
                message: (res.data as { message?: string } | undefined)?.message ?? "Order status updated",
                data: (res.data as { data?: unknown } | undefined)?.data ?? null,
            };
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/changestatus/{id} failed.`, error);
            throw error;
        }
    },

    complete: async (id: number) => {
        try {
            const res = await axiosInstance.put(`/order/complete/${id}`);
            return {
                status: res.status,
                message: (res.data as { message?: string } | undefined)?.message ?? "Order completed",
                data: (res.data as { data?: unknown } | undefined)?.data ?? null,
            };
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/complete/{id} failed.`, error);
            throw error;
        }
    },

    cancel: async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/order/cancel/${id}`);
            return {
                status: res.status,
                message: (res.data as { message?: string } | undefined)?.message ?? "Order cancelled",
                data: (res.data as { data?: unknown } | undefined)?.data ?? null,
            };
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/cancel/{id} failed.`, error);
            throw error;
        }
    },
};
