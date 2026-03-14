"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { UserApi } from "@/api/user.api";
import { RbacApi } from "@/api/admin/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Loader2, Mail, Phone, Shield, UserCheck, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/types/user";
import type { RbacRole } from "@/types/rbac";

type CreateEmployeeForm = {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
};

const emptyForm: CreateEmployeeForm = {
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
};

function getEmployeeRoleLabel(employee: UserProfile) {
    const roleName = (employee as { roleName?: unknown }).roleName;
    if (typeof roleName === "string" && roleName.trim()) {
        return roleName;
    }

    const role = (employee as { role?: unknown }).role;
    if (typeof role === "string" && role.trim()) {
        return role;
    }

    if (role && typeof role === "object") {
        const roleObject = role as { name?: unknown; title?: unknown; code?: unknown };
        if (typeof roleObject.name === "string" && roleObject.name.trim()) return roleObject.name;
        if (typeof roleObject.title === "string" && roleObject.title.trim()) return roleObject.title;
        if (typeof roleObject.code === "string" && roleObject.code.trim()) return roleObject.code;
    }

    const roles = (employee as { roles?: unknown }).roles;
    if (Array.isArray(roles)) {
        const names = roles
            .map((item) => {
                if (typeof item === "string") return item;
                if (item && typeof item === "object") {
                    const normalized = item as { name?: unknown; title?: unknown; code?: unknown };
                    if (typeof normalized.name === "string") return normalized.name;
                    if (typeof normalized.title === "string") return normalized.title;
                    if (typeof normalized.code === "string") return normalized.code;
                }
                return "";
            })
            .map((name) => name.trim())
            .filter((name) => name.length > 0);

        if (names.length > 0) {
            return names.join(", ");
        }
    }

    return "-";
}

export default function EmployeesPage() {
    const { hasPermission } = useAdminAuth();
    const [employees, setEmployees] = useState<UserProfile[]>([]);
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CreateEmployeeForm>(emptyForm);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");

    const canViewUsers = hasPermission("VIEW_USERS");
    const canCreateUser = hasPermission("CREATE_USER");
    const canAssignRole = hasPermission("ASSIGN_ROLE");
    const canAssignStatus = hasPermission("ASSIGN_STATUS");

    const fetchEmployees = useCallback(async () => {
        if (!canViewUsers) {
            setEmployees([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([UserApi.getUsers({ page: 1, size: 100, sort: "id:desc" }), canAssignRole ? RbacApi.getRoles({ page: 1, size: 50 }) : Promise.resolve(null)]);
            setEmployees(usersRes.data.data);
            if (rolesRes) {
                setRoles(rolesRes.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setIsLoading(false);
        }
    }, [canAssignRole, canViewUsers]);

    useEffect(() => {
        void fetchEmployees();
    }, [fetchEmployees]);

    function resetForm() {
        setForm(emptyForm);
        setShowForm(false);
    }

    async function submitEmployee() {
        if (!form.username.trim() || !form.password.trim() || !form.fullName.trim()) {
            toast.error("Vui lòng nhập đủ username, mật khẩu và họ tên.");
            return;
        }

        setIsSaving(true);
        try {
            await UserApi.createUser({
                username: form.username.trim(),
                password: form.password.trim(),
                fullName: form.fullName.trim(),
                email: form.email.trim() || undefined,
                phone: form.phone.trim() || undefined,
            });
            toast.success("Tạo nhân viên thành công.");
            resetForm();
            await fetchEmployees();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleUpdateRole(userId: number) {
        if (!selectedRoleId) {
            toast.error("Vui lòng chọn vai trò.");
            return;
        }

        setIsSaving(true);
        try {
            await UserApi.updateRoleUser(userId, { roleId: Number(selectedRoleId) });
            toast.success("Cập nhật vai trò thành công.");
            setSelectedRoleId("");
            await fetchEmployees();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggleStatus(userId: number, currentStatus: string) {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        setIsSaving(true);
        try {
            await UserApi.updateUserStatus(userId, { status: newStatus });
            toast.success(`Đã ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} tài khoản.`);
            await fetchEmployees();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    const filteredEmployees = searchKeyword.trim()
        ? employees.filter(
              (e) =>
                  String(e.fullName ?? e.username ?? "")
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase()) ||
                  String(e.email ?? "")
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase()),
          )
        : employees;

    return (
        <AdminPageShell title="Nhân viên" description="Quản lý hồ sơ nhân viên và trạng thái làm việc" requiredPermissions={["VIEW_USERS"]}>
            {/* Create Employee Form */}
            {canCreateUser && (
                <Card className="mb-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Tạo nhân viên mới</CardTitle>
                            <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm(!showForm)}>
                                {showForm ? (
                                    "Đóng"
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {showForm && (
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label>Username *</Label>
                                    <Input value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="Nhập username" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mật khẩu *</Label>
                                    <Input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Nhập mật khẩu" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Họ tên *</Label>
                                    <Input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Nhập họ tên" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số điện thoại</Label>
                                    <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="0123456789" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => void submitEmployee()} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Tạo nhân viên
                                </Button>
                                <Button variant="outline" onClick={resetForm}>
                                    Hủy
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Employee List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Danh sách nhân viên</CardTitle>
                            <CardDescription>{filteredEmployees.length} nhân viên</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Tìm kiếm nhân viên..." className="pl-8 w-62.5" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải danh sách nhân viên...
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted">
                                    <tr>
                                        <th className="px-6 py-3">Nhân viên</th>
                                        <th className="px-6 py-3">Liên hệ</th>
                                        <th className="px-6 py-3">Vai trò</th>
                                        <th className="px-6 py-3">Trạng thái</th>
                                        <th className="px-6 py-3">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((emp) => {
                                        const status = String(emp.status ?? "ACTIVE");
                                        return (
                                            <tr key={emp.id} className="border-b hover:bg-muted/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={`/avatars/${emp.id}.png`} alt={String(emp.fullName ?? emp.username ?? "U")} />
                                                            <AvatarFallback>{String(emp.fullName ?? emp.username ?? "U").charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{String(emp.fullName ?? emp.username ?? "Unknown")}</div>
                                                            <div className="text-xs text-muted-foreground">ID: #{emp.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Mail className="h-3 w-3" />
                                                            {String(emp.email ?? "-")}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Phone className="h-3 w-3" />
                                                            {String(emp.phone ?? "-")}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{getEmployeeRoleLabel(emp)}</span>
                                                    </div>
                                                    {canAssignRole && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <select className="h-7 rounded border border-input bg-background px-2 text-xs" value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
                                                                <option value="">Chọn vai trò</option>
                                                                {roles.map((role) => (
                                                                    <option key={role.id} value={String(role.id)}>
                                                                        {String(role.name)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => void handleUpdateRole(emp.id)} disabled={isSaving || !selectedRoleId}>
                                                                Gán
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            status === "ACTIVE" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {canAssignStatus && (
                                                            <Button variant="outline" size="sm" onClick={() => void handleToggleStatus(emp.id, status)} disabled={isSaving} title={status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}>
                                                                {status === "ACTIVE" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredEmployees.length === 0 && !isLoading && (
                                        <tr>
                                            <td className="px-6 py-8 text-muted-foreground" colSpan={5}>
                                                Không có dữ liệu nhân viên.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
