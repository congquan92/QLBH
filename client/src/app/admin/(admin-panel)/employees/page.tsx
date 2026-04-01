"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { JobHistoryApi } from "@/api/admin/job-history.api";
import { UserApi } from "@/api/user.api";
import { RbacApi } from "@/api/admin/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Position } from "@/types/admin-crud";
import type { RbacRole } from "@/types/rbac";
import type { UserProfile } from "@/types/user";
import { Plus, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { CreateEmployeeDialog, emptyCreateForm, type CreateEmployeeFormData } from "./_components/create-employee-dialog";
import { EditEmployeeDialog } from "./_components/edit-employee-dialog";
import { EmployeeDetailDialog } from "./_components/employee-detail-dialog";
import { EmployeeTable } from "./_components/employee-table";
import { PromoteEmployeeDialog } from "./_components/promote-employee-dialog";
import { BonusEmployeeDialog } from "./_components/bonus-employee-dialog";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<UserProfile[]>([]);
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Create dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateEmployeeFormData>(emptyCreateForm);

    // Edit dialog
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [editRoleId, setEditRoleId] = useState("");
    const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

    // Detail dialog
    const [detailUser, setDetailUser] = useState<UserProfile | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Promote dialog
    const [promotingUser, setPromotingUser] = useState<UserProfile | null>(null);
    const [promotePositionId, setPromotePositionId] = useState("");
    const [promoteEmploymentType, setPromoteEmploymentType] = useState("");
    const [promoteEffectiveDate, setPromoteEffectiveDate] = useState("");

    // Bonus dialog
    const [bonusUser, setBonusUser] = useState<UserProfile | null>(null);

    const employeeRoles = roles.filter((role) => String(role.name).toUpperCase() !== "USER");

    function inferEmploymentTypeFromPositionId(positionId: string): "FULL_TIME" | "PART_TIME" {
        const selected = positions.find((pos) => String(pos.id) === positionId);
        const normalized = String(selected?.name ?? "").toLowerCase();
        if (normalized.includes("part time") || normalized.includes("part-time") || normalized.includes("bán thời gian")) {
            return "PART_TIME";
        }
        return "FULL_TIME";
    }

    const fetchEmployees = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes, positionsRes] = await Promise.all([
                UserApi.getUsers({ page: 1, size: 200, sort: "id:desc", hasUserRole: false }),
                RbacApi.getRoles({ page: 1, size: 100, sort: "id:asc" }),
                AdminCrudApi.getPositions({ page: 1, size: 100, sort: "id:asc" }),
            ]);

            setEmployees(usersRes.data.data ?? []);

            // RbacApi.getRoles returns res.data = { data: [...], pageNumber, ... }
            const rolesBody = rolesRes as { data?: unknown[] } | unknown[] | null;
            const normalizedRoles: RbacRole[] = Array.isArray(rolesBody)
                ? (rolesBody as RbacRole[])
                : Array.isArray((rolesBody as { data?: unknown })?.data)
                    ? ((rolesBody as { data: RbacRole[] }).data ?? [])
                    : [];
            setRoles(normalizedRoles);

            setPositions(positionsRes.data.data ?? []);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải danh sách nhân viên.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchEmployees();
    }, [fetchEmployees]);

    // ── Create ────────────────────────────────────────────────────────────────
    async function handleCreateEmployee() {
        if (!createForm.fullName.trim() || !createForm.username.trim() || !createForm.password.trim()) {
            toast.error("Vui lòng nhập họ tên, username và mật khẩu.");
            return;
        }
        if (!createForm.roleId || !createForm.positionId || !createForm.dateOfBirth || !createForm.email || !createForm.phone) {
            toast.error("Vui lòng nhập đủ thông tin bắt buộc.");
            return;
        }

        const selectedRole = employeeRoles.find((role) => role.id === Number(createForm.roleId));
        if (!selectedRole) {
            toast.error("Vui lòng chọn vai trò hợp lệ.");
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
                employmentType: inferEmploymentTypeFromPositionId(createForm.positionId),
            });
            toast.success("Tạo nhân viên thành công.");
            setCreateForm(emptyCreateForm);
            setCreateDialogOpen(false);
            await fetchEmployees();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Tạo nhân viên thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    // ── Edit ──────────────────────────────────────────────────────────────────
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

    // ── Toggle status ──────────────────────────────────────────────────────────
    async function handleToggleStatus(userId: number, currentStatus: string) {
        const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        setIsSaving(true);
        try {
            await UserApi.updateUserStatus(userId, { status: nextStatus });
            toast.success(nextStatus === "ACTIVE" ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");
            await fetchEmployees();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Cập nhật trạng thái thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    // ── Detail ─────────────────────────────────────────────────────────────────
    function openDetailDialog(user: UserProfile) {
        setDetailUser(user);
        setDetailDialogOpen(true);
    }

    // ── Promote ───────────────────────────────────────────────────────────────
    function openPromoteDialog(user: UserProfile) {
        setPromotingUser(user);
        // Pre-fill with current position & employment type
        const currentPositionId = user.positionResponse?.id ? String(user.positionResponse.id) : "";
        setPromotePositionId(currentPositionId);
        setPromoteEmploymentType(inferEmploymentTypeFromPositionId(currentPositionId));
        setPromoteEffectiveDate("");
    }

    function closePromoteDialog() {
        setPromotingUser(null);
        setPromotePositionId("");
        setPromoteEmploymentType("");
        setPromoteEffectiveDate("");
    }

    async function handlePromoteEmployee() {
        if (!promotingUser) return;
        if (!promotePositionId || !promoteEmploymentType || !promoteEffectiveDate) {
            toast.error("Vui lòng nhập đầy đủ thông tin thăng chức.");
            return;
        }

        setIsSaving(true);
        try {
            await JobHistoryApi.promote(promotingUser.id, {
                position_id: Number(promotePositionId),
                employment_type: inferEmploymentTypeFromPositionId(promotePositionId),
                effective_date: promoteEffectiveDate,
            });
            toast.success("Thăng chức / điều chuyển thành công!");
            closePromoteDialog();
            await fetchEmployees();
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Thăng chức thất bại.";
            // Try to extract validation errors from Laravel response
            const axiosErr = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            if (axiosErr?.response?.data?.message) {
                toast.error(axiosErr.response.data.message);
            } else {
                toast.error(errMsg);
            }
        } finally {
            setIsSaving(false);
        }
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    const activeCount = employees.filter((e) => String(e.status ?? "ACTIVE") === "ACTIVE").length;
    const fullTimeCount = employees.filter((e) => {
        const et = (e as { employmentType?: unknown; employment_type?: unknown }).employmentType
            ?? (e as { employmentType?: unknown; employment_type?: unknown }).employment_type;
        return String(et ?? "").toUpperCase() === "FULL_TIME";
    }).length;

    return (
        <AdminPageShell
            title="Quản lý nhân viên"
            description="Xem, thêm và quản lý tài khoản nội bộ"
        >
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tổng nhân viên</p>
                            <p className="text-2xl font-bold">{isLoading ? "-" : employees.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Đang làm việc</p>
                            <p className="text-2xl font-bold text-green-600">{isLoading ? "-" : activeCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Full-time</p>
                            <p className="text-2xl font-bold text-blue-600">{isLoading ? "-" : fullTimeCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main table */}
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base">Danh sách nhân viên</CardTitle>
                        <CardDescription>
                            {employees.length} nhân viên
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => void fetchEmployees()}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                        <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => {
                                setCreateForm(emptyCreateForm);
                                setCreateDialogOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Thêm nhân viên
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 pb-1">
                    <EmployeeTable
                        users={employees}
                        roles={employeeRoles}
                        isLoading={isLoading}
                        isSaving={isSaving}
                        onEdit={openEditDialog}
                        onViewDetail={openDetailDialog}
                        onPromote={openPromoteDialog}
                        onBonus={(user) => setBonusUser(user)}
                        onToggleStatus={(userId, status) => void handleToggleStatus(userId, status)}
                    />
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <CreateEmployeeDialog
                open={createDialogOpen}
                form={createForm}
                roles={employeeRoles}
                positions={positions}
                isSaving={isSaving}
                onOpenChange={(open) => {
                    setCreateDialogOpen(open);
                    if (!open) setCreateForm(emptyCreateForm);
                }}
                onChange={setCreateForm}
                onSubmit={() => void handleCreateEmployee()}
                onCancel={() => {
                    setCreateForm(emptyCreateForm);
                    setCreateDialogOpen(false);
                }}
            />

            {/* Edit Dialog */}
            <EditEmployeeDialog
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

            {/* Detail Dialog */}
            <EmployeeDetailDialog
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open);
                    if (!open) setDetailUser(null);
                }}
                user={detailUser}
                positions={positions}
            />

            {/* Promote Dialog */}
            <PromoteEmployeeDialog
                user={promotingUser}
                positions={positions}
                isSaving={isSaving}
                positionId={promotePositionId}
                employmentType={promoteEmploymentType}
                effectiveDate={promoteEffectiveDate}
                onChangePosition={(nextPositionId) => {
                    setPromotePositionId(nextPositionId);
                    setPromoteEmploymentType(inferEmploymentTypeFromPositionId(nextPositionId));
                }}
                onChangeEmploymentType={setPromoteEmploymentType}
                onChangeEffectiveDate={setPromoteEffectiveDate}
                onSave={() => void handlePromoteEmployee()}
                onClose={closePromoteDialog}
            />

            {/* Bonus Dialog */}
            <BonusEmployeeDialog
                user={bonusUser}
                onClose={() => setBonusUser(null)}
            />
        </AdminPageShell>
    );
}
