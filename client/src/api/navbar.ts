import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Category } from "@/types/navbar";

const WARNING_PREFIX = "[WARNING][NavbarApi]";

export const NavbarApi = {
    getCategoryAll: async (): Promise<ApiResponse<PageResponse<Category>>> => {
        try {
            const res = await axiosInstance.get<ApiResponse<PageResponse<Category>>>("/category/all");
            return res.data;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /category/all failed.`, error);
            throw error;
        }
    },
};
