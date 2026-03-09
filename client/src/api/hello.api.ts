import { axiosInstance } from "@/lib/axios";

export const HelloApi = {
    // WARNING: Backend routes do not expose `/hello` in `server/routes/api.php`.
    getMessage: async (): Promise<{ message: string }> => {
        try {
            const res = await axiosInstance.get<{ message: string }>("/hello");
            return res.data;
        } catch (error) {
            console.warn("[WARNING][HelloApi] Endpoint /hello is not defined in backend routes.", error);
            return {
                message: "Endpoint /hello is not available on backend",
            };
        }
    },
};

// Backward-compatible alias.
export const helloApi = HelloApi;
