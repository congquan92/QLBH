"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";

export type RegisterFormData = {
    fullName: string;
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    phone: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
};

type Props = {
    open: boolean;
    form: RegisterFormData;
    isSaving: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: RegisterFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

export function RegisterUserForm({ open, form, isSaving, onOpenChange, onChange, onSubmit, onCancel }: Props) {
    function set<K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) {
        onChange({ ...form, [key]: value });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto p-5 sm:max-w-xl md:max-w-2xl">
                <DialogHeader className="space-y-1.5 border-b pb-3">
                    <DialogTitle className="text-xl">Đăng ký user khách</DialogTitle>
                    <DialogDescription>Tạo tài khoản khách hàng bằng luồng đăng ký tiêu chuẩn của hệ thống.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    <section className="space-y-3 rounded-xl border bg-muted/20 p-3.5">
                        <div>
                            <h3 className="text-sm font-semibold">Thông tin cơ bản</h3>
                            <p className="text-xs text-muted-foreground">Các trường dùng để nhận diện và liên hệ khách hàng.</p>
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
                        </div>
                    </section>

                    <section className="space-y-3 rounded-xl border bg-background p-3.5 shadow-sm">
                        <div>
                            <h3 className="text-sm font-semibold">Bảo mật và hồ sơ</h3>
                            <p className="text-xs text-muted-foreground">Thiết lập ngày sinh, giới tính và mật khẩu cho tài khoản mới.</p>
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
                                <Label>Mật khẩu</Label>
                                <Input className="h-10" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Xác nhận mật khẩu</Label>
                                <Input className="h-10" type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
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
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Đăng ký
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
