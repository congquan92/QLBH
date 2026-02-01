import { axiosInstance } from "../lib/axios";

export const ProductApi = {
    getAllProducts: async (page = 1, pageSize = 10) => {
        const res = await axiosInstance.get("/product/list", {
            params: { page, pageSize },
        });
        return res;
    },
    getProductDetail: async (id: string) => {
        const res = await axiosInstance.get(`/product/detail/${id}`);
        return res;
    },
};
