import { adminAxiosInstance as axiosInstance } from "@/lib/axios";

const WARNING_PREFIX = "[WARNING][FileUploadApi]";

export const FileUploadApi = {
    upload: async (file: File): Promise<{ url: string; [key: string]: unknown }> => {
        try {
            const formData = new FormData();
            formData.append("files[]", file);
            const res = await axiosInstance.post("/file/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const payload = res.data as { data?: Array<{ url?: string; [key: string]: unknown }> };
            const firstUpload = payload.data?.[0];

            if (!firstUpload?.url) {
                throw new Error("Upload thành công nhưng server không trả về URL.");
            }

            return {
                ...firstUpload,
                url: firstUpload.url,
            };
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /file/upload failed.`, error);
            throw error;
        }
    },

    deleteFile: async (url: string) => {
        try {
            const res = await axiosInstance.delete("/file/delete", { data: { urls: [url] } });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /file/delete failed.`, error);
            throw error;
        }
    },
};
