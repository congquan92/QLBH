import { NavigationItem } from "@/types/navbar";

export const NAVBAR_DATA: { items: NavigationItem[] } = {
    items: [
        { label: "Sản phẩm", href: "/san-pham" },
        {
            label: "Áo nam",
            href: "/ao-nam",
            hasDropdown: true,
            dropdownItems: [
                { label: "Áo Polo", href: "/ao-nam/ao-polo" },
                { label: "Áo Sơ mi", href: "/ao-nam/ao-so-mi" },
                { label: "Áo Thun", href: "/ao-nam/ao-thun" },
                { label: "Áo Khoác", href: "/ao-nam/ao-khoac" },
            ],
        },
        { label: "Quần nam", href: "/quan-nam" },
        { label: "Phụ kiện", href: "/phu-kien" },
        { label: "Hệ thống cửa hàng", href: "/he-thong-cua-hang" },
        {
            label: "CẢNH BÁO LỪA ĐẢO",
            href: "/canh-bao",
            badge: "Hot",
            isWarning: true,
        },
    ],
};
