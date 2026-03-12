import { axiosInstance } from "@/lib/axios";

export const HelloApi = {
    //test
    getMessage: async (): Promise<{ message: string }> => {
        try {
            const res = await axiosInstance.get("/hello");
            return res.data;
        } catch (error) {
            console.warn("[WARNING][HelloApi] Endpoint /hello is not defined in backend routes.", error);
            return {
                message: "Endpoint /hello is not available on backend",
            };
        }
    },
};
