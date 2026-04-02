import type { ApiResponse, PageResponse } from "@/types/api";

export interface CartVariantAttribute {
    id: number;
    attribute: string;
    value: string;
}

export interface CartProductVariant {
    id: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    price: string;
    quantity: number;
    sku: string;
    variantAttributes: CartVariantAttribute[];
}

export interface CartItem {
    id: number;
    productVariantId?: number;
    product_variant_id?: number;
    quantity: number;
    listPriceSnapshot?: number | string;
    urlImageSnapshot?: string;
    nameProductSnapshot?: string;
    product_variant?: CartProductVariant;
    name?: string;
    price?: number | string;
    image?: string;
    attributes?: Record<string, string>;
    status?: string;
    is_available?: boolean;
    available_stock?: number;
    unavailable_reason?: string;
    [key: string]: unknown;
}

export interface AddCartItemPayload {
    product_variant_id: number;
    quantity: number;
}

export interface UpdateCartItemPayload {
    quantity: number;
}

export type CartListResponse = PageResponse<CartItem>;
