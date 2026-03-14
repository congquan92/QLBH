"use client";

import { RbacApi } from "@/api/admin/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { RbacGroupPermission, RbacGroupPermissionPayload } from "@/types/rbac";

type GroupForm = {
    id?: number;
    name: string;
    description: string;
    url: string;
    icon: string;
    status: string;
    permissionIdsText: string;
};

const emptyForm: GroupForm = {
    name: "",
    description: "",
    url: "",
    icon: "",
    status: "ACTIVE",
    permissionIdsText: "",
};

function parsePermissionIds(value: string) {
    return value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item) && item > 0);
}

export default function GroupPermissionsPage() {
    const [groups, setGroups] = useState<RbacGroupPermission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<GroupForm>(emptyForm);

    const knownPermissionIds = useMemo(() => {
        const ids = new Set<number>();
        for (const group of groups) {
            for (const permission of group.permissions ?? []) {
                ids.add(permission.id);
            }
        }
        return Array.from(ids).sort((a, b) => a - b);
    }, [groups]);

    async function fetchGroups() {
        setIsLoading(true);
        const response = await RbacApi.getGroupPermissions({ page: 1, size: 100, sort: "id:desc" });
        setGroups(response.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchGroups();
    }, []);

    function startEdit(group: RbacGroupPermission) {
        setForm({
            id: group.id,
            name: group.name,
            description: group.description ?? "",
            url: group.url ?? "",
            icon: group.icon ?? "",
            status: group.status ?? "ACTIVE",
            permissionIdsText: (group.permissions ?? []).map((permission) => permission.id).join(","),
        });
    }

    function resetForm() {
        setForm(emptyForm);
    }

    async function submitGroup() {
        if (!form.name.trim()) {
            toast.error("Tên nhóm quyền không được để trống.");
            return;
        }

        const permissionIds = parsePermissionIds(form.permissionIdsText);
        if (!form.id && permissionIds.length === 0) {
            toast.error("Tạo mới yêu cầu ít nhất một permission ID.");
            return;
        }

        const payload: RbacGroupPermissionPayload = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            url: form.url.trim() || undefined,
            icon: form.icon.trim() || undefined,
            status: form.status,
            permission_ids: permissionIds,
        };

        setIsSaving(true);
        try {
            if (form.id) {
                await RbacApi.updateGroupPermission(form.id, payload);
                toast.success("Cập nhật nhóm quyền thành công.");
            } else {
                await RbacApi.createGroupPermission(payload);
                toast.success("Tạo nhóm quyền thành công.");
            }
            resetForm();
            await fetchGroups();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Thao tác nhóm quyền thất bại.";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function removeGroup(id: number) {
        setIsSaving(true);
        try {
            await RbacApi.deleteGroupPermission(id);
            toast.success("Xóa nhóm quyền thành công.");
            if (form.id === id) {
                resetForm();
            }
            await fetchGroups();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Xóa nhóm quyền thất bại.";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Nhóm quyền" description="CRUD nhóm permission theo trang/chức năng" requiredPermissions={["VIEW_PERMISSION_GROUPS"]}>
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật nhóm quyền" : "Tạo nhóm quyền"}</CardTitle>
                        <CardDescription>Permission IDs nhập dạng `1,2,3`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Tên nhóm</Label>
                            <Input id="group-name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-description">Mô tả</Label>
                            <Input id="group-description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-url">URL</Label>
                            <Input id="group-url" value={form.url} onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="/admin/roles" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-icon">Icon</Label>
                            <Input id="group-icon" value={form.icon} onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))} placeholder="Shield" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-status">Trạng thái</Label>
                            <select id="group-status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-permission-ids">Permission IDs</Label>
                            <Input id="group-permission-ids" value={form.permissionIdsText} onChange={(e) => setForm((prev) => ({ ...prev, permissionIdsText: e.target.value }))} placeholder="1,2,3" />
                            {knownPermissionIds.length > 0 && <p className="text-xs text-muted-foreground">ID có sẵn: {knownPermissionIds.join(", ")}</p>}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitGroup()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {form.id ? "Lưu" : "Tạo"}
                            </Button>
                            {form.id && (
                                <Button variant="outline" onClick={resetForm}>
                                    Hủy
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Danh sách nhóm quyền</CardTitle>
                        <CardDescription>Tổng số nhóm: {groups.length}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải nhóm quyền...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {groups.map((group) => (
                                    <div key={group.id} className="rounded-md border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <KeyRound className="h-4 w-4" />
                                                    {group.name}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{group.description || "Không có mô tả"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    URL: {group.url || "-"} | Status: {group.status || "-"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">Permissions: {(group.permissions ?? []).map((permission) => permission.name).join(", ") || "-"}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEdit(group)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void removeGroup(group.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {groups.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu nhóm quyền.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
