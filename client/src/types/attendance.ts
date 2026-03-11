export interface AttendanceRecord {
    id: number;
    date: string;
    check_in: string;
    check_out?: string;
    status: "PRESENT" | "LATE" | "ABSENT";
    total_hours?: number;
    shift_name?: string;
    [key: string]: unknown;
}

export interface AttendanceHistory {
    data: AttendanceRecord[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}
