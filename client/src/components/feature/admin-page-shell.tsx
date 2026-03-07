"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";

interface AdminPageShellProps {
    title: string;
    description: string;
    requiredPermissions?: string[];
    children?: React.ReactNode;
}

export function AdminPageShell({ title, description, requiredPermissions, children }: AdminPageShellProps) {
    const pathname = usePathname();
    const { hasAnyPermission, canAccessPath } = useAdminAuth();

    const canByPath = pathname ? canAccessPath(pathname) : true;
    const canByPermission = !requiredPermissions || requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions);
    const isAllowed = canByPath && canByPermission;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            {!isAllowed ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-5 w-5" />
                            Không có quyền truy cập
                        </CardTitle>
                        <CardDescription>Trang này yêu cầu quyền phù hợp với cấu hình vai trò backend.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Vui lòng liên hệ quản trị viên để được cấp quyền.
                    </CardContent>
                </Card>
            ) : (
                children
            )}
        </div>
    );
}
