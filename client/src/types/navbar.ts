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
    status: number;
    message: string;
    data: {
        data: Category[];
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalElements: number;
    };
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
