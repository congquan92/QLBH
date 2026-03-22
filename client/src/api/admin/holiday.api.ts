import { adminAxiosInstance as apiConfig } from "@/lib/axios";
import type { HolidayDetailResponse, HolidayListResponse, HolidayPayload } from "@/types/holiday";


export const HolidayApi = {
    /** Lấy danh sách ngày nghỉ lễ */
    getHolidays: async (page = 1, size = 10, keyword?: string): Promise<HolidayListResponse> => {
        return apiConfig.get(`/api/holidays`, {
            params: { page, size, keyword },
        });
    },

    /** Thêm mới ngày lễ */
    createHoliday: async (data: HolidayPayload): Promise<HolidayDetailResponse> => {
        return apiConfig.post(`/api/holidays`, data);
    },

    /** Cập nhật ngày lễ */
    updateHoliday: async (id: number, data: HolidayPayload): Promise<HolidayDetailResponse> => {
        return apiConfig.put(`/api/holidays/${id}`, data);
    },

    /** Xóa ngày lễ */
    deleteHoliday: async (id: number): Promise<unknown> => {
        return apiConfig.delete(`/api/holidays/${id}`);
    },
};
