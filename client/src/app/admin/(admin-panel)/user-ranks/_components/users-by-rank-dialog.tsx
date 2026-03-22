"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Helper } from "@/lib/helper";
import type { UserRank } from "@/types/admin-crud";
import type { UserProfile } from "@/types/user";
import { ChevronLeft, ChevronRight, Crown, Search, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UsersByRankDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rank: UserRank | null;
}

export function UsersByRankDialog({ open, onOpenChange, rank }: UsersByRankDialogProps) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 8;

    async function fetchUsers(p = 1, kw = keyword) {
        if (!rank) return;
        setIsLoading(true);
        try {
            const res = await AdminCrudApi.getUsersByRank(rank.id, { keyword: kw || undefined, page: p, size: PAGE_SIZE });
            setUsers(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch {
            toast.error("Không thể tải danh sách khách hàng.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (open && rank) {
            setKeyword("");
            setPage(1);
            void fetchUsers(1, "");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, rank?.id]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setPage(1);
        void fetchUsers(1, keyword);
    }

    function handlePageChange(newPage: number) {
        setPage(newPage);
        void fetchUsers(newPage);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                            <Crown className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <DialogTitle>
                                Khách hàng hạng <span className="text-primary">{String(rank?.name ?? "")}</span>
                            </DialogTitle>
                            <DialogDescription className="mt-0.5">
                                {totalElements > 0
                                    ? `${totalElements} khách hàng · Chi tiêu ≥ ${Helper.formatCurrency(rank?.minSpent)}`
                                    : `Chi tiêu ≥ ${Helper.formatCurrency(rank?.minSpent)}`}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tên, email, số điện thoại..."
                            className="pl-8"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" variant="outline" size="sm">
                        Tìm
                    </Button>
                </form>

                {/* User List */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3.5 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <User2 className="mb-2 h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">
                                {keyword ? "Không tìm thấy khách hàng phù hợp." : "Chưa có khách hàng nào ở hạng này."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors"
                                >
                                    {/* Avatar */}
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                                        {user.avatar ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={String(user.avatar)} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User2 className="h-4 w-4 text-primary" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-none truncate">
                                            {String(user.fullName ?? user.userName ?? `User #${user.id}`)}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                                            {String(user.email ?? "")}
                                            {user.phone ? ` · ${String(user.phone)}` : ""}
                                        </p>
                                    </div>

                                    {/* Total spent */}
                                    <div className="shrink-0 text-right">
                                        <p className="text-xs font-semibold text-foreground">
                                            {Helper.formatCurrency(user.totalSpent)}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className={`mt-0.5 text-[10px] px-1.5 py-0 ${
                                                user.status === "ACTIVE"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-red-50 text-red-600 border-red-200"
                                            }`}
                                        >
                                            {user.status === "ACTIVE" ? "Hoạt động" : String(user.status ?? "")}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-3 shrink-0">
                        <p className="text-xs text-muted-foreground">
                            Trang {page} / {totalPages}
                        </p>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                disabled={page <= 1 || isLoading}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                disabled={page >= totalPages || isLoading}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
