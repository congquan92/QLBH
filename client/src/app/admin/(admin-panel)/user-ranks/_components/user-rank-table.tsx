"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Helper } from "@/lib/helper";
import type { UserRank } from "@/types/admin-crud";
import { Crown, Eye, Pencil, Trash2 } from "lucide-react";

const RANK_COLORS = [
    { bg: "bg-amber-50", border: "border-amber-300", crown: "text-amber-500" },
    { bg: "bg-slate-50", border: "border-slate-300", crown: "text-slate-400" },
    { bg: "bg-orange-50", border: "border-orange-300", crown: "text-orange-400" },
    { bg: "bg-sky-50", border: "border-sky-300", crown: "text-sky-500" },
    { bg: "bg-emerald-50", border: "border-emerald-300", crown: "text-emerald-500" },
    { bg: "bg-purple-50", border: "border-purple-300", crown: "text-purple-500" },
];

function getRankColor(index: number) {
    return RANK_COLORS[index % RANK_COLORS.length];
}

interface UserRankTableProps {
    ranks: UserRank[];
    isLoading: boolean;
    onEdit: (item: UserRank) => void;
    onDelete: (item: UserRank) => void;
    onViewUsers: (item: UserRank) => void;
}

export function UserRankTable({ ranks, isLoading, onEdit, onDelete, onViewUsers }: UserRankTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                ))}
            </div>
        );
    }

    if (ranks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Crown className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Chưa có hạng thành viên nào</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Nhấn &quot;Thêm hạng mới&quot; để bắt đầu</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {ranks.map((item, index) => {
                const color = getRankColor(index);
                const isActive = item.status === "ACTIVE";

                return (
                    <div
                        key={item.id}
                        className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:shadow-sm ${color.bg} ${color.border}`}
                    >
                        {/* Icon */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border">
                            <Crown className={`h-5 w-5 ${color.crown}`} />
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold tracking-wide text-sm uppercase">
                                    #{index + 1} — {String(item.name ?? `Rank #${item.id}`)}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-semibold px-2 py-0 ${
                                        isActive
                                            ? "bg-green-50 text-green-700 border-green-300"
                                            : item.status === "DISABLED"
                                            ? "bg-red-50 text-red-600 border-red-300"
                                            : "bg-yellow-50 text-yellow-600 border-yellow-300"
                                    }`}
                                >
                                    {isActive ? "Đang hoạt động" : item.status === "DISABLED" ? "Đã vô hiệu" : String(item.status ?? "ACTIVE")}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Chi tiêu tối thiểu:{" "}
                                <span className="font-semibold text-foreground">
                                    {Helper.formatCurrency(item.minSpent)}
                                </span>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 px-2.5 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors text-xs"
                                onClick={() => onViewUsers(item)}
                                title="Xem khách hàng"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Khách hàng</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 bg-white hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-colors"
                                onClick={() => onEdit(item)}
                                title="Chỉnh sửa"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 bg-white text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                                onClick={() => onDelete(item)}
                                title="Vô hiệu hóa"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
