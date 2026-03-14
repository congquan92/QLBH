"use client";

import { AuthApi } from "@/api/auth";
import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { RbacApi } from "@/api/admin/rbac.api";
import { UserApi } from "@/api/user.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import type { Position } from "@/types/admin-crud";
import type { RbacRole } from "@/types/rbac";
import type { UserProfile } from "@/types/user";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CreateUserFormData } from "./_components/CreateUserForm";
import { CreateUserForm } from "./_components/CreateUserForm";
import { EditUserDialog } from "./_components/EditUserDialog";
import type { RegisterFormData } from "./_components/RegisterUserForm";
import { RegisterUserForm } from "./_components/RegisterUserForm";
import { UserTable } from "./_components/UserTable";
import { UsersToolbar } from "./_components/UsersToolbar";

const emptyCreateForm: CreateUserFormData = {
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

export default function CustomersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);

    const [createForm, setCreateForm] = useState<CreateUserFormData>(emptyCreateForm);
    const [registerForm, setRegisterForm] = useState<RegisterFormData>(emptyRegisterForm);

    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [editRoleId, setEditRoleId] = useState("");
    const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes, positionsRes] = await Promise.all([
                UserApi.getUsers({ page: 1, size: 200, sort: "id:desc" }),
                RbacApi.getRoles({ page: 1, size: 100, sort: "id:asc" }),
                AdminCrudApi.getPositions({ page: 1, size: 100, sort: "id:asc" }),
            ]);

            setUsers(usersRes.data.data ?? []);

            if (rolesRes) {
                const rawRoles = rolesRes as unknown;
                const normalizedRoles = Array.isArray(rawRoles)
                    ? rawRoles
                    : Array.isArray((rawRoles as { data?: unknown })?.data)
                      ? ((rawRoles as { data: unknown[] }).data ?? [])
                      : Array.isArray((rawRoles as { data?: { data?: unknown } })?.data?.data)
                        ? ((rawRoles as { data: { data: unknown[] } }).data.data ?? [])
                        : [];
                setRoles(normalizedRoles as RbacRole[]);
            }

            if (positionsRes) {
                setPositions(positionsRes.data.data ?? []);
            }
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

    async function handleCreateUser() {
        if (!createForm.fullName.trim() || !createForm.username.trim() || !createForm.password.trim()) {
            toast.error("Vui lòng nhập đủ họ tên, username và mật khẩu.");
            return;
        }
        if (!createForm.roleId || !createForm.positionId || !createForm.dateOfBirth || !createForm.email || !createForm.phone) {
            toast.error("Vui lòng nhập đủ thông tin bắt buộc để tạo user.");
            return;
        }

        setIsSaving(true);
        try {
            await UserApi.createUser({
                fullName: createForm.fullName.trim(),
                username: createForm.username.trim(),
                password: createForm.password,
                email: createForm.email.trim(),
                phone: createForm.phone.trim(),
                gender: createForm.gender,
                dateOfBirth: createForm.dateOfBirth,
                roleId: Number(createForm.roleId),
                positionId: Number(createForm.positionId),
                employmentType: createForm.employmentType,
            });
            toast.success("Đã thêm user thành công.");
            setCreateForm(emptyCreateForm);
            setShowCreateForm(false);
            await fetchUsers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Thêm user thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

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
        setEditingUser(user);
        const role = (user as { role?: unknown }).role;
        const roleId = role && typeof role === "object" ? ((role as { id?: unknown }).id ?? null) : null;
        setEditRoleId(typeof roleId === "number" ? String(roleId) : "");
        setEditStatus(String(user.status ?? "ACTIVE") === "INACTIVE" ? "INACTIVE" : "ACTIVE");
    }

    async function handleEditUser() {
        if (!editingUser) return;

        const role = (editingUser as { role?: unknown }).role;
        const currentRoleId = role && typeof role === "object" ? ((role as { id?: unknown }).id ?? null) : null;
        const currentStatus = String(editingUser.status ?? "ACTIVE");

        const needRoleUpdate = Boolean(editRoleId) && Number(editRoleId) !== currentRoleId;
        const needStatusUpdate = editStatus !== currentStatus;

        if (!needRoleUpdate && !needStatusUpdate) {
            toast.info("Không có thay đổi để cập nhật.");
            return;
        }

        setIsSaving(true);
        try {
            if (needRoleUpdate) await UserApi.updateRoleUser(editingUser.id, { roleId: Number(editRoleId) });
            if (needStatusUpdate) await UserApi.updateUserStatus(editingUser.id, { status: editStatus });

            toast.success("Đã cập nhật user.");
            setEditingUser(null);
            await fetchUsers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Cập nhật user thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Quản lý user" description="Thêm, đăng ký, sửa role và khóa/mở user">
            <UsersToolbar totalCount={users.length} showCreateForm={showCreateForm} showRegisterForm={showRegisterForm} onToggleCreateForm={() => setShowCreateForm((prev) => !prev)} onToggleRegisterForm={() => setShowRegisterForm((prev) => !prev)} />

            <CreateUserForm
                open={showCreateForm}
                form={createForm}
                roles={roles}
                positions={positions}
                isSaving={isSaving}
                onOpenChange={setShowCreateForm}
                onChange={setCreateForm}
                onSubmit={() => void handleCreateUser()}
                onCancel={() => {
                    setCreateForm(emptyCreateForm);
                    setShowCreateForm(false);
                }}
            />

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

            <UserTable users={users} roles={roles} isLoading={isLoading} isSaving={isSaving} onEdit={openEditDialog} onToggleStatus={(userId, status) => void handleToggleStatus(userId, status)} />

            <EditUserDialog
                editingUser={editingUser}
                roles={roles}
                isSaving={isSaving}
                editRoleId={editRoleId}
                editStatus={editStatus}
                onChangeRole={setEditRoleId}
                onChangeStatus={setEditStatus}
                onSave={() => void handleEditUser()}
                onClose={() => setEditingUser(null)}
            />
        </AdminPageShell>
    );
}
