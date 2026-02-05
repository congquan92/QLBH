import { axiosInstance } from "../lib/axios";

export const AuthApi = {
    login: async (username: string, password: string) => {
        const res = await axiosInstance.post("/auth/login", { username, password });
        return res;
    },

    logout: async (token: string) => {
        const res = await axiosInstance.post("/auth/logout", { token });
        return res;
    },
};
