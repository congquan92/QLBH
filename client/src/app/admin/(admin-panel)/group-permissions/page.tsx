"use client";

import { RbacApi } from "@/api/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, KeyRound, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { RbacGroupPermission } from "@/types/rbac";

export default function GroupPermissionsPage() {
    const [groups, setGroups] = useState<RbacGroupPermission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchGroups() {
            setIsLoading(true);
            const response = await RbacApi.getGroupPermissions({ page: 1, size: 50, sort: "id:desc" });
            if (!mounted) return;
            setGroups(response.data.data);
            setIsLoading(false);
        }

        void fetchGroups();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <AdminPageShell title="Nhóm quyền" description="Quản lý nhóm permission theo trang/chức năng" requiredPermissions={["VIEW_PERMISSION_GROUPS"]}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle>Danh sách nhóm quyền</CardTitle>
                            <CardDescription>Tổng số nhóm: {groups.length}</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="Tìm nhóm quyền..." />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải nhóm quyền...
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {groups.map((group) => (
                                <div key={group.id} className="rounded-md border p-3">
                                    <div className="flex items-center gap-2 font-medium">
                                        <KeyRound className="h-4 w-4" />
                                        {group.name}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{group.description || "Không có mô tả"}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        URL: {group.url || "-"} | Quyền lẻ: {group.permissions?.length ?? 0}
                                    </p>
                                </div>
                            ))}
                            {groups.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu nhóm quyền.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
