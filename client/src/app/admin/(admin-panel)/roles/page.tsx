"use client";

import { RbacApi } from "@/api/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { RbacPageCatalogItem, RbacRole, RbacRolePayload } from "@/types/rbac";

type RoleFormState = {
    id?: number;
    name: string;
    description: string;
    status: string;
    pageIds: number[];
};

const emptyForm: RoleFormState = {
    name: "",
    description: "",
    status: "ACTIVE",
    pageIds: [],
};

export default function RolesPage() {
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [pages, setPages] = useState<RbacPageCatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<RoleFormState>(emptyForm);

    const pageCatalog = useMemo(() => {
        const map = new Map<number, RbacPageCatalogItem>();

        for (const page of pages) {
            map.set(page.id, page);
        }

        for (const role of roles) {
            for (const page of role.page ?? []) {
                map.set(page.id, {
                    id: page.id,
                    title: page.title,
                    icon: page.icon,
                    sort_order: page.sort_order,
                    items: page.items,
                });
            }
        }

        return Array.from(map.values()).sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
    }, [pages, roles]);

    const rolePageIdSet = useMemo(() => {
        const map = new Map<number, Set<number>>();
        for (const role of roles) {
            map.set(role.id, new Set((role.page ?? []).map((page) => page.id)));
        }
        return map;
    }, [roles]);

    async function fetchAll() {
        setIsLoading(true);
        const [roleRes, pageRes] = await Promise.all([RbacApi.getRoles({ page: 1, size: 100, sort: "id:asc" }), RbacApi.getPages({ page: 1, size: 200, sort: "sort_order:asc" })]);
        setRoles(roleRes.data.data);
        setPages(pageRes.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchAll();
    }, []);

    function togglePage(pageId: number) {
        setForm((prev) => {
            const next = new Set(prev.pageIds);
            if (next.has(pageId)) {
                next.delete(pageId);
            } else {
                next.add(pageId);
            }
            return { ...prev, pageIds: Array.from(next) };
        });
    }

    function startEdit(role: RbacRole) {
        setForm({
            id: role.id,
            name: role.name,
            description: role.description ?? "",
            status: role.status ?? "ACTIVE",
            pageIds: (role.page ?? []).map((page) => page.id),
        });
    }

    function resetForm() {
        setForm(emptyForm);
    }

    async function submitRole() {
        if (!form.name.trim()) {
            toast.error("Tên vai trò không được để trống.");
            return;
        }

        const payload: RbacRolePayload = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            status: form.status,
            page_ids: form.pageIds,
        };

        setIsSaving(true);
        try {
            if (form.id) {
                await RbacApi.updateRole(form.id, payload);
                toast.success("Cập nhật vai trò thành công.");
            } else {
                await RbacApi.createRole(payload);
                toast.success("Tạo vai trò thành công.");
            }
            resetForm();
            await fetchAll();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Thao tác vai trò thất bại.";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function removeRole(roleId: number) {
        setIsSaving(true);
        try {
            await RbacApi.deleteRole(roleId);
            toast.success("Xóa vai trò thành công.");
            if (form.id === roleId) {
                resetForm();
            }
            await fetchAll();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Xóa vai trò thất bại.";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Vai trò & Quyền" description="Quản lý vai trò và phạm vi quyền của từng nhóm người dùng" requiredPermissions={["VIEW_ROLES"]}>
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật vai trò" : "Tạo vai trò mới"}</CardTitle>
                        <CardDescription>Chọn trang được phép truy cập bằng checkbox</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Tên vai trò</Label>
                            <Input id="role-name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="VD: QUẢN LÝ KHO" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role-description">Mô tả</Label>
                            <Input id="role-description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Mô tả ngắn" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role-status">Trạng thái</Label>
                            <select id="role-status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Trang được phép truy cập</Label>
                            <div className="max-h-60 space-y-2 overflow-auto rounded-md border p-2">
                                {pageCatalog.map((page) => (
                                    <label key={page.id} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={form.pageIds.includes(page.id)} onChange={() => togglePage(page.id)} />
                                        <span>{page.title}</span>
                                    </label>
                                ))}
                                {pageCatalog.length === 0 && <p className="text-sm text-muted-foreground">Không tìm thấy catalog trang để gán quyền.</p>}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => void submitRole()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {form.id ? "Lưu cập nhật" : "Tạo vai trò"}
                            </Button>
                            {form.id && (
                                <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                                    Hủy chỉnh sửa
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Bảng quyền theo vai trò</CardTitle>
                        <CardDescription>Đánh dấu checkbox thể hiện role có quyền truy cập trang tương ứng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải dữ liệu vai trò...
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            <th className="px-3 py-2 text-left">Role</th>
                                            {pageCatalog.map((page) => (
                                                <th key={page.id} className="px-3 py-2 text-center whitespace-nowrap">
                                                    {page.title}
                                                </th>
                                            ))}
                                            <th className="px-3 py-2 text-center">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((role) => (
                                            <tr key={role.id} className="border-b">
                                                <td className="px-3 py-2 align-top">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        {role.name}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">{role.description || "Không có mô tả"}</p>
                                                </td>
                                                {pageCatalog.map((page) => (
                                                    <td key={page.id} className="px-3 py-2 text-center">
                                                        <input type="checkbox" checked={rolePageIdSet.get(role.id)?.has(page.id) ?? false} readOnly />
                                                    </td>
                                                ))}
                                                <td className="px-3 py-2">
                                                    <div className="flex justify-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => startEdit(role)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => void removeRole(role.id)} disabled={isSaving}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {roles.length === 0 && (
                                            <tr>
                                                <td colSpan={pageCatalog.length + 2} className="px-3 py-8 text-center text-muted-foreground">
                                                    Không có dữ liệu vai trò.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
