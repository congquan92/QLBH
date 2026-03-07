"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { Loader2, ShieldX } from "lucide-react";

export function AdminRouteGate({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated } = useAdminAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang kiểm tra quyền truy cập...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
                <ShieldX className="h-5 w-5" />
                Đang chuyển hướng đến trang đăng nhập...
            </div>
        );
    }

    return <>{children}</>;
}
