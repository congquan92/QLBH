import { axiosInstance } from "@/lib/axios";

const WARNING_PREFIX = "[WARNING][ExportApi]";

export const ExportApi = {
    exportSchedule: async (): Promise<Blob> => {
        try {
            const res = await axiosInstance.get("/export/schedule", {
                responseType: "blob",
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /export/schedule failed.`, error);
            throw error;
        }
    },

    exportMySchedule: async (): Promise<Blob> => {
        try {
            const res = await axiosInstance.get("/export/my-schedule", {
                responseType: "blob",
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /export/my-schedule failed.`, error);
            throw error;
        }
    },

    exportLateArrivals: async (): Promise<Blob> => {
        try {
            const res = await axiosInstance.get("/export/late-arrivals", {
                responseType: "blob",
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /export/late-arrivals failed.`, error);
            throw error;
        }
    },

    downloadBlob: (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },
};
