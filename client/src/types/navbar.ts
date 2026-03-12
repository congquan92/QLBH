import type { ApiResponse, PageResponse } from "@/types/api";

// API Response Types
export interface CategoryChild {
    id: number;
    name: string;
    status: string;
    createAt: string;
    childCategory: CategoryChild[];
}

export interface Category {
    id: number;
    name: string;
    status: string;
    createAt: string;
    childCategory: CategoryChild[];
}

export interface CategoryApiResponse {
    status: ApiResponse<PageResponse<Category>>["status"];
    message: ApiResponse<PageResponse<Category>>["message"];
    data: PageResponse<Category>;
}

// UI Types for Navbar
export interface DropdownItem {
    label: string;
    href: string;
}

export interface NavigationItem {
    label: string;
    href: string;
    badge?: string;
    isWarning?: boolean;
    hasDropdown?: boolean;
    dropdownItems?: DropdownItem[];
}
