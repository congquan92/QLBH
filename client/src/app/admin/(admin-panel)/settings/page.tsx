import { AdminComingSoonPage } from "@/components/feature/admin-coming-soon-page";

export default function SettingsPage() {
    return <AdminComingSoonPage title="Cài đặt" description="Cấu hình hệ thống quản trị và thông số vận hành" note="Trang này đã áp dụng guard route theo role/page từ backend, có thể mở rộng từng nhóm setting." />;
}
