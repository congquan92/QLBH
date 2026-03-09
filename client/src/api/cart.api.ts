import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { AddCartItemPayload, CartItem, UpdateCartItemPayload } from "@/types/cart";

const WARNING_PREFIX = "[WARNING][CartApi]";

function createEmptyCartListResponse(page: number, size: number): ApiResponse<PageResponse<CartItem>> {
    return {
        status: 200,
        message: "No cart data",
        data: {
            data: [],
            pageNumber: page,
            pageSize: size,
            totalPages: 0,
            totalElements: 0,
        },
    };
}

function isPageCart(value: unknown): value is PageResponse<CartItem> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<CartItem>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function isWrappedCart(value: unknown): value is ApiResponse<PageResponse<CartItem>> {
    if (!value || typeof value !== "object") return false;
    const payload = value as ApiResponse<PageResponse<CartItem>>;
    return isPageCart(payload.data);
}

function normalizeCartList(payload: unknown, page: number, size: number): ApiResponse<PageResponse<CartItem>> {
    if (isWrappedCart(payload)) return payload;
    if (isPageCart(payload)) {
        return {
            status: 200,
            message: "Cart list fetched",
            data: payload,
        };
    }
    console.warn(`${WARNING_PREFIX} Invalid cart list response shape.`);
    return createEmptyCartListResponse(page, size);
}

export const CartApi = {
    getMyCart: async (query?: { sort?: string; page?: number; size?: number }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/carts", { params: { ...query, page, size } });
            return normalizeCartList(res.data, page, size);
        } catch (error) {
            console.error(`${WARNING_PREFIX} /carts [GET] failed.`, error);
            return createEmptyCartListResponse(page, size);
        }
    },

    addItem: async (payload: AddCartItemPayload) => {
        try {
            const res = await axiosInstance.post("/carts", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /carts [POST] failed.`, error);
            return { status: 500, message: "Add cart item failed", data: null };
        }
    },

    updateItem: async (id: number, payload: UpdateCartItemPayload) => {
        try {
            const res = await axiosInstance.put(`/carts/${id}`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /carts/{id} [PUT] failed.`, error);
            return { status: 500, message: "Update cart item failed", data: null };
        }
    },

    deleteItem: async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/carts/${id}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /carts/{id} [DELETE] failed.`, error);
            return { status: 500, message: "Delete cart item failed", data: null };
        }
    },
};
