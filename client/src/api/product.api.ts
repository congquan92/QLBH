import { createFallbackProductDetailResponse, createFallbackProductListResponse } from "@/data/static-fallback";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Product, ProductDetail } from "@/types/product";

const WARNING_PREFIX = "[WARNING][ProductApi]";

function isValidProductListResponse(payload: unknown): payload is ApiResponse<PageResponse<Product>> {
    if (!payload || typeof payload !== "object") return false;
    const data = (payload as ApiResponse<PageResponse<Product>>).data;
    return !!data && Array.isArray(data.data) && typeof data.pageNumber === "number" && typeof data.pageSize === "number";
}

function isValidProductDetailResponse(payload: unknown): payload is ApiResponse<ProductDetail> {
    if (!payload || typeof payload !== "object") return false;
    const data = (payload as ApiResponse<ProductDetail>).data;
    return !!data && typeof data.id === "number" && typeof data.name === "string";
}

export const ProductApi = {
    getAllProducts: async (page = 1, size = 10): Promise<ApiResponse<PageResponse<Product>>> => {
        try {
            const res = await axiosInstance.get<ApiResponse<PageResponse<Product>>>("/product/list", {
                // Backend uses `size`, not `pageSize`.
                params: { page, size },
            });

            if (!isValidProductListResponse(res.data)) {
                console.warn(`${WARNING_PREFIX} Invalid /product/list response shape. Fallback static data is used.`);
                return createFallbackProductListResponse(page, size);
            }

            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/list failed. Fallback static data is used.`, error);
            return createFallbackProductListResponse(page, size);
        }
    },

    getProductDetail: async (id: string): Promise<ApiResponse<ProductDetail>> => {
        try {
            const res = await axiosInstance.get<ApiResponse<ProductDetail>>(`/product/detail/${id}`);

            if (!isValidProductDetailResponse(res.data)) {
                console.warn(`${WARNING_PREFIX} Invalid /product/detail/{id} response shape. Fallback static data is used.`);
                return createFallbackProductDetailResponse();
            }

            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/detail/{id} failed. Fallback static data is used.`, error);
            return createFallbackProductDetailResponse();
        }
    },
};
