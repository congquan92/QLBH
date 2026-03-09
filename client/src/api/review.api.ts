import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { CreateReviewPayload, Review, ReviewQuery, UpdateReviewPayload } from "@/types/review";

const WARNING_PREFIX = "[WARNING][ReviewApi]";

function createEmptyReviewListResponse(page: number, size: number): ApiResponse<PageResponse<Review>> {
    return {
        status: 200,
        message: "No review data",
        data: {
            data: [],
            pageNumber: page,
            pageSize: size,
            totalPages: 0,
            totalElements: 0,
        },
    };
}

function createEmptyReviewDetailResponse(): ApiResponse<Review> {
    return {
        status: 404,
        message: "Review not found",
        data: null as unknown as Review,
    };
}

function isPageReview(value: unknown): value is PageResponse<Review> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<Review>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function isWrappedReview(value: unknown): value is ApiResponse<PageResponse<Review>> {
    if (!value || typeof value !== "object") return false;
    const payload = value as ApiResponse<PageResponse<Review>>;
    return isPageReview(payload.data);
}

function normalizeReviewList(payload: unknown, page: number, size: number): ApiResponse<PageResponse<Review>> {
    if (isWrappedReview(payload)) return payload;
    if (isPageReview(payload)) {
        return {
            status: 200,
            message: "Review list fetched",
            data: payload,
        };
    }
    console.warn(`${WARNING_PREFIX} Invalid review list response shape.`);
    return createEmptyReviewListResponse(page, size);
}

function normalizeReviewDetail(payload: unknown): ApiResponse<Review> {
    if (payload && typeof payload === "object") {
        const wrapped = payload as ApiResponse<Review>;
        if (wrapped.data && typeof wrapped.data === "object") {
            return wrapped;
        }
        if (typeof (payload as Review).id === "number") {
            return {
                status: 200,
                message: "Review detail fetched",
                data: payload as Review,
            };
        }
    }
    console.warn(`${WARNING_PREFIX} Invalid review detail response shape.`);
    return createEmptyReviewDetailResponse();
}

export const ReviewApi = {
    getPublicReviewById: async (id: number): Promise<ApiResponse<Review>> => {
        try {
            const res = await axiosInstance.get(`/reviews/${id}`);
            return normalizeReviewDetail(res.data);
        } catch (error) {
            console.error(`${WARNING_PREFIX} /reviews/{id} failed.`, error);
            return createEmptyReviewDetailResponse();
        }
    },

    getAdminReviews: async (query?: ReviewQuery) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/reviews", {
                params: { ...query, page, size },
            });
            return normalizeReviewList(res.data, page, size);
        } catch (error) {
            console.error(`${WARNING_PREFIX} /reviews failed.`, error);
            return createEmptyReviewListResponse(page, size);
        }
    },

    getMyReviewByProduct: async (productId: number): Promise<ApiResponse<Review[]>> => {
        try {
            const res = await axiosInstance.get(`/reviews/me/${productId}`);
            if (Array.isArray(res.data)) {
                return {
                    status: 200,
                    message: "My review by product fetched",
                    data: res.data,
                };
            }
            const wrapped = res.data as ApiResponse<Review[]>;
            if (wrapped && Array.isArray(wrapped.data)) {
                return wrapped;
            }
            console.warn(`${WARNING_PREFIX} Invalid /reviews/me/{productId} response shape.`);
            return { status: 200, message: "No review data", data: [] };
        } catch (error) {
            console.error(`${WARNING_PREFIX} /reviews/me/{productId} failed.`, error);
            return { status: 200, message: "No review data", data: [] };
        }
    },

    create: async (payload: CreateReviewPayload) => {
        try {
            const res = await axiosInstance.post("/reviews", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /reviews [POST] failed.`, error);
            return { status: 500, message: "Create review failed", data: null };
        }
    },

    update: async (id: number, payload: UpdateReviewPayload) => {
        console.warn(`${WARNING_PREFIX} /reviews/{id} [PUT] is not exposed in backend routes.`, { id, payload });
        return { status: 501, message: "Update review endpoint is not available", data: null };
    },

    addImages: async (reviewId: number, imageUrls: string[]) => {
        console.warn(`${WARNING_PREFIX} /reviews/{reviewId}/images [POST] is not exposed in backend routes.`, {
            reviewId,
            imageUrls,
        });
        return { status: 501, message: "Add review images endpoint is not available", data: null };
    },

    deleteImages: async (reviewId: number, imageIds: number[]) => {
        console.warn(`${WARNING_PREFIX} /reviews/{reviewId}/images [DELETE] is not exposed in backend routes.`, {
            reviewId,
            imageIds,
        });
        return { status: 501, message: "Delete review images endpoint is not available", data: null };
    },

    deleteByAdmin: async (id: number) => {
        console.warn(`${WARNING_PREFIX} /reviews/{id} [DELETE] is not exposed in backend routes.`, { id });
        return { status: 501, message: "Delete review endpoint is not available", data: null };
    },
};
