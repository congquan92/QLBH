"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RbacRole } from "@/types/rbac";
import type { UserProfile } from "@/types/user";
import { Edit, Loader2, Lock, Mail, Phone, Search, Shield, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
    users: UserProfile[];
    roles: RbacRole[];
    isLoading: boolean;
    isSaving: boolean;
    onEdit: (user: UserProfile) => void;
    onToggleStatus: (userId: number, currentStatus: string) => void;
};

function getRoleLabel(user: UserProfile): string {
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
                    if (typeof obj.code === "string") return obj.code;
                }
                return "";
            })
            .map((n) => n.trim())
            .filter(Boolean);
        if (names.length > 0) return names.join(", ");
    }

    return "-";
}

function getRoleId(user: UserProfile): number | null {
    const role = (user as { role?: unknown }).role;
    if (role && typeof role === "object") {
        const obj = role as { id?: unknown };
        if (typeof obj.id === "number") return obj.id;
    }
    return null;
}

function getUsername(user: UserProfile): string {
    return String(user.username ?? user.userName ?? "").trim();
}

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "ACTIVE" },
    { value: "INACTIVE", label: "INACTIVE" },
] as const;

export function UserTable({ users, roles, isLoading, isSaving, onEdit, onToggleStatus }: Props) {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredUsers = useMemo(() => {
        let result = users;

        const keyword = searchKeyword.trim().toLowerCase();
        if (keyword) {
            result = result.filter((user) => {
                const searchable = [user.fullName, getUsername(user), user.email, user.phone].map((v) => String(v ?? "").toLowerCase()).join(" ");
                return searchable.includes(keyword);
            });
        }

        if (filterRole !== "all") {
            result = result.filter((user) => {
                const label = getRoleLabel(user).toUpperCase();
                return label.includes(filterRole.toUpperCase());
            });
        }

        if (filterStatus !== "all") {
            result = result.filter((user) => String(user.status ?? "ACTIVE") === filterStatus);
        }

        return result;
    }, [users, searchKeyword, filterRole, filterStatus]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle>Danh Sách Tài Khoản</CardTitle>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Tìm theo tên, username, email..." className="w-56 pl-8" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                        </div>

                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả vai trò</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="flex items-center py-8 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải danh sách user...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Liên hệ</th>
                                    <th className="px-4 py-3">Vai trò</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => {
                                    const status = String(user.status ?? "ACTIVE");
                                    const roleLabel = getRoleLabel(user);
                                    const roleId = getRoleId(user);
                                    const username = getUsername(user);

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
                                                <p className="flex items-center gap-1">
                                                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {roleLabel}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    className={
                                                        status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-100" : status === "INACTIVE" ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                                    }
                                                >
                                                    {status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => onEdit({ ...user, _roleId: roleId } as UserProfile)} disabled={isSaving}>
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
                                        <td className="px-4 py-8 text-muted-foreground" colSpan={5}>
                                            Không có dữ liệu phù hợp.
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
