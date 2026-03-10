"use client";

import { UserAuthUtil } from "@/lib/user-auth";
import { UserAuthStore } from "@/stores/user-auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function UserRouteGate({ children }: { children: React.ReactNode }) {
    const session = UserAuthStore.useStore((state) => state.session);
    const isLoading = UserAuthStore.useStore((state) => state.isLoading);
    const pathname = usePathname();
    const router = useRouter();

    const isAuthenticated = UserAuthUtil.isSessionValid(session);

    useEffect(() => {
        if (isLoading || isAuthenticated) return;
        router.replace(`/dang-nhap?redirect=${encodeURIComponent(pathname)}`);
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading) {
        return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-gray-500">Đang kiểm tra phiên đăng nhập...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
