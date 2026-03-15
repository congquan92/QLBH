"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile } from "@/types/user";
import { Edit, Eye, Loader2, Lock, Mail, Phone, Search, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
    users: UserProfile[];
    isLoading: boolean;
    isSaving: boolean;
    onViewDetail: (user: UserProfile) => void;
    onEdit: (user: UserProfile) => void;
    onToggleStatus: (userId: number, currentStatus: string) => void;
};

function getUsername(user: UserProfile): string {
    return String(user.username ?? user.userName ?? "").trim();
}

function getTotalSpent(user: UserProfile): number {
    const raw = (user as { totalSpent?: unknown; total_spent?: unknown }).totalSpent ?? (user as { totalSpent?: unknown; total_spent?: unknown }).total_spent;
    const value = Number(raw ?? 0);
    return Number.isFinite(value) ? value : 0;
}

function getRankLabel(user: UserProfile): string {
    const rank =
        (user as { userRankResponse?: unknown; userRank?: unknown; user_rank?: unknown; rank?: unknown }).userRankResponse ??
        (user as { userRankResponse?: unknown; userRank?: unknown; user_rank?: unknown; rank?: unknown }).userRank ??
        (user as { userRankResponse?: unknown; userRank?: unknown; user_rank?: unknown; rank?: unknown }).user_rank ??
        (user as { userRankResponse?: unknown; userRank?: unknown; user_rank?: unknown; rank?: unknown }).rank;

    if (typeof rank === "string" && rank.trim()) return rank;
    if (rank && typeof rank === "object") {
        const obj = rank as { name?: unknown; title?: unknown; code?: unknown };
        if (typeof obj.name === "string" && obj.name.trim()) return obj.name;
        if (typeof obj.title === "string" && obj.title.trim()) return obj.title;
        if (typeof obj.code === "string" && obj.code.trim()) return obj.code;
    }

    return "Chưa xếp hạng";
}

function isVerified(user: UserProfile): boolean {
    const emailVerified =
        (user as { verifiedEmail?: unknown; emailVerified?: unknown; email_verified?: unknown }).verifiedEmail ??
        (user as { verifiedEmail?: unknown; emailVerified?: unknown; email_verified?: unknown }).emailVerified ??
        (user as { verifiedEmail?: unknown; emailVerified?: unknown; email_verified?: unknown }).email_verified;
    const phoneVerified =
        (user as { verifiedPhone?: unknown; phoneVerified?: unknown; phone_verified?: unknown }).verifiedPhone ??
        (user as { verifiedPhone?: unknown; phoneVerified?: unknown; phone_verified?: unknown }).phoneVerified ??
        (user as { verifiedPhone?: unknown; phoneVerified?: unknown; phone_verified?: unknown }).phone_verified;
    return Boolean(emailVerified || phoneVerified);
}

function getPoint(user: UserProfile): number {
    const raw = (user as { point?: unknown }).point;
    const value = Number(raw ?? 0);
    return Number.isFinite(value) ? value : 0;
}

function getAddressCount(user: UserProfile): number {
    const addresses = (user as { addressResponses?: unknown }).addressResponses;
    return Array.isArray(addresses) ? addresses.length : 0;
}

function formatCurrency(amount: number): string {
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

export function CustomerTable({ users, isLoading, isSaving, onViewDetail, onEdit, onToggleStatus }: Props) {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterVerification, setFilterVerification] = useState("all");

    const filteredUsers = useMemo(() => {
        let result = users;

        const keyword = searchKeyword.trim().toLowerCase();
        if (keyword) {
            result = result.filter((user) => {
                const searchable = [user.fullName, getUsername(user), user.email, user.phone].map((v) => String(v ?? "").toLowerCase()).join(" ");
                return searchable.includes(keyword);
            });
        }

        if (filterStatus !== "all") {
            result = result.filter((user) => String(user.status ?? "ACTIVE") === filterStatus);
        }

        if (filterVerification !== "all") {
            result = result.filter((user) => (filterVerification === "VERIFIED" ? isVerified(user) : !isVerified(user)));
        }

        return result;
    }, [users, searchKeyword, filterStatus, filterVerification]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle>Danh sách khách hàng</CardTitle>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Tìm theo tên, username, email..." className="w-64 pl-8" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                        </div>

                        <Select value={filterVerification} onValueChange={setFilterVerification}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Xác thực" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Mọi xác thực</SelectItem>
                                <SelectItem value="VERIFIED">Đã xác thực</SelectItem>
                                <SelectItem value="UNVERIFIED">Chưa xác thực</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Mọi trạng thái</SelectItem>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="flex items-center py-8 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải danh sách khách hàng...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3">Liên hệ</th>
                                    <th className="px-4 py-3">Xác thực</th>
                                    <th className="px-4 py-3">Tích lũy</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => {
                                    const status = String(user.status ?? "ACTIVE");
                                    const username = getUsername(user);
                                    const verified = isVerified(user);

                                    return (
                                        <tr key={user.id} className="border-b hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={String(user.avatar ?? "")} alt={String(user.fullName ?? username ?? "U")} />
                                                        <AvatarFallback>{String(user.fullName ?? username ?? "U").charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{String(user.fullName ?? username ?? "Unknown")}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            ID #{user.id} · @{username || "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1 text-xs">
                                                    <p className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {String(user.email ?? "-")}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {String(user.phone ?? "-")}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={verified ? "default" : "secondary"}>{verified ? "Đã xác thực" : "Chưa xác thực"}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1 text-xs">
                                                    <p className="font-medium">{formatCurrency(getTotalSpent(user))}</p>
                                                    <p className="text-muted-foreground">
                                                        {getRankLabel(user)} · {getPoint(user)} điểm
                                                    </p>
                                                    <p className="text-muted-foreground">{getAddressCount(user)} địa chỉ</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>{status}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => onViewDetail(user)}>
                                                        <Eye className="mr-1 h-3.5 w-3.5" />
                                                        Chi tiết
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => onEdit(user)} disabled={isSaving}>
                                                        <Edit className="mr-1 h-3.5 w-3.5" />
                                                        Sửa
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => onToggleStatus(user.id, status)} disabled={isSaving}>
                                                        {status === "ACTIVE" ? <Lock className="mr-1 h-3.5 w-3.5" /> : <Unlock className="mr-1 h-3.5 w-3.5" />}
                                                        {status === "ACTIVE" ? "Khóa" : "Mở"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-8 text-muted-foreground" colSpan={6}>
                                            Không có dữ liệu khách hàng phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
