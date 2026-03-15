"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UserProfile } from "@/types/user";
import { Loader2 } from "lucide-react";

type Props = {
    customer: UserProfile | null;
    isLoading: boolean;
    onClose: () => void;
};

function getUsername(user: UserProfile): string {
    return String(user.username ?? user.userName ?? "").trim();
}

function formatDate(value: unknown): string {
    if (!value) return "-";
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("vi-VN");
}

function getRoleLabel(user: UserProfile): string {
    const role = (user as { role?: unknown }).role;
    if (typeof role === "string" && role.trim()) return role;
    if (role && typeof role === "object") {
        const obj = role as { name?: unknown; title?: unknown; code?: unknown };
        if (typeof obj.name === "string" && obj.name.trim()) return obj.name;
        if (typeof obj.title === "string" && obj.title.trim()) return obj.title;
        if (typeof obj.code === "string" && obj.code.trim()) return obj.code;
    }
    return "USER";
}

function getBooleanFields(user: UserProfile): { emailVerified: boolean; phoneVerified: boolean } {
    const emailRaw =
        (user as { verifiedEmail?: unknown; emailVerified?: unknown; email_verified?: unknown }).verifiedEmail ??
        (user as { verifiedEmail?: unknown; emailVerified?: unknown; email_verified?: unknown }).emailVerified ??
        (user as { verifiedEmail?: unknown; emailVerified?: unknown; email_verified?: unknown }).email_verified;
    const phoneRaw =
        (user as { verifiedPhone?: unknown; phoneVerified?: unknown; phone_verified?: unknown }).verifiedPhone ??
        (user as { verifiedPhone?: unknown; phoneVerified?: unknown; phone_verified?: unknown }).phoneVerified ??
        (user as { verifiedPhone?: unknown; phoneVerified?: unknown; phone_verified?: unknown }).phone_verified;
    return { emailVerified: Boolean(emailRaw), phoneVerified: Boolean(phoneRaw) };
}

function getSpent(user: UserProfile): string {
    const raw = (user as { totalSpent?: unknown; total_spent?: unknown }).totalSpent ?? (user as { totalSpent?: unknown; total_spent?: unknown }).total_spent;
    const amount = Number(raw ?? 0);
    if (!Number.isFinite(amount)) return "0 VND";
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

function getPoint(user: UserProfile): number {
    const raw = (user as { point?: unknown }).point;
    const value = Number(raw ?? 0);
    return Number.isFinite(value) ? value : 0;
}

function getRankLabel(user: UserProfile): string {
    const rank =
        (user as { userRankResponse?: unknown; userRank?: unknown; user_rank?: unknown }).userRankResponse ??
        (user as { userRankResponse?: unknown; userRank?: unknown; user_rank?: unknown }).userRank ??
        (user as { userRankResponse?: unknown; userRank?: unknown; user_rank?: unknown }).user_rank;

    if (rank && typeof rank === "object") {
        const obj = rank as { name?: unknown };
        if (typeof obj.name === "string" && obj.name.trim()) return obj.name;
    }

    return "Chưa xếp hạng";
}

function getAddresses(user: UserProfile): Array<{ id?: number; address?: string; province?: string; district?: string; ward?: string; addressType?: string; isDefault?: boolean; customerName?: string; phoneNumber?: string }> {
    const raw = (user as { addressResponses?: unknown }).addressResponses;
    return Array.isArray(raw) ? (raw as Array<{ id?: number; address?: string; province?: string; district?: string; ward?: string; addressType?: string; isDefault?: boolean; customerName?: string; phoneNumber?: string }>) : [];
}

export function CustomerDetailDialog({ customer, isLoading, onClose }: Props) {
    const isOpen = Boolean(customer);
    const addresses = customer ? getAddresses(customer) : [];
    const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[80vh] overflow-y-auto p-5 sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết khách hàng</DialogTitle>
                    <DialogDescription>Xem nhanh hồ sơ khách hàng và thao tác quản lý tài khoản.</DialogDescription>
                </DialogHeader>

                {customer && isLoading && (
                    <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải chi tiết khách hàng...
                    </div>
                )}

                {customer && !isLoading && (
                    <div className="space-y-4 text-sm">
                        <div className="rounded-lg border bg-muted/30 p-3.5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-base font-semibold">{String(customer.fullName ?? getUsername(customer) ?? "Khách hàng")}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ID #{customer.id} · @{getUsername(customer) || "-"}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary">{getRankLabel(customer)}</Badge>
                                    <Badge variant="outline">{getPoint(customer)} điểm</Badge>
                                    <Badge className={String(customer.status ?? "ACTIVE") === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>{String(customer.status ?? "ACTIVE")}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-md border p-3">
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="font-medium">{String(customer.email ?? "-")}</p>
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <p className="text-xs text-muted-foreground">Số điện thoại</p>
                                        <p className="font-medium">{String(customer.phone ?? "-")}</p>
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <p className="text-xs text-muted-foreground">Giới tính</p>
                                        <p className="font-medium">{String((customer as { gender?: unknown }).gender ?? "-")}</p>
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <p className="text-xs text-muted-foreground">Ngày sinh</p>
                                        <p className="font-medium">{formatDate((customer as { dateOfBirth?: unknown; date_of_birth?: unknown }).dateOfBirth ?? (customer as { dateOfBirth?: unknown; date_of_birth?: unknown }).date_of_birth)}</p>
                                    </div>
                                </div>

                                <div className="rounded-md border p-3">
                                    <p className="mb-2 text-xs text-muted-foreground">Tình trạng xác thực</p>
                                    <div className="flex flex-wrap gap-2">
                                        {getBooleanFields(customer).emailVerified ? <Badge>Email đã xác thực</Badge> : <Badge variant="secondary">Email chưa xác thực</Badge>}
                                        {getBooleanFields(customer).phoneVerified ? <Badge>SĐT đã xác thực</Badge> : <Badge variant="secondary">SĐT chưa xác thực</Badge>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-md border p-3">
                                        <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
                                        <p className="font-medium">{getSpent(customer)}</p>
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <p className="text-xs text-muted-foreground">Vai trò</p>
                                        <p className="font-medium">{getRoleLabel(customer)}</p>
                                    </div>
                                </div>

                                <div className="rounded-md border p-3">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <p className="text-xs text-muted-foreground">Địa chỉ mặc định</p>
                                        <Badge variant="outline">{addresses.length} địa chỉ</Badge>
                                    </div>
                                    {defaultAddress ? (
                                        <div className="space-y-1.5 text-sm">
                                            <p className="font-medium">{defaultAddress.customerName || String(customer.fullName ?? "Khách hàng")}</p>
                                            <p className="text-muted-foreground">{defaultAddress.phoneNumber || String(customer.phone ?? "-")}</p>
                                            <p>{[defaultAddress.address, defaultAddress.ward, defaultAddress.district, defaultAddress.province].filter(Boolean).join(", ") || "-"}</p>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {defaultAddress.addressType && <Badge variant="secondary">{defaultAddress.addressType}</Badge>}
                                                {defaultAddress.isDefault && <Badge>Mặc định</Badge>}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Chưa có địa chỉ giao hàng.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {customer && (
                    <DialogFooter >
                        <Button variant="ghost" onClick={onClose} className="underline-offset-4 hover:underline cursor-pointer">
                            Đóng
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
