import { AdminComingSoonPage } from "@/components/feature/admin-coming-soon-page";

export default function EmployeesPage() {
    return <AdminComingSoonPage title="Nhân viên" description="Quản lý hồ sơ nhân viên và trạng thái làm việc" requiredPermissions={["VIEW_USERS"]} note="Có thể tái sử dụng nền tảng danh sách user hiện tại để mở rộng module nhân sự." />;
}
