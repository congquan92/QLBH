import { axiosInstance } from "@/lib/axios";

const WARNING_PREFIX = "[WARNING][FirebaseApi]";

export const FirebaseApi = {
    test: async (payload?: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/firebase/test", payload ?? {});
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /firebase/test failed.`, error);
            throw error;
        }
    },
};
