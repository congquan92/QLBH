import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { CreateOrderPayload } from "@/types/order";

const WARNING_PREFIX = "[WARNING][OrderApi]";

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
            return res.data as ApiResponse<unknown>; // chua check lai
        } catch (error) {
            console.error(`${WARNING_PREFIX} /order/list failed.`, error);
            throw error;
        }
    },

    getAdminOrders: async (query?: { keyword?: string; sort?: string; page?: number; size?: number; startDate?: string; endDate?: string; deliveryStatus?: string }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/order/admin/list", { params: { ...query, page, size } });
            return res.data as ApiResponse<unknown>; // chua check lai
        } catch (error) {
            console.error(`${WARNING_PREFIX} /order/admin/list failed.`, error);
            throw error;
        }
    },

    getMyOrderDetail: async (id: number) => {
        try {
            const res = await axiosInstance.get(`/order/${id}`);
            return res.data as ApiResponse<unknown>; // chua check lai
        } catch (error) {
            console.error(`${WARNING_PREFIX} /order/{id} failed.`, error);
            throw error;
        }
    },

    getAdminOrderDetail: async (id: number) => {
        try {
            const res = await axiosInstance.get(`/order/admin/${id}`);
            return res.data as ApiResponse<unknown>; // chua check lai
        } catch (error) {
            console.error(`${WARNING_PREFIX} /order/admin/{id} failed.`, error);
            throw error;
        }
    },

    changeStatus: async (id: number, status: string) => {
        try {
            const res = await axiosInstance.post(`/order/changestatus/${id}`, { status });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/changestatus/{id} failed.`, error);
            throw error;
        }
    },

    complete: async (id: number) => {
        try {
            const res = await axiosInstance.put(`/order/complete/${id}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/complete/{id} failed.`, error);
            throw error;
        }
    },

    cancel: async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/order/cancel/${id}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /order/cancel/{id} failed.`, error);
            throw error;
        }
    },
};
