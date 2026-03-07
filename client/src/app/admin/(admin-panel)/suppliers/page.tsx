import { AdminComingSoonPage } from "@/components/feature/admin-coming-soon-page";

export default function SuppliersPage() {
    return <AdminComingSoonPage title="Nhà cung cấp" description="Quản lý hồ sơ và trạng thái nhà cung cấp" requiredPermissions={["VIEW_SUPPLIERS"]} note="Có thể mở rộng CRUD bằng các endpoint `/suppliers/*` đã có ở backend." />;
}
