import { AdminComingSoonPage } from "@/components/feature/admin-coming-soon-page";

export default function ImportsPage() {
    return <AdminComingSoonPage title="Nhập hàng" description="Quản lý phiếu nhập và xác nhận nhập kho" requiredPermissions={["VIEW_IMPORT_PRODUCT"]} note="Module có thể nối trực tiếp với endpoint `/import-products/*` trong backend." />;
}
