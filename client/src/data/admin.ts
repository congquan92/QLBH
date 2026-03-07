import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Tag, Truck, Warehouse, Settings, BarChart3, Clock, Calendar, Shield, Briefcase, Star, Gift, Image, Layers } from "lucide-react";
import type { ComponentType } from "react";

export interface AdminMenuItem {
    title: string;
    url: string;
    icon: ComponentType<{ className?: string }>;
    permissions?: string[];
}

export interface AdminMenuGroup {
    title: string;
    icon: ComponentType<{ className?: string }>;
    items: AdminMenuItem[];
}

export interface AdminMenuSection {
    label: string;
    groups: AdminMenuGroup[];
}

export const adminDashboardItem: AdminMenuItem = {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    permissions: ["VIEW_ORDERS_ADMIN", "VIEW_USERS", "VIEW_PRODUCTS_ADMIN"],
};

export const adminMenuSections: AdminMenuSection[] = [
    {
        label: "Quản lý cửa hàng",
        groups: [
            {
                title: "Sản phẩm",
                icon: Package,
                items: [
                    { title: "Danh sách sản phẩm", url: "/admin/products", icon: Package, permissions: ["VIEW_PRODUCTS_ADMIN"] },
                    { title: "Danh mục", url: "/admin/categories", icon: Layers },
                    { title: "Thuộc tính", url: "/admin/attributes", icon: Tag },
                    { title: "Nhà cung cấp", url: "/admin/suppliers", icon: Truck, permissions: ["VIEW_SUPPLIERS"] },
                    { title: "Nhập hàng", url: "/admin/imports", icon: Warehouse, permissions: ["VIEW_IMPORT_PRODUCT"] },
                ],
            },
            {
                title: "Đơn hàng",
                icon: ShoppingCart,
                items: [
                    { title: "Danh sách đơn hàng", url: "/admin/orders", icon: ShoppingCart, permissions: ["VIEW_ORDERS_ADMIN"] },
                    { title: "Giỏ hàng", url: "/admin/carts", icon: ShoppingCart },
                ],
            },
            {
                title: "Khách hàng",
                icon: Users,
                items: [
                    { title: "Danh sách khách hàng", url: "/admin/customers", icon: Users, permissions: ["VIEW_USERS"] },
                    { title: "Địa chỉ", url: "/admin/addresses", icon: Users },
                    { title: "Xếp hạng", url: "/admin/user-ranks", icon: Star },
                    { title: "Đánh giá", url: "/admin/reviews", icon: Star, permissions: ["VIEW_REVIEWS_ADMIN"] },
                ],
            },
            {
                title: "Marketing",
                icon: BarChart3,
                items: [
                    { title: "Voucher", url: "/admin/vouchers", icon: Gift, permissions: ["VIEW_ALL_VOUCHER"] },
                    { title: "Bài viết", url: "/admin/posts", icon: FileText },
                    { title: "Hình ảnh", url: "/admin/images", icon: Image },
                ],
            },
        ],
    },
    {
        label: "Quản lý nhân sự",
        groups: [
            {
                title: "Quản lý nhân sự",
                icon: Briefcase,
                items: [
                    { title: "Nhân viên", url: "/admin/employees", icon: Users, permissions: ["VIEW_USERS"] },
                    { title: "Chức vụ", url: "/admin/positions", icon: Briefcase },
                    { title: "Chấm công", url: "/admin/attendance", icon: Clock },
                    { title: "Ca làm việc", url: "/admin/shifts", icon: Calendar },
                    { title: "Lịch sử công việc", url: "/admin/job-history", icon: FileText, permissions: ["VIEW_USERS"] },
                    { title: "Ngày lễ", url: "/admin/holidays", icon: Calendar },
                    { title: "Lương", url: "/admin/salary", icon: BarChart3 },
                ],
            },
        ],
    },
    {
        label: "Hệ thống",
        groups: [
            {
                title: "Hệ thống",
                icon: Settings,
                items: [
                    { title: "Vai trò & Quyền", url: "/admin/roles", icon: Shield, permissions: ["VIEW_ROLES"] },
                    { title: "Nhóm quyền", url: "/admin/group-permissions", icon: Shield, permissions: ["VIEW_PERMISSION_GROUPS"] },
                    { title: "Cài đặt", url: "/admin/settings", icon: Settings },
                ],
            },
        ],
    },
];
