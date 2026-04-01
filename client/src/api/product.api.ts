import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Product, ProductDetail } from "@/types/product";

const WARNING_PREFIX = "[WARNING][ProductApi]";

type ProductListQuery = {
    keyword?: string;
    sort?: string;
    page?: number;
    size?: number;
    minPrice?: number;
    maxPrice?: number;
};
function normalizeListQuery(pageOrQuery?: number | ProductListQuery, size?: number) {
    if (typeof pageOrQuery === "object") {
        return {
            page: pageOrQuery.page ?? 1,
            size: pageOrQuery.size ?? 10,
            keyword: pageOrQuery.keyword,
            sort: pageOrQuery.sort,
            minPrice: pageOrQuery.minPrice,
            maxPrice: pageOrQuery.maxPrice,
        };
    }

    return {
        page: pageOrQuery ?? 1,
        size: size ?? 10,
        keyword: undefined,
        sort: undefined,
        minPrice: undefined,
        maxPrice: undefined,
    };
}

type AdminProductListQuery = {
    keyword?: string;
    status?: string;
    sort?: string;
    page?: number;
    size?: number;
};

function normalizeAdminListQuery(pageOrQuery?: number | AdminProductListQuery, size?: number) {
    if (typeof pageOrQuery === "object") {
        return {
            page: pageOrQuery.page ?? 1,
            size: pageOrQuery.size ?? 20,
            keyword: pageOrQuery.keyword,
            status: pageOrQuery.status,
            sort: pageOrQuery.sort,
        };
    }

    return {
        page: pageOrQuery ?? 1,
        size: size ?? 20,
        keyword: undefined,
        status: undefined,
        sort: undefined,
    };
}

export const ProductApi = {
    // check lai
    getAllProducts: async (pageOrQuery: number | ProductListQuery = 1, size?: number): Promise<ApiResponse<PageResponse<Product>>> => {
        const query = normalizeListQuery(pageOrQuery, size);
        try {
            const res = await axiosInstance.get<ApiResponse<PageResponse<Product>>>("/product/list", {
                params: query,
            });

            return res.data;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /product/list failed.`, error);
            throw error;
        }
    },

    getProductDetail: async (id: string): Promise<ApiResponse<ProductDetail>> => {
        try {
            const res = await axiosInstance.get<ApiResponse<ProductDetail>>(`/product/detail/${id}`);
            return res.data;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /product/detail/{id} failed.`, error);
            throw error;
        }
    },

    getProductsByCategory: async (categoryId: number, pageOrQuery: number | ProductListQuery = 1, size?: number): Promise<ApiResponse<PageResponse<Product>>> => {
        const query = normalizeListQuery(pageOrQuery, size);
        try {
            const res = await axiosInstance.get<ApiResponse<PageResponse<Product>>>(`/product/category/${categoryId}`, {
                params: query,
            });

            return res.data;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /product/category/{id} failed.`, error);
            throw error;
        }
    },

    /** GET /product/admin/list — Admin product list with full info */
    getAdminProducts: async (pageOrQuery: number | AdminProductListQuery = 1, size?: number): Promise<ApiResponse<PageResponse<Product>>> => {
        const query = normalizeAdminListQuery(pageOrQuery, size);
        try {
            const res = await axiosInstance.get<ApiResponse<PageResponse<Product>>>("/product/admin/list", {
                params: query,
            });

            return res.data;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /product/admin/list failed.`, error);
            throw error;
        }
    },

    /**
     * Admin detail currently shares public detail route.
     * Backend does not expose /product/admin/detail/{id} in routes/api.php.
     */
    getAdminProductDetail: async (id: number): Promise<ApiResponse<ProductDetail>> => {
        try {
            const res = await axiosInstance.get<ApiResponse<ProductDetail>>(`/product/detail/${id}`);

            return res.data;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /product/detail/{id} failed.`, error);
            throw error;
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
    addVariants: async (productId: number, payload: Record<string, unknown> | Array<Record<string, unknown>>) => {
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
    deleteAttribute: async (id: number, payload?: { attributeIds: number[] }) => {
        try {
            const res = await axiosInstance.delete(`/product/${id}/attribute/delete`, payload ? { data: payload } : undefined);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/{id}/attribute/delete failed.`, error);
            throw error;
        }
    },

    /** DELETE /product/{id}/attributeValue/delete — Delete attribute value */
    deleteAttributeValue: async (id: number, payload?: { attributeValueIds: number[] }) => {
        try {
            const res = await axiosInstance.delete(`/product/${id}/attributeValue/delete`, payload ? { data: payload } : undefined);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /product/{id}/attributeValue/delete failed.`, error);
            throw error;
        }
    },
};
