import type { ApiResponse, PageResponse } from "@/types/api";

export interface CartItem {
    id: number;
    productVariantId?: number;
    quantity: number;
    listPriceSnapshot?: number | string;
    urlImageSnapshot?: string;
    nameProductSnapshot?: string;
    [key: string]: unknown;
}

export interface AddCartItemPayload {
    product_variant_id: number;
    quantity: number;
}

export interface UpdateCartItemPayload {
    quantity: number;
}

export type CartListResponse = ApiResponse<PageResponse<CartItem>>;
