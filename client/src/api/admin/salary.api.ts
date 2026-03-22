import { adminAxiosInstance as axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { SalaryBulkItem, SalaryCalculation } from "@/types/salary";

export const SalaryApi = {
    calculateSalary: async (userId: number, month: number, year: number): Promise<ApiResponse<SalaryCalculation>> => {
        try {
            const res = await axiosInstance.get(`/salaries/calculate/${userId}`, {
                params: { month, year },
            });
            return res.data;
        } catch (error) {
            console.warn("[SalaryApi] /salaries/calculate/{userId} failed", error);
            throw error;
        }
    },

    calculateMySalary: async (month: number, year: number): Promise<ApiResponse<SalaryCalculation>> => {
        try {
            const res = await axiosInstance.get("/salaries/calculate/me", {
                params: { month, year },
            });
            return res.data;
        } catch (error) {
            console.warn("[SalaryApi] /salaries/calculate/me failed", error);
            throw error;
        }
    },

    /** Tính lương tất cả nhân viên trong 1 tháng */
    calculateAllSalaries: async (month: number, year: number): Promise<ApiResponse<SalaryBulkItem[]>> => {
        try {
            const res = await axiosInstance.get("/salaries/all", {
                params: { month, year },
            });
            return res.data;
        } catch (error) {
            console.warn("[SalaryApi] /salaries/all failed", error);
            throw error;
        }
    },
};
