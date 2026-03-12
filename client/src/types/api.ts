export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
}

export interface ApiContractWarning {
    code: string;
    message: string;
}
