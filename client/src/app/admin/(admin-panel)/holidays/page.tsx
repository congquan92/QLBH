import { AdminComingSoonPage } from "@/components/feature/admin-coming-soon-page";

export default function HolidaysPage() {
    return <AdminComingSoonPage title="Ngày lễ" description="Thiết lập lịch nghỉ lễ và ảnh hưởng tới lịch làm việc" note="Có thể dùng endpoint `/holidays/*` để quản lý danh sách ngày lễ." />;
}
