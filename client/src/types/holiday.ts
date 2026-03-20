import type { ApiResponse, PageResponse } from "@/types/api";

export interface Holiday {
    id: number;
    name: string;
    holiday_date: string;
    created_at?: string;
    updated_at?: string;
}

export type HolidayPayload = {
    name: string;
    holiday_date: string;
};

export type HolidayListResponse = ApiResponse<PageResponse<Holiday>>;
export type HolidayDetailResponse = ApiResponse<Holiday>;
