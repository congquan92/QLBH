import type { ApiResponse, PageResponse } from "@/types/api";

export interface VoucherUserRank {
    id: number;
    name: string;
    minSpent?: string | number;
    status?: string;
}

export interface Voucher {
    id: number;
    name?: string;
    code?: string;
    description?: string;
    type?: string;
    discountValue?: number | string;
    maxDiscountValue?: number | string | null;
    minDiscountValue?: number | string;
    startDate?: string;
    endDate?: string;
    status?: string;
    totalQuantity?: number;
    remaining_quantity?: string | number;
    used_quantity?: string | number;
    isShipping?: boolean;
    usageLimitPerUser?: number;
    userRankResponse?: VoucherUserRank;
    [key: string]: unknown;
}

export type VoucherListResponse = ApiResponse<PageResponse<Voucher>>;
export type VoucherDetailResponse = ApiResponse<Voucher>;

export interface VoucherQuery {
    page?: number;
    size?: number;
    sort?: string;
    keyword?: string;
    rank?: string;
    timeStatus?: string;
    startDate?: string;
    endDate?: string;
}
