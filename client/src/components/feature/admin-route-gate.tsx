"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { AdminAuthUtil } from "@/lib/admin-auth";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";
import { useEffect } from "react";

export function AdminRouteGate({ children }: { children: React.ReactNode }) {
    const { session, isLoading, isAuthenticated, canAccessPath } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();
    const fallbackPath = AdminAuthUtil.resolveDefaultAdminPath(session);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/admin/login");
            return;
        }

        if (pathname && pathname.startsWith("/admin") && pathname !== "/admin" && pathname !== "/admin/login") {
            if (!canAccessPath(pathname)) {
                if (pathname !== fallbackPath) {
                    router.replace(fallbackPath);
                }
            }
        }
    }, [canAccessPath, fallbackPath, isAuthenticated, isLoading, pathname, router]);

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
