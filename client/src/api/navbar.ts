import { axiosInstance } from "../lib/axios";

export const NavbarApi = {
    getCategoryAll: async () => {
        const res = await axiosInstance.get("/category/all");
        return res;
    },
};
