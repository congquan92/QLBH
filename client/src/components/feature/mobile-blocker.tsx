"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Monitor } from "lucide-react";

export function MobileBlocker({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Monitor className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">Không hỗ trợ trên thiết bị di động</h1>
                <p className="max-w-md text-muted-foreground">
                    Trang quản trị chỉ hoạt động trên máy tính. Vui lòng sử dụng laptop hoặc desktop để truy cập.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
