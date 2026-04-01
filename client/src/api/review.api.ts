import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { CreateReviewPayload, Review, ReviewQuery, UpdateReviewPayload } from "@/types/review";

const WARNING_PREFIX = "[WARNING][ReviewApi]";

export const ReviewApi = {
    getPublicReviewById: async (id: number): Promise<ApiResponse<Review>> => {
        try {
            const res = await axiosInstance.get(`/reviews/${id}`);
            return res.data as ApiResponse<Review>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /reviews/{id} failed.`, error);
            throw error;
        }
    },

    getByProduct: async (productId: number, page = 1, size = 5, sort = "id:desc"): Promise<ApiResponse<PageResponse<Review>>> => {
        try {
            const res = await axiosInstance.get(`/reviews/product/${productId}`, {
                params: { page, size, sort },
            });
            return res.data as ApiResponse<PageResponse<Review>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /reviews/product/{productId} failed.`, error);
            throw error;
        }
    },

    getAdminReviews: async (query?: ReviewQuery) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/reviews", {
                params: { ...query, page, size },
            });
            return res.data as ApiResponse<PageResponse<Review>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /reviews failed.`, error);
            throw error;
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
            return res.data as ApiResponse<Review[]>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /reviews/me/{productId} failed.`, error);
            throw error;
        }
    },

    create: async (payload: CreateReviewPayload) => {
        try {
            const res = await axiosInstance.post("/reviews", payload);
            return res.data as ApiResponse<Review>;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /reviews [POST] failed.`, error);
            throw error;
        }
    },

    // check backend
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
