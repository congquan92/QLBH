"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Position } from "@/types/admin-crud";
import type { RbacRole } from "@/types/rbac";
import { Loader2, Plus } from "lucide-react";

export type CreateUserFormData = {
    fullName: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    roleId: string;
    positionId: string;
    employmentType: "FULL_TIME" | "PART_TIME";
};

type Props = {
    open: boolean;
    form: CreateUserFormData;
    roles: RbacRole[];
    positions: Position[];
    isSaving: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: CreateUserFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

export function CreateUserForm({ open, form, roles, positions, isSaving, onOpenChange, onChange, onSubmit, onCancel }: Props) {
    function set<K extends keyof CreateUserFormData>(key: K, value: CreateUserFormData[K]) {
        onChange({ ...form, [key]: value });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto p-5 sm:max-w-xl md:max-w-2xl">
                <DialogHeader className="space-y-1.5 border-b pb-3">
                    <DialogTitle className="text-xl">Thêm tài khoản nội bội</DialogTitle>
                    <DialogDescription>Điền thông tin đầy đủ của tài khoản.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    <section className="space-y-3 rounded-xl border bg-muted/20 p-3.5">
                        <div>
                            <h3 className="text-sm font-semibold">Thông tin tài khoản</h3>
                            <p className="text-xs text-muted-foreground">Dùng cho đăng nhập và liên hệ với người dùng.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Họ tên *</Label>
                                <Input className="h-10" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Username *</Label>
                                <Input className="h-10" value={form.username} onChange={(e) => set("username", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input className="h-10" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Số điện thoại *</Label>
                                <Input className="h-10" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Mật khẩu *</Label>
                                <Input className="h-10" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3 rounded-xl border bg-background p-3.5 shadow-sm">
                        <div>
                            <h3 className="text-sm font-semibold">Thông tin hồ sơ</h3>
                            <p className="text-xs text-muted-foreground">Thiết lập nhóm quyền, chức vụ và loại hình làm việc.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Ngày sinh *</Label>
                                <Input className="h-10" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Giới tính *</Label>
                                <Select value={form.gender} onValueChange={(value: "MALE" | "FEMALE" | "OTHER") => set("gender", value)}>
                                    <SelectTrigger className="h-10">
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
                                <Label>Vai trò *</Label>
                                <Select value={form.roleId} onValueChange={(value) => set("roleId", value)}>
                                    <SelectTrigger className="h-10">
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
                                <Label>Chức vụ *</Label>
                                <Select value={form.positionId} onValueChange={(value) => set("positionId", value)}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Chọn chức vụ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map((position) => (
                                            <SelectItem key={position.id} value={String(position.id)}>
                                                {String(position.name ?? `Position #${position.id}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Loại làm việc *</Label>
                                <Select value={form.employmentType} onValueChange={(value: "FULL_TIME" | "PART_TIME") => set("employmentType", value)}>
                                    <SelectTrigger className="h-10 w-full md:max-w-55">
                                        <SelectValue placeholder="Chọn loại" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL_TIME">Full-time</SelectItem>
                                        <SelectItem value="PART_TIME">Part-time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>
                </div>

                <DialogFooter className="border-t pt-3 sm:justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                            Hủy
                        </Button>
                        <Button className="min-w-28" onClick={onSubmit} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Lưu user
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
