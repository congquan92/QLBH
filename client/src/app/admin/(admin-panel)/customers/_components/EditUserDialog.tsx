"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RbacRole } from "@/types/rbac";
import type { UserProfile } from "@/types/user";
import { Loader2 } from "lucide-react";

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

export function EditUserDialog({ editingUser, roles, isSaving, editRoleId, editStatus, onChangeRole, onChangeStatus, onSave, onClose }: Props) {
    return (
        <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Sửa user</DialogTitle>
                    <DialogDescription>Cập nhật vai trò và trạng thái user theo endpoint server hiện có.</DialogDescription>
                </DialogHeader>

                {editingUser && (
                    <div className="space-y-4">
                        {(() => {
                            const username = String(editingUser.username ?? editingUser.userName ?? "").trim();
                            return (
                                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                                    <p className="font-medium">{String(editingUser.fullName ?? username ?? "Unknown")}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ID #{editingUser.id} · @{username || "-"}
                                    </p>
                                </div>
                            );
                        })()}

                        <div className="space-y-2">
                            <Label>Vai trò</Label>
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

                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select value={editStatus} onValueChange={(value: "ACTIVE" | "INACTIVE") => onChangeStatus(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Hủy
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
