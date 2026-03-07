"use client";

import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface AdminComingSoonPageProps {
    title: string;
    description: string;
    requiredPermissions?: string[];
    note?: string;
}

export function AdminComingSoonPage({ title, description, requiredPermissions, note }: AdminComingSoonPageProps) {
    return (
        <AdminPageShell title={title} description={description} requiredPermissions={requiredPermissions}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5" />
                        Trang đang được đồng bộ
                    </CardTitle>
                    <CardDescription>Cơ chế phân quyền đã được áp dụng cho route này. Bạn có thể mở rộng CRUD theo API backend ngay tại đây.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{note || "Phần nội dung chi tiết sẽ được bổ sung theo module nghiệp vụ."}</CardContent>
            </Card>
        </AdminPageShell>
    );
}
