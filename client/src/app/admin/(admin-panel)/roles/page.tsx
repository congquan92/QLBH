"use client";

import { RbacApi } from "@/api/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, Loader2, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { RbacPageCatalogItem, RbacRole, RbacRolePayload } from "@/types/rbac";

type RoleFormState = {
    id?: number;
    name: string;
    description: string;
    status: string;
};

const emptyForm: RoleFormState = {
    name: "",
    description: "",
    status: "ACTIVE",
};

export default function RolesPage() {
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [pages, setPages] = useState<RbacPageCatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<RoleFormState>(emptyForm);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const pageCatalog = useMemo(() => {
        const map = new Map<number, RbacPageCatalogItem>();
        for (const page of pages) {
            map.set(page.id, page);
        }
        for (const role of roles) {
            for (const page of role.page ?? []) {
                if (!map.has(page.id)) {
                    map.set(page.id, { id: page.id, title: page.title, icon: page.icon, sort_order: page.sort_order, items: page.items });
                }
            }
        }
        return Array.from(map.values()).sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
    }, [pages, roles]);

    const rolePageIdSet = useMemo(() => {
        const map = new Map<number, Set<number>>();
        for (const role of roles) {
            map.set(role.id, new Set((role.page ?? []).map((p) => p.id)));
        }
        return map;
    }, [roles]);

    async function fetchAll() {
        setIsLoading(true);
        try {
            const [roleRes, pageRes] = await Promise.all([RbacApi.getRoles({ page: 1, size: 100, sort: "id:asc" }), RbacApi.getPages({ page: 1, size: 200, sort: "sort_order:asc" })]);
            setRoles((roleRes as unknown as { data: RbacRole[] }).data ?? []);
            setPages((pageRes as unknown as { data: RbacPageCatalogItem[] }).data ?? []);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchAll();
    }, []);

    function openCreateDialog() {
        setForm(emptyForm);
        setDialogOpen(true);
    }

    function openEditDialog(role: RbacRole) {
        setForm({ id: role.id, name: role.name, description: role.description ?? "", status: role.status ?? "ACTIVE" });
        setDialogOpen(true);
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
            ...(form.id ? {} : { page_ids: [] }),
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
            setDialogOpen(false);
            await fetchAll();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Thao tác vai trò thất bại.";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function togglePageForRole(role: RbacRole, pageId: number) {
        const currentIds = new Set((role.page ?? []).map((p) => p.id));
        if (currentIds.has(pageId)) {
            currentIds.delete(pageId);
        } else {
            currentIds.add(pageId);
        }
        const newPageIds = Array.from(currentIds);
        // Optimistic update
        setRoles((prev) =>
            prev.map((r) => {
                if (r.id !== role.id) return r;
                const updatedPages = pageCatalog.filter((p) => newPageIds.includes(p.id)) as typeof r.page;
                return { ...r, page: updatedPages };
            }),
        );
        try {
            await RbacApi.updateRole(role.id, { name: role.name, status: role.status, page_ids: newPageIds });
        } catch {
            toast.error("Cập nhật quyền thất bại. Đang khôi phục...");
            await fetchAll();
        }
    }

    async function removeRole(roleId: number) {
        if (!confirm("Bạn có chắc muốn xóa vai trò này?")) return;
        setIsSaving(true);
        try {
            await RbacApi.deleteRole(roleId);
            toast.success("Xóa vai trò thành công.");
            await fetchAll();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Xóa vai trò thất bại.";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    function toggleExpand(pageId: number) {
        setExpanded((prev) => ({ ...prev, [pageId]: !(prev[pageId] !== false) }));
    }

    return (
        <AdminPageShell title="Vai trò & Quyền" description="Quản lý vai trò và phạm vi quyền của từng nhóm người dùng" requiredPermissions={["VIEW_ROLES"]}>
            {/* Toolbar */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {roles.length} vai trò &middot; {pageCatalog.length} trang
                </p>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo vai trò mới
                </Button>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{form.id ? "Cập nhật vai trò" : "Tạo vai trò mới"}</DialogTitle>
                        <DialogDescription>{form.id ? "Chỉnh sửa thông tin cơ bản. Phân quyền trang thực hiện trực tiếp trên bảng bên dưới." : "Nhập thông tin vai trò. Sau khi tạo, phân quyền trang trên bảng bên dưới."}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="dlg-role-name">Tên vai trò</Label>
                            <Input id="dlg-role-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="VD: QUẢN LÝ KHO" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dlg-role-desc">Mô tả</Label>
                            <Input id="dlg-role-desc" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Mô tả ngắn về vai trò" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dlg-role-status">Trạng thái</Label>
                            <select id="dlg-role-status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                            Hủy
                        </Button>
                        <Button onClick={() => void submitRole()} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {form.id ? "Lưu thay đổi" : "Tạo vai trò"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Permission Matrix Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tải dữ liệu...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="sticky left-0 z-10 min-w-60 bg-muted/50 px-4 py-3 text-left font-semibold">Trang / Nhóm quyền / Quyền</th>
                                {roles.map((role) => (
                                    <th key={role.id} className="min-w-32 border-l px-3 py-3 text-center align-top">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="flex items-center gap-1 font-medium">
                                                <Shield className="h-3.5 w-3.5 text-primary" />
                                                <span className="whitespace-nowrap">{role.name}</span>
                                            </div>
                                            <Badge variant={role.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                                                {role.status}
                                            </Badge>
                                            {role.description && <span className="max-w-28 truncate text-xs text-muted-foreground">{role.description}</span>}
                                            <div className="mt-1 flex gap-1">
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditDialog(role)} title="Chỉnh sửa">
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => void removeRole(role.id)} disabled={isSaving} title="Xóa">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pageCatalog.map((page) => {
                                const isExpanded = expanded[page.id] !== false;
                                const groups = page.items ?? [];
                                return (
                                    <React.Fragment key={page.id}>
                                        {/* PAGE row */}
                                        <tr className="border-b bg-primary/5 hover:bg-primary/10">
                                            <td className="sticky left-0 z-10 bg-primary/5 px-4 py-2.5">
                                                <button className="flex items-center gap-2 font-semibold text-foreground hover:text-primary" onClick={() => toggleExpand(page.id)}>
                                                    {groups.length > 0 ? isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" /> : <span className="w-4 shrink-0" />}
                                                    <span>{page.title}</span>
                                                    {groups.length > 0 && <span className="text-xs font-normal text-muted-foreground">({groups.length} nhóm)</span>}
                                                </button>
                                            </td>
                                            {roles.map((role) => (
                                                <td key={role.id} className="border-l px-3 py-2.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 cursor-pointer accent-primary"
                                                        checked={rolePageIdSet.get(role.id)?.has(page.id) ?? false}
                                                        onChange={() => void togglePageForRole(role, page.id)}
                                                        title={`${role.name} – ${page.title}`}
                                                    />
                                                </td>
                                            ))}
                                        </tr>

                                        {/* GROUP PERMISSION rows */}
                                        {isExpanded &&
                                            groups.map((group) => {
                                                const perms = group.permissions ?? [];
                                                return (
                                                    <React.Fragment key={group.id}>
                                                        <tr className="border-b bg-muted/10 hover:bg-muted/20">
                                                            <td className="sticky left-0 z-10 bg-muted/10 px-4 py-2">
                                                                <div className="flex items-center gap-2 pl-7 text-muted-foreground">
                                                                    <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                                                                    <span className="font-medium">{group.name}</span>
                                                                    {group.url && <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{group.url}</code>}
                                                                    {perms.length > 0 && <span className="text-xs text-muted-foreground/60">({perms.length} quyền)</span>}
                                                                </div>
                                                            </td>
                                                            {roles.map((role) => {
                                                                const hasPage = rolePageIdSet.get(role.id)?.has(page.id) ?? false;
                                                                return (
                                                                    <td key={role.id} className="border-l px-3 py-2 text-center">
                                                                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${hasPage ? "bg-green-500" : "bg-muted"}`} title={hasPage ? "Có quyền (qua trang cha)" : "Không có quyền"} />
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>

                                                        {/* PERMISSION rows */}
                                                        {perms.map((perm) => (
                                                            <tr key={perm.id} className="border-b bg-muted/5 hover:bg-muted/10">
                                                                <td className="sticky left-0 z-10 bg-muted/5 px-4 py-1.5">
                                                                    <div className="flex items-center gap-2 pl-14 text-xs text-muted-foreground">
                                                                        <span className="text-muted-foreground/40">└</span>
                                                                        <code className="font-mono text-foreground/70">{perm.name}</code>
                                                                        {perm.description && <span className="text-muted-foreground/60">&middot; {perm.description}</span>}
                                                                    </div>
                                                                </td>
                                                                {roles.map((role) => {
                                                                    const hasPage = rolePageIdSet.get(role.id)?.has(page.id) ?? false;
                                                                    return (
                                                                        <td key={role.id} className="border-l px-3 py-1.5 text-center">
                                                                            {hasPage ? <span className="text-xs font-semibold text-green-600">✓</span> : <span className="text-xs text-muted-foreground/30">·</span>}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                );
                                            })}
                                    </React.Fragment>
                                );
                            })}
                            {pageCatalog.length === 0 && (
                                <tr>
                                    <td colSpan={roles.length + 1} className="px-4 py-12 text-center text-muted-foreground">
                                        Không có dữ liệu trang quyền.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminPageShell>
    );
}
