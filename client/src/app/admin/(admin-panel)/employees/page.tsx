"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";

import { UserApi } from "@/api/user.api";
import { RbacApi } from "@/api/admin/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import type { Position } from "@/types/admin-crud";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/types/user";
import type { RbacRole } from "@/types/rbac";
import { CreateUserForm, CreateUserFormData } from "@/app/admin/(admin-panel)/employees/_components/CreateUserForm";
import { UserTable } from "@/app/admin/(admin-panel)/employees/_components/UserTable";
import { EditUserDialog } from "@/app/admin/(admin-panel)/employees/_components/EditUserDialog";

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

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<UserProfile[]>([]);
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserFormData>(emptyCreateForm);

    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [editRoleId, setEditRoleId] = useState("");
    const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

    const employeeRoles = roles.filter((role) => String(role.name).toUpperCase() !== "USER");

    const fetchEmployees = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes, positionsRes] = await Promise.all([
                UserApi.getUsers({ page: 1, size: 200, sort: "id:desc", hasUserRole: false }),
                RbacApi.getRoles({ page: 1, size: 100, sort: "id:asc" }),
                AdminCrudApi.getPositions({ page: 1, size: 100, sort: "id:asc" }),
            ]);

            setEmployees(usersRes.data.data ?? []);

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

            setPositions(positionsRes.data.data ?? []);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể tải danh sách nhân viên.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchEmployees();
    }, [fetchEmployees]);

    async function handleCreateEmployee() {
        if (!createForm.fullName.trim() || !createForm.username.trim() || !createForm.password.trim()) {
            toast.error("Vui lòng nhập đủ họ tên, username và mật khẩu.");
            return;
        }
        if (!createForm.roleId || !createForm.positionId || !createForm.dateOfBirth || !createForm.email || !createForm.phone) {
            toast.error("Vui lòng nhập đủ thông tin bắt buộc để tạo nhân viên.");
            return;
        }

        const selectedRole = employeeRoles.find((role) => role.id === Number(createForm.roleId));
        if (!selectedRole) {
            toast.error("Vui lòng chọn vai trò nhân viên hợp lệ.");
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
            toast.success("Tạo nhân viên thành công.");
            setCreateForm(emptyCreateForm);
            setShowCreateForm(false);
            await fetchEmployees();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Tạo nhân viên thất bại.");
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

    async function handleEditEmployee() {
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

            toast.success("Đã cập nhật nhân viên.");
            setEditingUser(null);
            await fetchEmployees();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Cập nhật nhân viên thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggleStatus(userId: number, currentStatus: string) {
        const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        setIsSaving(true);
        try {
            await UserApi.updateUserStatus(userId, { status: nextStatus });
            toast.success(nextStatus === "ACTIVE" ? "Đã mở nhân viên." : "Đã khóa nhân viên.");
            await fetchEmployees();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Cập nhật trạng thái thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Quản lý nhân viên" description="Giao diện giống quản lý khách hàng, chỉ hiển thị tài khoản nhân viên">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-md font-semibold">Danh sách nhân viên ({employees.length})</h2>
                <Button variant={showCreateForm ? "outline" : "default"} onClick={() => setShowCreateForm((prev) => !prev)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm nhân viên
                </Button>
            </div>

            <CreateUserForm
                open={showCreateForm}
                form={createForm}
                roles={employeeRoles}
                positions={positions}
                isSaving={isSaving}
                onOpenChange={setShowCreateForm}
                onChange={setCreateForm}
                onSubmit={() => void handleCreateEmployee()}
                onCancel={() => {
                    setCreateForm(emptyCreateForm);
                    setShowCreateForm(false);
                }}
            />

            <UserTable users={employees} roles={employeeRoles} isLoading={isLoading} isSaving={isSaving} onEdit={openEditDialog} onToggleStatus={(userId, status) => void handleToggleStatus(userId, status)} />

            <EditUserDialog
                editingUser={editingUser}
                roles={employeeRoles}
                isSaving={isSaving}
                editRoleId={editRoleId}
                editStatus={editStatus}
                onChangeRole={setEditRoleId}
                onChangeStatus={setEditStatus}
                onSave={() => void handleEditEmployee()}
                onClose={() => setEditingUser(null)}
            />
        </AdminPageShell>
    );
}
