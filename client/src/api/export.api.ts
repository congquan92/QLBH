import { axiosInstance } from "@/lib/axios";

const WARNING_PREFIX = "[WARNING][ExportApi]";

export const ExportApi = {
    /**
     * Export schedule data
     * GET /export/schedule
     * Returns file blob for download
     */
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

    /**
     * Export my schedule data
     * GET /export/my-schedule
     * Returns file blob for download
     */
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

    /**
     * Export late arrivals report
     * GET /export/export/late-arrivals
     * Returns file blob for download
     */
    exportLateArrivals: async (): Promise<Blob> => {
        try {
            const res = await axiosInstance.get("/export/export/late-arrivals", {
                responseType: "blob",
            });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /export/export/late-arrivals failed.`, error);
            throw error;
        }
    },

    /**
     * Helper: trigger browser download from blob
     */
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
