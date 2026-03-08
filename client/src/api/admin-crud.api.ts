import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Holiday, ImportProduct, Position, SalaryConfig, SalaryScale, Shift, Supplier, UserRank } from "@/types/admin-crud";

const WARNING_PREFIX = "[WARNING][AdminCrudApi]";

function isPage<T>(value: unknown): value is PageResponse<T> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<T>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function normalizeList<T>(payload: unknown, message: string): ApiResponse<PageResponse<T>> {
    if (payload && typeof payload === "object") {
        const wrapped = payload as ApiResponse<PageResponse<T>>;
        if (isPage<T>(wrapped.data)) {
            return wrapped;
        }
        if (isPage<T>(payload)) {
            return {
                status: 200,
                message,
                data: payload as PageResponse<T>,
            };
        }
    }

    return {
        status: 200,
        message,
        data: {
            data: [],
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
            totalElements: 0,
        },
    };
}

function toErrorMessage(error: unknown) {
    if (typeof error === "object" && error && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        return response?.data?.message ?? "Thao tác thất bại";
    }
    return "Thao tác thất bại";
}

export const AdminCrudApi = {
    getSuppliers: async (query?: { keyword?: string; sort?: string; status?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/suppliers", { params: query });
            return normalizeList<Supplier>(res.data, "Supplier list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /suppliers [GET] failed.`, error);
            return normalizeList<Supplier>(null, "Supplier list fallback");
        }
    },

    createSupplier: async (payload: Record<string, unknown>) => {
        await axiosInstance.post("/suppliers", payload);
    },

    getSupplierDetail: async (id: number) => {
        const res = await axiosInstance.get(`/suppliers/${id}`);
        return res.data;
    },

    updateSupplier: async (id: number, payload: Record<string, unknown>) => {
        await axiosInstance.put(`/suppliers/${id}`, payload);
    },

    deleteSupplier: async (id: number) => {
        await axiosInstance.delete(`/suppliers/${id}`);
    },

    getPositions: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/positions", { params: query });
            return normalizeList<Position>(res.data, "Position list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /positions [GET] failed.`, error);
            return normalizeList<Position>(null, "Position list fallback");
        }
    },

    createPosition: async (payload: Record<string, unknown>) => {
        await axiosInstance.post("/positions", payload);
    },

    updatePosition: async (id: number, payload: Record<string, unknown>) => {
        await axiosInstance.put(`/positions/${id}`, payload);
    },

    deletePosition: async (id: number) => {
        await axiosInstance.delete(`/positions/${id}`);
    },

    getPositionEmployees: async (id: number, query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        const res = await axiosInstance.get(`/positions/${id}/employees`, { params: query });
        return res.data;
    },

    getShifts: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/shifts/list", { params: query });
            return normalizeList<Shift>(res.data, "Shift list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /shifts/list [GET] failed.`, error);
            return normalizeList<Shift>(null, "Shift list fallback");
        }
    },

    createShift: async (payload: Record<string, unknown>) => {
        await axiosInstance.post("/shifts", payload);
    },

    updateShift: async (id: number, payload: Record<string, unknown>) => {
        await axiosInstance.put(`/shifts/${id}`, payload);
    },

    deleteShift: async (id: number) => {
        await axiosInstance.delete(`/shifts/${id}`);
    },

    getHolidays: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/holidays/list", { params: query });
            return normalizeList<Holiday>(res.data, "Holiday list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /holidays/list [GET] failed.`, error);
            return normalizeList<Holiday>(null, "Holiday list fallback");
        }
    },

    createHoliday: async (payload: Record<string, unknown>) => {
        await axiosInstance.post("/holidays", payload);
    },

    updateHoliday: async (id: number, payload: Record<string, unknown>) => {
        await axiosInstance.put(`/holidays/${id}`, payload);
    },

    deleteHoliday: async (id: number) => {
        await axiosInstance.delete(`/holidays/${id}`);
    },

    getSalaryConfigs: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/salary-configs/list", { params: query });
            return normalizeList<SalaryConfig>(res.data, "Salary config list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /salary-configs/list [GET] failed.`, error);
            return normalizeList<SalaryConfig>(null, "Salary config list fallback");
        }
    },

    createSalaryConfig: async (payload: { configs: Array<Record<string, unknown>> }) => {
        await axiosInstance.post("/salary-configs", payload);
    },

    updateSalaryConfig: async (id: number, payload: Record<string, unknown>) => {
        await axiosInstance.put(`/salary-configs/${id}`, payload);
    },

    deleteSalaryConfig: async (id: number) => {
        await axiosInstance.delete(`/salary-configs/${id}`);
    },

    getSalaryScales: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/salary-scales/list", { params: query });
            return normalizeList<SalaryScale>(res.data, "Salary scale list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /salary-scales/list [GET] failed.`, error);
            return normalizeList<SalaryScale>(null, "Salary scale list fallback");
        }
    },

    createSalaryScale: async (payload: Record<string, unknown>) => {
        await axiosInstance.post("/salary-scales", payload);
    },

    updateSalaryScale: async (id: number, payload: Record<string, unknown>) => {
        await axiosInstance.put(`/salary-scales/${id}`, payload);
    },

    deleteSalaryScale: async (id: number) => {
        await axiosInstance.delete(`/salary-scales/${id}`);
    },

    getUserRanks: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/user-rank/list", { params: query });
            return normalizeList<UserRank>(res.data, "User rank list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user-rank/list [GET] failed.`, error);
            return normalizeList<UserRank>(null, "User rank list fallback");
        }
    },

    createUserRank: async (payload: Record<string, unknown>) => {
        await axiosInstance.post("/user-rank/add", payload);
    },

    updateUserRank: async (id: number, payload: Record<string, unknown>) => {
        await axiosInstance.put(`/user-rank/${id}/update`, payload);
    },

    getImportProducts: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        try {
            const res = await axiosInstance.get("/import-products", { params: query });
            return normalizeList<ImportProduct>(res.data, "Import product list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /import-products [GET] failed.`, error);
            return normalizeList<ImportProduct>(null, "Import product list fallback");
        }
    },

    createImportProduct: async (payload: Record<string, unknown>) => {
        await axiosInstance.post("/import-products", payload);
    },

    confirmImportProduct: async (id: number) => {
        await axiosInstance.post(`/import-products/${id}/confirm`);
    },

    cancelImportProduct: async (id: number) => {
        await axiosInstance.post(`/import-products/${id}/cancel`);
    },

    getImportProductDetail: async (id: number) => {
        const res = await axiosInstance.get(`/import-products/${id}`);
        return res.data;
    },

    updateImportQuantities: async (id: number, payload: { items: Array<{ importDetailId: number; quantity: number }> }) => {
        await axiosInstance.put(`/import-products/${id}/quantities`, payload);
    },

    deleteImportProduct: async (id: number) => {
        await axiosInstance.delete(`/import-products/${id}`);
    },

    toErrorMessage,
};
