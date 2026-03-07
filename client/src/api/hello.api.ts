import { axiosInstance } from "@/lib/axios";

export const helloApi = {
    // WARNING: Backend routes do not expose `/hello` in `server/routes/api.php`.
    sayHello: async () => {
        try {
            return await axiosInstance.get("/hello");
        } catch (error) {
            console.warn("[WARNING][helloApi] Endpoint /hello is not defined in backend routes.", error);
            return {
                data: {
                    status: 404,
                    message: "Endpoint /hello is not available on backend",
                },
            };
        }
    },
};
