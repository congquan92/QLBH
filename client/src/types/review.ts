import type { ApiResponse, PageResponse } from "@/types/api";

export interface Review {
    id: number;
    rating?: number;
    comment?: string | null;
    productId?: number;
    userId?: number;
    images?: string[];
    createdAt?: string;
    [key: string]: unknown;
}

export interface CreateReviewPayload {
    order_item_id: number;
    rating: number;
    comment?: string;
    image_url?: string[];
}

export interface UpdateReviewPayload {
    rating?: number;
    comment?: string;
}

export interface ReviewQuery {
    keyword?: string;
    sort?: string;
    page?: number;
    size?: number;
}

export type ReviewListResponse = ApiResponse<PageResponse<Review>>;
export type ReviewDetailResponse = ApiResponse<Review>;
