"use client";

import { AuthApi } from "@/api/auth";
import { UserApi } from "@/api/user.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import type { UserProfile } from "@/types/user";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerDetailDialog } from "./_components/CustomerDetailDialog";
import { CustomerTable } from "./_components/CustomerTable";
import type { EditUserFormData } from "./_components/EditUserDialog";
import { EditUserDialog } from "./_components/EditUserDialog";
import type { RegisterFormData } from "./_components/RegisterUserForm";
import { RegisterUserForm } from "./_components/RegisterUserForm";
import { UsersToolbar } from "./_components/UsersToolbar";

const emptyRegisterForm: RegisterFormData = {
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    gender: "OTHER",
    dateOfBirth: "",
};

const emptyEditForm: EditUserFormData = {
    fullName: "",
    gender: "OTHER",
    dateOfBirth: "",
    phone: "",
};

function toIsoDate(value: unknown): string {
    if (!value) return "";
    const raw = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

export default function CustomersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [showRegisterForm, setShowRegisterForm] = useState(false);

    const [registerForm, setRegisterForm] = useState<RegisterFormData>(emptyRegisterForm);

    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<UserProfile | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [editForm, setEditForm] = useState<EditUserFormData>(emptyEditForm);
    const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersRes = await UserApi.getUsers({ page: 1, size: 200, sort: "id:desc", hasUserRole: true });

            setUsers(usersRes.data.data ?? []);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể tải danh sách user.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    async function handleRegisterUser() {
        if (!registerForm.fullName.trim() || !registerForm.username.trim() || !registerForm.password.trim() || !registerForm.confirmPassword.trim()) {
            toast.error("Vui lòng nhập đủ thông tin đăng ký.");
            return;
        }
        if (registerForm.password !== registerForm.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp.");
            return;
        }
        if (!registerForm.dateOfBirth || !registerForm.email || !registerForm.phone) {
            toast.error("Vui lòng nhập đủ email, số điện thoại và ngày sinh.");
            return;
        }

        setIsSaving(true);
        try {
            await AuthApi.register({
                fullName: registerForm.fullName.trim(),
                username: registerForm.username.trim(),
                password: registerForm.password,
                email: registerForm.email.trim(),
                phone: registerForm.phone.trim(),
                gender: registerForm.gender,
                dateOfBirth: registerForm.dateOfBirth,
            });
            toast.success("Đăng ký user thành công. Tài khoản sẽ cần xác thực OTP.");
            setRegisterForm(emptyRegisterForm);
            setShowRegisterForm(false);
            await fetchUsers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Đăng ký user thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggleStatus(userId: number, currentStatus: string) {
        const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        setIsSaving(true);
        try {
            await UserApi.updateUserStatus(userId, { status: nextStatus });
            toast.success(nextStatus === "ACTIVE" ? "Đã mở user." : "Đã khóa user.");
            await fetchUsers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Cập nhật trạng thái thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    function openEditDialog(user: UserProfile) {
        setViewingCustomer(null);
        setEditingUser(user);
        setEditForm({
            fullName: String(user.fullName ?? ""),
            gender: String((user as { gender?: unknown }).gender ?? "OTHER") === "MALE" ? "MALE" : String((user as { gender?: unknown }).gender ?? "OTHER") === "FEMALE" ? "FEMALE" : "OTHER",
            dateOfBirth: toIsoDate((user as { dateOfBirth?: unknown; date_of_birth?: unknown }).dateOfBirth ?? (user as { dateOfBirth?: unknown; date_of_birth?: unknown }).date_of_birth),
            phone: String(user.phone ?? ""),
        });
        setEditStatus(String(user.status ?? "ACTIVE") === "INACTIVE" ? "INACTIVE" : "ACTIVE");
    }

    async function handleViewCustomerDetail(user: UserProfile) {
        setViewingCustomer(user);
        setIsDetailLoading(true);
        try {
            const response = await UserApi.getUserDetail(user.id);
            if (response?.data) {
                setViewingCustomer(response.data);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết khách hàng.");
        } finally {
            setIsDetailLoading(false);
        }
    }

    const activeCount = users.filter((user) => String(user.status ?? "ACTIVE") === "ACTIVE").length;
    const inactiveCount = users.length - activeCount;

    async function handleEditUser() {
        if (!editingUser) return;

        const currentStatus = String(editingUser.status ?? "ACTIVE");
        const currentFullName = String(editingUser.fullName ?? "");
        const currentGender = String((editingUser as { gender?: unknown }).gender ?? "OTHER");
        const currentDateOfBirth = toIsoDate((editingUser as { dateOfBirth?: unknown; date_of_birth?: unknown }).dateOfBirth ?? (editingUser as { dateOfBirth?: unknown; date_of_birth?: unknown }).date_of_birth);
        const currentPhone = String(editingUser.phone ?? "");

        const needProfileUpdate = editForm.fullName.trim() !== currentFullName || editForm.gender !== currentGender || editForm.dateOfBirth !== currentDateOfBirth || editForm.phone.trim() !== currentPhone;
        const needStatusUpdate = editStatus !== currentStatus;

        if (!needProfileUpdate && !needStatusUpdate) {
            toast.info("Không có thay đổi để cập nhật.");
            return;
        }

        setIsSaving(true);
        try {
            if (needProfileUpdate) {
                await UserApi.updateUserById(editingUser.id, {
                    fullName: editForm.fullName.trim(),
                    gender: editForm.gender,
                    dateOfBirth: editForm.dateOfBirth || null,
                    phone: editForm.phone.trim(),
                });
            }
            if (needStatusUpdate) await UserApi.updateUserStatus(editingUser.id, { status: editStatus });

            toast.success("Đã cập nhật user.");
            setEditingUser(null);
            setEditForm(emptyEditForm);
            await fetchUsers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Cập nhật user thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Quản lý khách hàng" description="Chỉ hiển thị tài khoản có vai trò USER">
            <UsersToolbar totalCount={users.length} activeCount={activeCount} inactiveCount={inactiveCount} showRegisterForm={showRegisterForm} onToggleRegisterForm={() => setShowRegisterForm((prev) => !prev)} />

            <RegisterUserForm
                open={showRegisterForm}
                form={registerForm}
                isSaving={isSaving}
                onOpenChange={setShowRegisterForm}
                onChange={setRegisterForm}
                onSubmit={() => void handleRegisterUser()}
                onCancel={() => {
                    setRegisterForm(emptyRegisterForm);
                    setShowRegisterForm(false);
                }}
            />

            <CustomerTable users={users} isLoading={isLoading} isSaving={isSaving} onViewDetail={(user) => void handleViewCustomerDetail(user)} onEdit={openEditDialog} onToggleStatus={(userId, status) => void handleToggleStatus(userId, status)} />

            <CustomerDetailDialog customer={viewingCustomer} isLoading={isDetailLoading} onClose={() => setViewingCustomer(null)} />

            <EditUserDialog
                editingUser={editingUser}
                isSaving={isSaving}
                form={editForm}
                onChange={setEditForm}
                onChangeStatus={setEditStatus}
                onSave={() => void handleEditUser()}
                onClose={() => {
                    setEditingUser(null);
                    setEditForm(emptyEditForm);
                }}
            />
        </AdminPageShell>
    );
}
