"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Position } from "@/types/admin-crud";
import type { RbacRole } from "@/types/rbac";
import { Loader2, UserPlus } from "lucide-react";

export type CreateEmployeeFormData = {
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
    form: CreateEmployeeFormData;
    roles: RbacRole[];
    positions: Position[];
    isSaving: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: CreateEmployeeFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

export const emptyCreateForm: CreateEmployeeFormData = {
    fullName: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    gender: "OTHER",
    dateOfBirth: "",
    roleId: "",
    positionId: "",
    employmentType: "FULL_TIME",
};

export function CreateEmployeeDialog({ open, form, roles, positions, isSaving, onOpenChange, onChange, onSubmit, onCancel }: Props) {
    function set<K extends keyof CreateEmployeeFormData>(key: K, value: CreateEmployeeFormData[K]) {
        onChange({ ...form, [key]: value });
    }

    function inferEmploymentType(positionName: string): "FULL_TIME" | "PART_TIME" {
        const normalized = positionName.toLowerCase();
        if (normalized.includes("part time") || normalized.includes("part-time") || normalized.includes("bán thời gian")) {
            return "PART_TIME";
        }
        return "FULL_TIME";
    }

    function handlePositionChange(positionId: string) {
        const selected = positions.find((pos) => String(pos.id) === positionId);
        const inferred = selected?.name ? inferEmploymentType(String(selected.name)) : "FULL_TIME";
        onChange({ ...form, positionId, employmentType: inferred });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl md:max-w-2xl">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Thêm nhân viên mới</DialogTitle>
                            <DialogDescription className="mt-0.5">
                                Điền đầy đủ thông tin để tạo tài khoản nội bộ.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Thông tin tài khoản */}
                    <section className="space-y-3 rounded-xl border bg-muted/20 p-4">
                        <div>
                            <h3 className="text-sm font-semibold">Thông tin tài khoản</h3>
                            <p className="text-xs text-muted-foreground">Dùng để đăng nhập và liên hệ.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Họ và tên *</Label>
                                <Input
                                    className="h-9"
                                    placeholder="Nguyễn Văn A"
                                    value={form.fullName}
                                    onChange={(e) => set("fullName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Username *</Label>
                                <Input
                                    className="h-9"
                                    placeholder="nguyenvana"
                                    value={form.username}
                                    onChange={(e) => set("username", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Email *</Label>
                                <Input
                                    className="h-9"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={form.email}
                                    onChange={(e) => set("email", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Số điện thoại *</Label>
                                <Input
                                    className="h-9"
                                    placeholder="0912345678"
                                    value={form.phone}
                                    onChange={(e) => set("phone", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-xs">Mật khẩu *</Label>
                                <Input
                                    className="h-9"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => set("password", e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Thông tin hồ sơ */}
                    <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
                        <div>
                            <h3 className="text-sm font-semibold">Thông tin nhân sự</h3>
                            <p className="text-xs text-muted-foreground">Cấu hình vai trò, chức vụ và loại hình làm việc.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Ngày sinh *</Label>
                                <Input
                                    className="h-9"
                                    type="date"
                                    value={form.dateOfBirth}
                                    onChange={(e) => set("dateOfBirth", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Giới tính *</Label>
                                <Select value={form.gender} onValueChange={(v: "MALE" | "FEMALE" | "OTHER") => set("gender", v)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Chọn giới tính" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Nam</SelectItem>
                                        <SelectItem value="FEMALE">Nữ</SelectItem>
                                        <SelectItem value="OTHER">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Vai trò *</Label>
                                <Select value={form.roleId} onValueChange={(v) => set("roleId", v)}>
                                    <SelectTrigger className="h-9">
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
                            <div className="space-y-1.5">
                                <Label className="text-xs">Chức vụ *</Label>
                                <Select value={form.positionId} onValueChange={handlePositionChange}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Chọn chức vụ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map((pos) => (
                                            <SelectItem key={pos.id} value={String(pos.id)}>
                                                {String(pos.name ?? `Vị trí #${pos.id}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-xs">Loại hình làm việc *</Label>
                                <div className="h-9 max-w-xs rounded-md border border-input bg-muted/40 px-3 text-sm flex items-center font-medium">
                                    {form.employmentType === "PART_TIME" ? "Part-time (Bán thời gian)" : "Full-time (Toàn thời gian)"}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isSaving} className="min-w-32 gap-1.5">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}
                        {isSaving ? "Đang lưu..." : "Tạo nhân viên"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
