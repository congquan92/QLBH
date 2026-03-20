import type { ApiResponse } from "@/types/api";

export interface JobHistoryRecord {
    id: number;
    position_id?: number;
    position_name?: string;
    salary?: string;
    employment_type?: string;
    effective_date?: string;
    end_date?: string;
    status?: string;
    [key: string]: unknown;
}

export interface CareerPath {
    user_id: number;
    full_name: string;
    email?: string;
    seniority?: string;
    current_position?: {
        id?: number;
        name?: string;
        salary?: string;
        salary_type?: string;
    };
    career_history?: JobHistoryRecord[];
    [key: string]: unknown;
}

export type JobHistoryRecordResponse = ApiResponse<JobHistoryRecord>;
export type CareerPathResponse = ApiResponse<CareerPath>;
