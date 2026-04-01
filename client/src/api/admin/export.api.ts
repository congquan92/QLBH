import { adminAxiosInstance as axiosInstance } from "@/lib/axios";

const WARNING_PREFIX = "[WARNING][ExportApi]";

export const ExportApi = {
    exportSchedule: async (params: { start_date: string; type: "excel" | "pdf" }): Promise<Blob> => {
        try {
            const res = await axiosInstance.get("/export/schedule", {
                params,
                responseType: "blob",
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /export/schedule failed.`, error);
            throw error;
        }
    },

    exportMySchedule: async (params: { type: "excel" | "pdf" }): Promise<Blob> => {
        try {
            const res = await axiosInstance.get("/export/my-schedule", {
                params,
                responseType: "blob",
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /export/my-schedule failed.`, error);
            throw error;
        }
    },

    exportLateArrivals: async (params: { time_range: "THIS_WEEK" | "LAST_WEEK" | "THIS_MONTH" | "LAST_MONTH" }): Promise<Blob> => {
        try {
            const res = await axiosInstance.get("/export/late-arrivals", {
                params,
                responseType: "blob",
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /export/late-arrivals failed.`, error);
            throw error;
        }
    },

    getLateArrivalsPreview: async (params: { time_range: "THIS_WEEK" | "LAST_WEEK" | "THIS_MONTH" | "LAST_MONTH" }) => {
        try {
            const res = await axiosInstance.get("/export/late-arrivals/preview", { params });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /export/late-arrivals/preview failed.`, error);
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
