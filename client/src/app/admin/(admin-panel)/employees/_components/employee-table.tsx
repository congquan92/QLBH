"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Position } from "@/types/admin-crud";
import type { RbacRole } from "@/types/rbac";
import type { UserProfile } from "@/types/user";
import { DollarSign, Eye, Lock, Mail, Pencil, Phone, Search, TrendingUp, Unlock, Users } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
    users: UserProfile[];
    roles: RbacRole[];
    isLoading: boolean;
    isSaving: boolean;
    onEdit: (user: UserProfile) => void;
    onViewDetail: (user: UserProfile) => void;
    onPromote: (user: UserProfile) => void;
    onBonus: (user: UserProfile) => void;
    onToggleStatus: (userId: number, currentStatus: string) => void;
};

// ─── Helper helpers ────────────────────────────────────────────────────────────

export function getRoleLabel(user: UserProfile): string {
    const role = (user as { role?: unknown }).role;
    if (typeof role === "string" && role.trim()) return role;
    if (role && typeof role === "object") {
        const obj = role as { name?: unknown; title?: unknown; code?: unknown };
        if (typeof obj.name === "string" && obj.name.trim()) return obj.name;
        if (typeof obj.title === "string" && obj.title.trim()) return obj.title;
        if (typeof obj.code === "string" && obj.code.trim()) return obj.code;
    }
    const roles = (user as { roles?: unknown }).roles;
    if (Array.isArray(roles)) {
        const names = roles
            .map((item) => {
                if (typeof item === "string") return item;
                if (item && typeof item === "object") {
                    const obj = item as { name?: unknown; title?: unknown; code?: unknown };
                    if (typeof obj.name === "string") return obj.name;
                    if (typeof obj.title === "string") return obj.title;
                }
                return "";
            })
            .map((n) => n.trim())
            .filter(Boolean);
        if (names.length > 0) return names.join(", ");
    }
    return "-";
}

export function getRoleId(user: UserProfile): number | null {
    const role = (user as { role?: unknown }).role;
    if (role && typeof role === "object") {
        const id = (role as { id?: unknown }).id;
        if (typeof id === "number") return id;
    }
    return null;
}

export function getUsername(user: UserProfile): string {
    return String((user as { username?: unknown; userName?: unknown }).username ?? (user as { username?: unknown; userName?: unknown }).userName ?? "").trim();
}

export function getEmploymentType(user: UserProfile): string {
    const et = user.employmentType
        ?? (user as { employment_type?: unknown }).employment_type;
    return typeof et === "string" && et.trim() ? et : "-";
}


export function getUserRank(user: UserProfile): string {
    const rank = (user as { userRankResponse?: unknown }).userRankResponse;
    if (rank && typeof rank === "object") {
        const obj = rank as { name?: unknown };
        if (typeof obj.name === "string" && obj.name.trim()) return obj.name;
    }
    return "-";
}

// ─── Options ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
    { value: "all", label: "ALL" },
    { value: "ACTIVE", label: "ACTIVE" },
    { value: "INACTIVE", label: "INACTIVE" },
] as const;

const EMPLOYMENT_OPTIONS = [
    { value: "all", label: "ALL" },
    { value: "FULL_TIME", label: "FULL_TIME" },
    { value: "PART_TIME", label: "PART_TIME" },
] as const;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
    return (
        <div className="space-y-0">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-b px-4 py-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-36" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-40 hidden md:block" />
                    <Skeleton className="h-5 w-24 hidden sm:block" />
                    <Skeleton className="h-5 w-16 hidden lg:block" />
                    <Skeleton className="h-5 w-16" />
                    <div className="flex gap-1.5">
                        <Skeleton className="h-7 w-7" />
                        <Skeleton className="h-7 w-7" />
                        <Skeleton className="h-7 w-7" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function EmployeeTable({ users, roles, isLoading, isSaving, onEdit, onViewDetail, onPromote, onBonus, onToggleStatus }: Props) {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterEmployment, setFilterEmployment] = useState("all");

    const filteredUsers = useMemo(() => {
        let result = users;
        const keyword = searchKeyword.trim().toLowerCase();
        if (keyword) {
            result = result.filter((user) => {
                const username = getUsername(user);
                const searchable = [user.fullName, username, user.email, user.phone]
                    .map((v) => String(v ?? "").toLowerCase())
                    .join(" ");
                return searchable.includes(keyword);
            });
        }
        if (filterRole !== "all") {
            result = result.filter((user) => getRoleLabel(user).toUpperCase() === filterRole.toUpperCase());
        }
        if (filterStatus !== "all") {
            result = result.filter((user) => String(user.status ?? "ACTIVE") === filterStatus);
        }
        if (filterEmployment !== "all") {
            result = result.filter((user) => {
                const et = (user as { employmentType?: unknown; employment_type?: unknown }).employmentType
                    ?? (user as { employmentType?: unknown; employment_type?: unknown }).employment_type;
                return String(et ?? "").toUpperCase() === filterEmployment;
            });
        }
        return result;
    }, [users, searchKeyword, filterRole, filterStatus, filterEmployment]);

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                <span className="text-sm font-semibold text-foreground">
                    {isLoading ? "Đang tải..." : `${filteredUsers.length} / ${users.length} nhân viên`}
                </span>
                <div className="flex flex-wrap gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm tên, email, SĐT..."
                            className="w-52 pl-8 h-9 text-sm"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                    </div>
                    {/* Filter vai trò */}
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-44 h-9 text-sm">
                            <SelectValue placeholder="Vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ALL</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Filter loại hình */}
                    <Select value={filterEmployment} onValueChange={setFilterEmployment}>
                        <SelectTrigger className="w-36 h-9 text-sm">
                            <SelectValue placeholder="Loại hình" />
                        </SelectTrigger>
                        <SelectContent>
                            {EMPLOYMENT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Filter trạng thái */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40 h-9 text-sm">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <TableSkeleton />
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="mb-3 h-12 w-12 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">Không có nhân viên phù hợp</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">Thử thay đổi bộ lọc hoặc từ khóa</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left">Nhân viên</th>
                                <th className="px-4 py-3 text-left hidden md:table-cell">Liên hệ</th>
                                <th className="px-4 py-3 text-left hidden sm:table-cell">Vai trò</th>
                                <th className="px-4 py-3 text-left hidden lg:table-cell">Vị trí</th>
                                <th className="px-4 py-3 text-left hidden lg:table-cell">Loại hình</th>
                                <th className="px-4 py-3 text-left">Trạng thái</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user) => {
                                const status = String(user.status ?? "ACTIVE");
                                const isActive = status === "ACTIVE";
                                const roleLabel = getRoleLabel(user);
                                const positionLabel = user.positionResponse?.name ?? "-";
                                const employmentLabel = getEmploymentType(user);
                                const username = getUsername(user);
                                const displayName = String(user.fullName ?? username ?? "Unknown");
                                const initials = displayName.charAt(0).toUpperCase();

                                return (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                        {/* Nhân viên */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 shrink-0">
                                                    <AvatarImage src={String(user.avatar ?? "")} alt={displayName} />
                                                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-medium leading-none truncate">{displayName}</p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        #{user.id} · @{username || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Liên hệ */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <div className="space-y-0.5 text-xs text-muted-foreground">
                                                <p className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3 shrink-0" />
                                                    <span className="truncate max-w-[180px]">{String(user.email ?? "-")}</span>
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 shrink-0" />
                                                    {String(user.phone ?? "-")}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Vai trò */}
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            {roleLabel !== "-" ? (
                                                <span className="text-xs font-medium text-foreground">
                                                    {roleLabel}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </td>

                                        {/* Vị trí */}
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {positionLabel !== "-" ? (
                                                <span className="text-xs font-medium text-foreground">
                                                    {positionLabel}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </td>

                                        {/* Loại hình */}
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {employmentLabel !== "-" ? (
                                                <span className="text-xs font-medium text-foreground">
                                                    {employmentLabel}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-medium text-foreground">
                                                {status}
                                            </span>
                                        </td>

                                        {/* Thao tác */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                                                    onClick={() => onViewDetail(user)}
                                                    title="Xem chi tiết"
                                                    disabled={isSaving}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-amber-50 hover:text-amber-600"
                                                    onClick={() => onEdit(user)}
                                                    title="Chỉnh sửa"
                                                    disabled={isSaving}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600"
                                                    onClick={() => onPromote(user)}
                                                    title="Thăng chức / Điều chuyển"
                                                    disabled={isSaving}
                                                >
                                                    <TrendingUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-amber-50 hover:text-amber-600"
                                                    onClick={() => onBonus(user)}
                                                    title="Thêm tiền thưởng"
                                                    disabled={isSaving}
                                                >
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-7 w-7 p-0 ${isActive
                                                            ? "hover:bg-red-50 hover:text-red-600"
                                                            : "hover:bg-green-50 hover:text-green-600"
                                                        }`}
                                                    onClick={() => onToggleStatus(user.id, status)}
                                                    title={isActive ? "Khóa tài khoản" : "Mở khóa"}
                                                    disabled={isSaving}
                                                >
                                                    {isActive ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
