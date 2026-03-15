import type { ApiResponse, PageResponse } from "@/types/api";
import type { UserProfile } from "@/types/user";

export interface VoucherSummary {
    id: number;
    type?: string;
    description?: string;
    status?: string;
    discountValue?: number | string;
    maxDiscountValue?: number | string;
    minDiscountValue?: number | string;
    totalQuantity?: number;
    isShipping?: boolean;
    startDate?: string;
    endDate?: string;
    usageLimitPerUser?: number;
    used_quantity?: number | string;
    remaining_quantity?: number | string;
    [key: string]: unknown;
}

export interface OrderItem {
    id?: number;
    orderItemId?: number;
    productId?: number;
    productVariantId?: number;
    quantity: number;
    nameProductSnapshot?: string;
    nameProductSnapShot?: string;
    urlImageSnapShot?: string;
    listPriceSnapShot?: number | string;
    finalPrice?: number | string;
    isReviewed?: boolean;
    variantSnapShot?: string;
    [key: string]: unknown;
}

export interface OrderSummary {
    id: number;
    orderStatus?: string;
    deliveryStatus?: string;
    paymentStatus?: string;
    paymentType?: string;
    userResponse?: UserProfile;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryWardName?: string;
    deliveryDistrictId?: number;
    deliveryProvinceId?: number;
    deliveryDistrictName?: string;
    deliveryProvinceName?: string;
    deliveryWardCode?: string;
    note?: string;
    isConfirmed?: boolean;
    totalFeeShip?: number | string;
    originalOrderAmount?: number | string;
    discountValue?: number | string;
    totalAmount?: number | string;
    createdAt?: string;
    updatedAt?: string;
    orderTrackingCode?: string;
    voucherResponse?: VoucherSummary | null;
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
