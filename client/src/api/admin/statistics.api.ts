import { adminAxiosInstance as axiosInstance } from "@/lib/axios";
import type {
    ActiveUserStats,
    CategoryStats,
    MonthlyRevenue,
    OrderStats,
    OverviewStats,
    ProductExportStats,
    SalaryStats,
    StatsFilterParams,
    TopCustomerStats,
    TopProduct,
    WorkforceStats,
} from "@/types/statistics";

type ReportSection = "overview" | "workforce" | "salary" | "product-export";

export const StatisticsApi = {
    getActiveUsers: async (period: number = 1): Promise<{ data: ActiveUserStats | null }> => {
        try {
            const res = await axiosInstance.get("/statistical/users", { params: { period } });
            return { data: res.data ?? null };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/users failed", error);
            throw error;
        }
    },

    getOrders: async (period: number = 1): Promise<{ data: OrderStats | null }> => {
        try {
            const res = await axiosInstance.get("/statistical/orders", { params: { period } });
            return { data: res.data ?? null };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/orders failed", error);
            throw error;
        }
    },

    getRevenue12Months: async (): Promise<{ data: MonthlyRevenue[] }> => {
        try {
            const res = await axiosInstance.get("/statistical/revenue-12months");
            const raw = res.data as { year: number; revenue: (number | string)[]; cost: (number | string)[]; profit: (number | string)[] };
            const months: MonthlyRevenue[] = Array.from({ length: 12 }, (_, i) => ({
                month: `${raw.year}-${String(i + 1).padStart(2, "0")}`,
                revenue: Number(raw.revenue?.[i] || 0),
                cost: Number(raw.cost?.[i] || 0),
                profit: Number(raw.profit?.[i] || 0),
            }));
            return { data: months };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/revenue-12months failed", error);
            throw error;
        }
    },

    getTopProducts: async (period: number = 1, top: number = 5): Promise<{ data: TopProduct[] }> => {
        try {
            const res = await axiosInstance.get("/statistical/top-products", { params: { period, top } });
            return { data: Array.isArray(res.data) ? res.data : [] };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/top-products failed", error);
            throw error;
        }
    },

    getCategories: async (period: number = 1): Promise<{ data: CategoryStats[] }> => {
        try {
            const res = await axiosInstance.get("/statistical/categories", { params: { period } });
            const raw = res.data as { period: number; data: CategoryStats[] };
            return { data: Array.isArray(raw?.data) ? raw.data : [] };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/categories failed", error);
            throw error;
        }
    },

    getTopCustomers: async (period: number = 1, top: number = 5): Promise<{ data: TopCustomerStats[] }> => {
        try {
            const res = await axiosInstance.get("/statistical/top-customers", { params: { period, top } });
            return { data: Array.isArray(res.data) ? res.data : [] };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/top-customers failed", error);
            throw error;
        }
    },

    getOverview: async (params: StatsFilterParams): Promise<{ data: OverviewStats | null }> => {
        try {
            const res = await axiosInstance.get("/statistical/overview", { params });
            return { data: (res.data ?? null) as OverviewStats | null };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/overview failed", error);
            throw error;
        }
    },

    getWorkforce: async (params: StatsFilterParams): Promise<{ data: WorkforceStats | null }> => {
        try {
            const res = await axiosInstance.get("/statistical/workforce", { params });
            return { data: (res.data ?? null) as WorkforceStats | null };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/workforce failed", error);
            throw error;
        }
    },

    getSalaryStats: async (params: StatsFilterParams): Promise<{ data: SalaryStats | null }> => {
        try {
            const res = await axiosInstance.get("/statistical/salary", { params });
            return { data: (res.data ?? null) as SalaryStats | null };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/salary failed", error);
            throw error;
        }
    },

    getProductExportStats: async (params: StatsFilterParams): Promise<{ data: ProductExportStats | null }> => {
        try {
            const res = await axiosInstance.get("/statistical/product-exports", { params });
            return { data: (res.data ?? null) as ProductExportStats | null };
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/product-exports failed", error);
            throw error;
        }
    },

    exportReport: async (params: StatsFilterParams & { section: ReportSection; type: "excel" | "pdf" }): Promise<Blob> => {
        try {
            const res = await axiosInstance.get("/statistical/export-report", {
                params,
                responseType: "blob",
            });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/export-report failed", error);
            throw error;
        }
    },
};
