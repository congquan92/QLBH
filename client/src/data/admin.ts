import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Tag, Truck, Warehouse, Settings, ChevronRight, LogOut, User2, BarChart3, Clock, Calendar, Shield, Briefcase, Star, Gift, Image, Layers } from "lucide-react";

// Menu items data
export const menuData = {
    dashboard: {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    products: {
        title: "Sản phẩm",
        icon: Package,
        items: [
            { title: "Danh sách sản phẩm", url: "/admin/products", icon: Package },
            { title: "Danh mục", url: "/admin/categories", icon: Layers },
            { title: "Thuộc tính", url: "/admin/attributes", icon: Tag },
            { title: "Nhà cung cấp", url: "/admin/suppliers", icon: Truck },
            { title: "Nhập hàng", url: "/admin/imports", icon: Warehouse },
        ],
    },
    orders: {
        title: "Đơn hàng",
        icon: ShoppingCart,
        items: [
            { title: "Danh sách đơn hàng", url: "/admin/orders", icon: ShoppingCart },
            { title: "Giỏ hàng", url: "/admin/carts", icon: ShoppingCart },
        ],
    },
    customers: {
        title: "Khách hàng",
        icon: Users,
        items: [
            { title: "Danh sách khách hàng", url: "/admin/customers", icon: Users },
            { title: "Địa chỉ", url: "/admin/addresses", icon: Users },
            { title: "Xếp hạng", url: "/admin/user-ranks", icon: Star },
            { title: "Đánh giá", url: "/admin/reviews", icon: Star },
        ],
    },
    marketing: {
        title: "Marketing",
        icon: BarChart3,
        items: [
            { title: "Voucher", url: "/admin/vouchers", icon: Gift },
            { title: "Bài viết", url: "/admin/posts", icon: FileText },
            { title: "Hình ảnh", url: "/admin/images", icon: Image },
        ],
    },
    hrm: {
        title: "Quản lý nhân sự",
        icon: Briefcase,
        items: [
            { title: "Nhân viên", url: "/admin/employees", icon: Users },
            { title: "Chức vụ", url: "/admin/positions", icon: Briefcase },
            { title: "Chấm công", url: "/admin/attendance", icon: Clock },
            { title: "Ca làm việc", url: "/admin/shifts", icon: Calendar },
            { title: "Lịch sử công việc", url: "/admin/job-history", icon: FileText },
            { title: "Ngày lễ", url: "/admin/holidays", icon: Calendar },
            { title: "Lương", url: "/admin/salary", icon: BarChart3 },
        ],
    },
    system: {
        title: "Hệ thống",
        icon: Settings,
        items: [
            { title: "Vai trò & Quyền", url: "/admin/roles", icon: Shield },
            { title: "Nhóm quyền", url: "/admin/group-permissions", icon: Shield },
            { title: "Cài đặt", url: "/admin/settings", icon: Settings },
        ],
    },
};
