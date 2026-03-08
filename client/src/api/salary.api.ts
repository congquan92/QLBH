import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { SalaryCalculation } from "@/types/salary";

function toErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return "Đã xảy ra lỗi";
}

export const SalaryApi = {
    /**
     * Calculate monthly salary for a user (Admin)
     * GET /salaries/calculate/{userId}?month=X&year=Y
     */
    calculateSalary: async (userId: number, month: number, year: number): Promise<ApiResponse<SalaryCalculation>> => {
        try {
            const res = await axiosInstance.get(`/salaries/calculate/${userId}`, {
                params: { month, year },
            });
            return res.data;
        } catch (error) {
            console.warn("[SalaryApi] /salaries/calculate/{userId} failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Calculate my monthly salary
     * Could be endpoint like /salaries/calculate/me if available
     */
    calculateMySalary: async (month: number, year: number): Promise<ApiResponse<SalaryCalculation>> => {
        try {
            // Assuming there's an endpoint for current user
            const res = await axiosInstance.get("/salaries/calculate/me", {
                params: { month, year },
            });
            return res.data;
        } catch (error) {
            console.warn("[SalaryApi] /salaries/calculate/me failed", error);
            throw new Error(toErrorMessage(error));
        }
    },
};
