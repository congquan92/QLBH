import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { SalaryCalculation } from "@/types/salary";

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
            // Assuming there's an endpoint for current user
            const res = await axiosInstance.get("/salaries/calculate/me", {
                params: { month, year },
            });
            return res.data;
        } catch (error) {
            console.warn("[SalaryApi] /salaries/calculate/me failed", error);
            throw error;
        }
    },
};
