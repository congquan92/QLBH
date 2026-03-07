import { axiosInstance } from "@/lib/axios";

const WARNING_PREFIX = "[WARNING][FileUploadApi]";

export const FileUploadApi = {
    /**
     * Upload file
     * POST /file/upload (multipart/form-data)
     */
    upload: async (file: File): Promise<{ url: string; [key: string]: unknown }> => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await axiosInstance.post("/file/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /file/upload failed.`, error);
            throw error;
        }
    },

    /**
     * Delete file
     * DELETE /file/delete
     */
    deleteFile: async (url: string) => {
        try {
            const res = await axiosInstance.delete("/file/delete", { data: { url } });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /file/delete failed.`, error);
            throw error;
        }
    },
};
