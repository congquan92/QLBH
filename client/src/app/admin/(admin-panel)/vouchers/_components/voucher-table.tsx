"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Helper } from "@/lib/helper";
import type { Voucher } from "@/types/voucher";
import { Pencil, RotateCcw, TicketPercent, Trash2 } from "lucide-react";

interface VoucherTableProps {
    vouchers: Voucher[];
    isLoading: boolean;
    onEdit: (item: Voucher) => void;
    onDelete: (item: Voucher) => void;
    onRestore: (item: Voucher) => void;
}

function StatusBadge({ status }: { status?: string }) {
    const map: Record<string, { label: string; className: string }> = {
        ACTIVE: { label: "Đang hoạt động", className: "bg-green-50 text-green-700 border-green-300" },
        INACTIVE: { label: "Không hoạt động", className: "bg-yellow-50 text-yellow-700 border-yellow-300" },
        EXPIRED: { label: "Hết hạn", className: "bg-slate-50 text-slate-500 border-slate-300" },
    };
    const s = status ? (map[status] ?? { label: status, className: "" }) : map.INACTIVE;
    return (
        <Badge variant="outline" className={`text-xs font-medium px-2 py-0 ${s.className}`}>
            {s.label}
        </Badge>
    );
}

function TypeBadge({ type }: { type?: string }) {
    return (
        <Badge
            variant="outline"
            className={`text-xs px-2 py-0 ${type === "PERCENTAGE"
                ? "bg-blue-50 text-blue-700 border-blue-300"
                : "bg-purple-50 text-purple-700 border-purple-300"
                }`}
        >
            {type === "PERCENTAGE" ? "% Phần trăm" : "VND Cố định"}
        </Badge>
    );
}

function formatDiscount(voucher: Voucher) {
    const val = voucher.discountValue;
    if (val == null) return "—";
    if (voucher.type === "PERCENTAGE") return `${String(val)}%`;
    return Helper.formatCurrency(Number(val));
}

export function VoucherTable({ vouchers, isLoading, onEdit, onDelete, onRestore }: VoucherTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-2 p-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-2 py-3">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (vouchers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <TicketPercent className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Chưa có voucher nào</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                    Nhấn &quot;Thêm voucher&quot; để tạo chiến dịch đầu tiên
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/40">
                        <th className="w-10 px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">#</th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Mô tả / ID</th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Loại</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Giá trị giảm</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Tối thiểu</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Còn lại / Tổng</th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Hạng</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">Hiệu lực</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
                        <th className="w-20 px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {vouchers.map((v, index) => {
                        const desc = String(v.description ?? "—");
                        const startDate = v.startDate ? String(v.startDate).slice(0, 10) : "—";
                        const endDate = v.endDate ? String(v.endDate).slice(0, 10) : "—";
                        const remaining = v.remaining_quantity ?? "—";
                        const total = v.totalQuantity ?? "—";
                        const rank = v.userRankResponse;

                        return (
                            <tr
                                key={v.id}
                                className="hover:bg-muted/30 transition-colors group"
                            >
                                <td className="px-3 py-2.5 text-center text-muted-foreground text-xs font-mono">
                                    {index + 1}
                                </td>

                                <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 border">
                                            <TicketPercent className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate max-w-45" title={desc}>
                                                {desc}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                ID #{v.id}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-3 py-2.5">
                                    <TypeBadge type={v.type} />
                                </td>

                                <td className="px-3 py-2.5 text-right font-semibold text-sm">
                                    {formatDiscount(v)}
                                    {v.maxDiscountValue ? (
                                        <p className="text-xs font-normal text-muted-foreground">
                                            max {Helper.formatCurrency(Number(v.maxDiscountValue))}
                                        </p>
                                    ) : null}
                                </td>

                                <td className="px-3 py-2.5 text-right text-sm text-muted-foreground">
                                    {v.minDiscountValue
                                        ? Helper.formatCurrency(Number(v.minDiscountValue))
                                        : "—"}
                                </td>

                                <td className="px-3 py-2.5 text-right text-sm">
                                    <span
                                        className={`font-medium ${Number(remaining) === 0
                                            ? "text-red-500"
                                            : "text-foreground"
                                            }`}
                                    >
                                        {String(remaining)} / {String(total)}
                                    </span>
                                </td>

                                <td className="px-3 py-2.5 text-sm">
                                    {rank ? (
                                        <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                            {rank.name}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">—</span>
                                    )}
                                </td>

                                <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span>{startDate}</span>
                                        <span className="text-muted-foreground/50">→</span>
                                        <span>{endDate}</span>
                                    </div>
                                </td>

                                <td className="px-3 py-2.5 text-center">
                                    <StatusBadge status={v.status} />
                                </td>

                                <td className="px-3 py-2.5 text-center">
                                    <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 w-7 p-0 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-colors"
                                            onClick={() => onEdit(v)}
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                                            onClick={() => onDelete(v)}
                                            title="Vô hiệu hóa"
                                            disabled={v.status === "EXPIRED"}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                        {v.status === "INACTIVE" ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                                                onClick={() => onRestore(v)}
                                                title="Khôi phục"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" />
                                            </Button>
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
