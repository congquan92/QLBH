import type { ApiResponse } from "@/types/api";

export interface JobHistoryRecord {
    id: number;
    user_id: number;
    old_position_id?: number;
    new_position_id: number;
    old_position_name?: string;
    new_position_name: string;
    promotion_date: string;
    reason?: string;
    created_at?: string;
    [key: string]: unknown;
}

export interface CareerPath {
    user_id: number;
    full_name: string;
    current_position: string;
    history: JobHistoryRecord[];
}

export type JobHistoryRecordResponse = ApiResponse<JobHistoryRecord>;
export type CareerPathResponse = ApiResponse<CareerPath>;
