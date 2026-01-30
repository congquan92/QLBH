import { axiosInstance } from "../lib/axios";

export const ProductApi = {
    getAllProducts: async () => {
        try {
            const res = await axiosInstance.get("/product/list");
            return res;
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error;
        }
    },
    getProductDetail: async (id: string) => {
        try {
            const res = await axiosInstance.get(`/product/detail/${id}`);
            return res;
        } catch (error) {
            console.error("Error fetching product detail:", error);
            throw error;
        }
    },
};
