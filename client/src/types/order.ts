import type { ApiResponse, PageResponse } from "@/types/api";

export interface OrderItem {
    id?: number;
    productId?: number;
    productVariantId?: number;
    quantity: number;
    nameProductSnapshot?: string;
    urlImageSnapShot?: string;
    listPriceSnapShot?: number | string;
    finalPrice?: number | string;
    [key: string]: unknown;
}

export interface OrderSummary {
    id: number;
    orderStatus?: string;
    deliveryStatus?: string;
    paymentStatus?: string;
    paymentType?: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryWardName?: string;
    deliveryDistrictName?: string;
    deliveryProvinceName?: string;
    deliveryWardCode?: string;
    totalFeeShip?: number | string;
    originalOrderAmount?: number | string;
    discountValue?: number | string;
    totalAmount?: number | string;
    createdAt?: string;
    orderItem?: OrderItem[];
    orderItemResponses?: OrderItem[];
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
