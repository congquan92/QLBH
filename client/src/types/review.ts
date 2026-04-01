import type { ApiResponse, PageResponse } from "@/types/api";

export interface ReviewImageItem {
    id: number;
    url: string;
}

export interface ReviewUserResponse {
    id?: number;
    fullName?: string;
    username?: string;
    avatar?: string | null;
    [key: string]: unknown;
}

export interface Review {
    id: number;
    productId: number;
    nameProduct?: string;
    variant?: Record<string, string> | string | null;
    rating: number;
    comment?: string | null;
    imageResponse?: ReviewImageItem[];
    userResponse?: ReviewUserResponse;
    createdAt?: string;
    updateAt?: string;
    // legacy/extra fields
    userId?: number;
    images?: string[];
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

