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
