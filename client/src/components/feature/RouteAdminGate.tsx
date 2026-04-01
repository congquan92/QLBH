"use client";

import { AdminAuthUtil, useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";
import { useEffect } from "react";

export function AdminRouteGate({ children }: { children: React.ReactNode }) {
    const { session, isLoading, isAuthenticated, canAccessPath } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/admin/login");
            return;
        }

        if (pathname === "/admin") {
            router.replace(AdminAuthUtil.resolveDefaultAdminPath(session, "/admin/forbidden"));
            return;
        }

        if (pathname.startsWith("/admin") && pathname !== "/admin/forbidden" && !canAccessPath(pathname)) {
            router.replace("/admin/forbidden");
        }
    }, [canAccessPath, isAuthenticated, isLoading, pathname, router, session]);

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

    if (pathname === "/admin") {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang chuyển về trang đầu tiên...
            </div>
        );
    }

    if (pathname.startsWith("/admin") && pathname !== "/admin/forbidden" && !canAccessPath(pathname)) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
                <ShieldX className="h-5 w-5" />
                Quyền truy cập đã thay đổi, đang chuyển hướng...
            </div>
        );
    }

    return <>{children}</>;
}
