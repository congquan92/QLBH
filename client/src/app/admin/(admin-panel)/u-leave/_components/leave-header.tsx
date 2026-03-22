"use client";

import { CalendarOff } from "lucide-react";

export function LeaveHeader() {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                <CalendarOff className="h-5 w-5" />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Đơn nghỉ phép</h1>
                <p className="text-sm text-muted-foreground">Gửi và theo dõi đơn nghỉ phép của bạn</p>
            </div>
        </div>
    );
}
