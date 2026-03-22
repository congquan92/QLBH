"use client";

import { CalendarOff } from "lucide-react";

type Props = {
    total: number;
    pending: number;
};

export function LeaveAdminHeader({ total, pending }: Props) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                    <CalendarOff className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn nghỉ phép</h1>
                    <p className="text-sm text-muted-foreground">
                        Tổng {total} đơn
                        {pending > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                {pending} chờ duyệt
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
