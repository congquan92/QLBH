"use client";

import { RbacApi } from "@/api/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Shield, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { RbacRole } from "@/types/rbac";

export default function RolesPage() {
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchRoles() {
            setIsLoading(true);
            const response = await RbacApi.getRoles({ page: 1, size: 50, sort: "id:desc" });
            if (!mounted) return;
            setRoles(response.data.data);
            setIsLoading(false);
        }

        void fetchRoles();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <AdminPageShell title="Vai trò & Quyền" description="Quản lý vai trò và phạm vi quyền của từng nhóm người dùng" requiredPermissions={["VIEW_ROLES"]}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle>Danh sách vai trò</CardTitle>
                            <CardDescription>Tổng số vai trò: {roles.length}</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="Tìm kiếm vai trò..." />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải dữ liệu vai trò...
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {roles.map((role) => (
                                <div key={role.id} className="rounded-md border p-3">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Shield className="h-4 w-4" />
                                        {role.name}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{role.description || "Không có mô tả"}</p>
                                    <p className="text-xs text-muted-foreground mt-2">{Array.isArray(role.page) ? role.page.length : 0} trang được gán</p>
                                </div>
                            ))}
                            {roles.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu vai trò.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
