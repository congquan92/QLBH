"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile } from "@/types/user";
import { Loader2 } from "lucide-react";

export type EditUserFormData = {
    fullName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    phone: string;
};

type Props = {
    editingUser: UserProfile | null;
    isSaving: boolean;
    form: EditUserFormData;
    onChange: (form: EditUserFormData) => void;
    onChangeStatus: (status: "ACTIVE" | "INACTIVE") => void;
    onSave: () => void;
    onClose: () => void;
};

export function EditUserDialog({ editingUser, isSaving, form, onChange, onSave, onClose }: Props) {
    function set<K extends keyof EditUserFormData>(key: K, value: EditUserFormData[K]) {
        onChange({ ...form, [key]: value });
    }

    return (
        <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[80vh] overflow-y-auto p-5 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Cập nhật tài khoản user</DialogTitle>
                    <DialogDescription>Chỉnh thông tin hồ sơ và trạng thái của tài khoản khách hàng.</DialogDescription>
                </DialogHeader>

                {editingUser && (
                    <div className="space-y-4">
                        {(() => {
                            const username = String(editingUser.username ?? editingUser.userName ?? "").trim();
                            return (
                                <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3 text-sm">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={String((editingUser as { avatar?: unknown }).avatar ?? "")} alt={String(editingUser.fullName ?? username ?? "U")} />
                                        <AvatarFallback>{String(editingUser.fullName ?? username ?? "U").charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{String(editingUser.fullName ?? username ?? "Unknown")}</p>
                                        <p className="text-xs text-muted-foreground">
                                            ID #{editingUser.id} · @{username || "-"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Họ tên</Label>
                                <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Nhập họ tên khách hàng" />
                            </div>

                            <div className="space-y-2">
                                <Label>Giới tính</Label>
                                <Select value={form.gender} onValueChange={(value: "MALE" | "FEMALE" | "OTHER") => set("gender", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn giới tính" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Nam</SelectItem>
                                        <SelectItem value="FEMALE">Nữ</SelectItem>
                                        <SelectItem value="OTHER">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Ngày sinh</Label>
                                <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Số điện thoại</Label>
                                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Nhập số điện thoại" />
                            </div>
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
