"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { RbacRole } from "@/types/rbac";
import type { UserProfile } from "@/types/user";
import { Loader2, Pencil } from "lucide-react";
import { getUsername } from "./employee-table";

type Props = {
    editingUser: UserProfile | null;
    roles: RbacRole[];
    isSaving: boolean;
    editRoleId: string;
    editStatus: "ACTIVE" | "INACTIVE";
    onChangeRole: (roleId: string) => void;
    onChangeStatus: (status: "ACTIVE" | "INACTIVE") => void;
    onSave: () => void;
    onClose: () => void;
};

export function EditEmployeeDialog({ editingUser, roles, isSaving, editRoleId, editStatus, onChangeRole, onChangeStatus, onSave, onClose }: Props) {
    if (!editingUser) return null;

    const username = getUsername(editingUser);
    const displayName = String(editingUser.fullName ?? username ?? "Unknown");
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                            <Pencil className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
                            <DialogDescription className="mt-0.5">
                                Cập nhật vai trò và trạng thái tài khoản.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Profile preview */}
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                        <Avatar className="h-11 w-11">
                            <AvatarImage src={String(editingUser.avatar ?? "")} alt={displayName} />
                            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm leading-none">{displayName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                ID #{editingUser.id} · @{username || "-"}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{String(editingUser.email ?? "")}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Vai trò */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Vai trò</Label>
                        <Select value={editRoleId} onValueChange={onChangeRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={String(role.id)}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Trạng thái */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Trạng thái tài khoản</Label>
                        <Select value={editStatus} onValueChange={(v: "ACTIVE" | "INACTIVE") => onChangeStatus(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-1.5 py-0">
                                            Hoạt động
                                        </Badge>
                                    </div>
                                </SelectItem>
                                <SelectItem value="INACTIVE">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-red-100 text-red-600 border-red-200 text-xs px-1.5 py-0">
                                            Bị khóa
                                        </Badge>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Hủy
                    </Button>
                    <Button onClick={onSave} disabled={isSaving} className="min-w-28 gap-1.5">
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
