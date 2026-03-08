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

    getProductsByCategory: async (categoryId: number, page = 1, size = 10): Promise<ApiResponse<PageResponse<Product>>> => {
        try {
            const res = await axiosInstance.get<ApiResponse<PageResponse<Product>>>(`/product/category/${categoryId}`, {
                params: { page, size },
            });

            if (!isValidProductListResponse(res.data)) {
                console.warn(`${WARNING_PREFIX} Invalid /product/category/{id} response shape. Fallback static data is used.`);
                return createFallbackProductListResponse(page, size);
            }

            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/category/{id} failed. Fallback static data is used.`, error);
            return createFallbackProductListResponse(page, size);
        }
    },

    /** GET /product/admin/list — Admin product list with full info */
    getAdminProducts: async (page = 1, size = 20): Promise<ApiResponse<PageResponse<Product>>> => {
        try {
            const res = await axiosInstance.get<ApiResponse<PageResponse<Product>>>("/product/admin/list", {
                params: { page, size },
            });
            if (!isValidProductListResponse(res.data)) {
                console.warn(`${WARNING_PREFIX} Invalid /product/admin/list response shape. Fallback static data is used.`);
                return createFallbackProductListResponse(page, size);
            }
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/admin/list failed. Fallback static data is used.`, error);
            return createFallbackProductListResponse(page, size);
        }
    },

    /**
     * Admin detail currently shares public detail route.
     * Backend does not expose /product/admin/detail/{id} in routes/api.php.
     */
    getAdminProductDetail: async (id: number): Promise<ApiResponse<ProductDetail>> => {
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

    /** POST /product/add — Create new product */
    addProduct: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/product/add", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/add failed.`, error);
            throw error;
        }
    },

    /** PUT /product/update — Update product */
    updateProduct: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put("/product/update", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/update failed.`, error);
            throw error;
        }
    },

    /** DELETE /product/{id}/delete — Delete product */
    deleteProduct: async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/product/${id}/delete`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/{id}/delete failed.`, error);
            throw error;
        }
    },

    /** POST /product/{id}/restore — Restore deleted product */
    restoreProduct: async (id: number) => {
        try {
            const res = await axiosInstance.post(`/product/${id}/restore`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/{id}/restore failed.`, error);
            throw error;
        }
    },

    /** POST /product/{id}/variants/add — Add variants to product */
    addVariants: async (productId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post(`/product/${productId}/variants/add`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/{id}/variants/add failed.`, error);
            throw error;
        }
    },

    /** PUT /product/{id}/variants/update — Update variants */
    updateVariants: async (productId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/product/${productId}/variants/update`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/{id}/variants/update failed.`, error);
            throw error;
        }
    },

    /** DELETE /product/{id}/attribute/delete — Delete attribute */
    deleteAttribute: async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/product/${id}/attribute/delete`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/{id}/attribute/delete failed.`, error);
            throw error;
        }
    },

    /** DELETE /product/{id}/attributeValue/delete — Delete attribute value */
    deleteAttributeValue: async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/product/${id}/attributeValue/delete`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/{id}/attributeValue/delete failed.`, error);
            throw error;
        }
    },
};
