import type { ApiResponse, PageResponse } from "@/types/api";

export interface OrderItem {
    id?: number;
    productId?: number;
    productVariantId?: number;
    quantity: number;
    nameProductSnapshot?: string;
    finalPrice?: number | string;
    [key: string]: unknown;
}

export interface OrderSummary {
    id: number;
    orderStatus?: string;
    paymentStatus?: string;
    totalAmount?: number | string;
    createdAt?: string;
    orderItem?: OrderItem[];
    [key: string]: unknown;
}

export interface CreateOrderPayload {
    customerName: string;
    customerPhone: string;
    deliveryWardName: string;
    deliveryWardCode: string;
    deliveryDistrictId: number;
    deliveryProvinceId: number;
    deliveryDistrictName: string;
    deliveryProvinceName: string;
    deliveryAddress: string;
    paymentType: string;
    note?: string;
    voucherId?: number;
    point?: number;
    order_items: Array<{
        productVariantId: number;
        quantity: number;
    }>;
}

export type OrderListResponse = ApiResponse<PageResponse<OrderSummary>>;
export type OrderDetailResponse = ApiResponse<OrderSummary>;
