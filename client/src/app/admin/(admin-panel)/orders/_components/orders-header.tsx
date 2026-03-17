import { BadgeCheck } from "lucide-react";

export function OrdersHeader() {
    return (
        <div className="rounded-xl border bg-gradient-to-r from-slate-50 via-sky-50 to-cyan-50 p-5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="flex items-start gap-3">
                <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                    <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Cập nhật trạng thái theo luồng một chiều và theo dõi hiệu suất giao hàng theo khu vực.</p>
                </div>
            </div>
        </div>
    );
}
