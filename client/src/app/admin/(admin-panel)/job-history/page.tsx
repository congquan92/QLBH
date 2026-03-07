import { AdminComingSoonPage } from "@/components/feature/admin-coming-soon-page";

export default function JobHistoryPage() {
    return <AdminComingSoonPage title="Lịch sử công việc" description="Theo dõi thăng chức và lịch sử vị trí nhân sự" requiredPermissions={["VIEW_USERS"]} note="Phù hợp để hiển thị timeline theo user và filter theo kỳ đánh giá." />;
}
