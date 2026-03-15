import { axiosInstance } from "@/lib/axios";
import type { AddCartItemPayload, CartItem, CartListResponse, UpdateCartItemPayload } from "@/types/cart";

const WARNING_PREFIX = "[WARNING][CartApi]";

export const CartApi = {
    getMyCart: async (query?: { sort?: string; page?: number; size?: number }): Promise<CartListResponse> => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/carts", { params: { ...query, page, size } });
            return res.data as CartListResponse;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /carts [GET] failed.`, error);
            throw error;
        }
    },

    addItem: async (payload: AddCartItemPayload) => {
        try {
            const res = await axiosInstance.post("/carts", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /carts [POST] failed.`, error);
            throw error;
        }
    },

    updateItem: async (id: number, payload: UpdateCartItemPayload) => {
        try {
            const res = await axiosInstance.put(`/carts/${id}`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /carts/{id} [PUT] failed.`, error);
            throw error;
        }
    },

    deleteItem: async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/carts/${id}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /carts/{id} [DELETE] failed.`, error);
            throw error;
        }
    },
};
