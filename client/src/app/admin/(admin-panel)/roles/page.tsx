"use client";

import { RbacApi } from "@/api/rbac.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { RbacGroupPermission, RbacPageCatalogItem, RbacRole, RbacRolePayload } from "@/types/rbac";
import { Helper } from "@/lib/helper";
import EditGroupDialog, { type EditGroupForm } from "./components/EditGroup-dialog";
import { RoleFormDialog, type RoleFormState } from "./components/RoleForm-dialog";
import { Plus } from "lucide-react";
import { TablePermission } from "@/app/admin/(admin-panel)/roles/components/TablePermission";

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
    const [editGroupOpen, setEditGroupOpen] = useState(false);
    const [editGroupForm, setEditGroupForm] = useState<EditGroupForm | null>(null);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
    const [draftGroupIds, setDraftGroupIds] = useState<Map<number, Set<number>>>(new Map());

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

    const roleGroupIdSet = useMemo(() => {
        const map = new Map<number, Set<number>>();
        for (const role of roles) {
            if (draftGroupIds.has(role.id)) {
                map.set(role.id, new Set(draftGroupIds.get(role.id)!));
            } else {
                const explicitIds = role.assigned_group_permission_ids ?? [];
                if (explicitIds.length > 0) {
                    map.set(role.id, new Set(explicitIds));
                } else {
                    const derivedIds = (role.page ?? []).flatMap((page) => (page.items ?? []).map((group) => group.id));
                    map.set(role.id, new Set(derivedIds));
                }
            }
        }
        return map;
    }, [roles, draftGroupIds]);

    async function fetchAll() {
        setIsLoading(true);
        try {
            const [roleRes, pageRes] = await Promise.all([RbacApi.getRoles({ page: 1, size: 100, sort: "id:asc" }), RbacApi.getPages({ page: 1, size: 200, sort: "sort_order:asc" })]);
            setRoles((roleRes as unknown as { data: RbacRole[] }).data ?? []);
            setPages((pageRes as unknown as { data: RbacPageCatalogItem[] }).data ?? []);
            setDraftGroupIds(new Map());
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
            group_permission_ids: [],
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
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    function toggleGroupForRole(role: RbacRole, groupId: number) {
        const currentIds = new Set(roleGroupIdSet.get(role.id));
        if (currentIds.has(groupId)) {
            currentIds.delete(groupId);
        } else {
            currentIds.add(groupId);
        }
        setDraftGroupIds((prev) => new Map(prev).set(role.id, currentIds));
    }

    async function removeRole(roleId: number) {
        if (!confirm("Bạn có chắc muốn xóa vai trò này?")) return;
        setIsSaving(true);
        try {
            await RbacApi.deleteRole(roleId);
            toast.success("Xóa vai trò thành công.");
            await fetchAll();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    function openEditGroupDialog(group: RbacGroupPermission, pageId: number) {
        setEditGroupForm({
            id: group.id,
            name: group.name,
            url: group.url ?? "",
            icon: group.icon ?? "",
            description: group.description ?? "",
            status: group.status ?? "ACTIVE",
            pageId,
        });
        setEditGroupOpen(true);
    }

    async function saveEditGroup() {
        if (!editGroupForm) return;

        const prevPage = pageCatalog.find((p) => (p.items ?? []).some((g) => g.id === editGroupForm.id));
        const prevPageId = prevPage?.id ?? null;

        setIsSaving(true);
        try {
            await RbacApi.updateGroupPermission(editGroupForm.id, {
                name: editGroupForm.name,
                url: editGroupForm.url || undefined,
                icon: editGroupForm.icon || undefined,
                description: editGroupForm.description || undefined,
                status: editGroupForm.status,
            });

            if (editGroupForm.pageId !== prevPageId) {
                if (editGroupForm.pageId !== null) {
                    const targetPage = pageCatalog.find((p) => p.id === editGroupForm.pageId);
                    if (targetPage) {
                        const existingIds = (targetPage.items ?? []).map((g) => g.id).filter((id) => id !== editGroupForm.id);
                        await RbacApi.updatePage(editGroupForm.pageId, {
                            title: targetPage.title,
                            icon: targetPage.icon,
                            sort_order: targetPage.sort_order,
                            group_permission_ids: [...existingIds, editGroupForm.id],
                        });
                    }
                } else if (prevPageId !== null) {
                    const oldPage = pageCatalog.find((p) => p.id === prevPageId);
                    if (oldPage) {
                        const remainingIds = (oldPage.items ?? []).map((g) => g.id).filter((id) => id !== editGroupForm.id);
                        await RbacApi.updatePage(prevPageId, {
                            title: oldPage.title,
                            icon: oldPage.icon,
                            sort_order: oldPage.sort_order,
                            group_permission_ids: remainingIds,
                        });
                    }
                }
            }

            toast.success("Đã cập nhật trang cha của nhóm quyền.");
            setEditGroupOpen(false);
            setEditGroupForm(null);
            await fetchAll();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    function updateEditGroupForm(value: EditGroupForm) {
        setEditGroupForm(value);
    }

    function toggleExpand(pageId: number) {
        setExpanded((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
    }

    function toggleExpandGroup(groupId: number) {
        setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    }

    function pageCheckedState(roleId: number, pageGroups: NonNullable<RbacPageCatalogItem["items"]>): "all" | "some" | "none" {
        const set = roleGroupIdSet.get(roleId);
        if (!set || pageGroups.length === 0) return "none";
        const checkedCount = pageGroups.filter((g) => set.has(g.id)).length;
        if (checkedCount === 0) return "none";
        if (checkedCount === pageGroups.length) return "all";
        return "some";
    }

    function toggleAllGroupsInPage(role: RbacRole, pageGroups: NonNullable<RbacPageCatalogItem["items"]>) {
        const state = pageCheckedState(role.id, pageGroups);
        const currentIds = new Set(roleGroupIdSet.get(role.id));
        if (state === "all") {
            for (const g of pageGroups) currentIds.delete(g.id);
        } else {
            for (const g of pageGroups) currentIds.add(g.id);
        }
        setDraftGroupIds((prev) => new Map(prev).set(role.id, currentIds));
    }

    async function saveAllChanges() {
        setIsSaving(true);
        try {
            await Promise.all(
                Array.from(draftGroupIds.entries()).map(([roleId, groupSet]) => {
                    const role = roles.find((r) => r.id === roleId);
                    if (!role) return Promise.resolve();
                    return RbacApi.updateRole(roleId, {
                        name: role.name,
                        status: role.status,
                        group_permission_ids: Array.from(groupSet),
                    });
                }),
            );
            toast.success(`Đã lưu thay đổi quyền cho ${draftGroupIds.size} vai trò.`);
            setDraftGroupIds(new Map());
            await fetchAll();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Vai trò & Quyền" description="Quản lý vai trò và phạm vi quyền của từng nhóm người dùng" requiredPermissions={["VIEW_ROLES"]}>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {roles.length} vai trò &middot; {pageCatalog.length} trang
                    {draftGroupIds.size > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{draftGroupIds.size} vai trò chưa lưu</span>}
                </p>
                <div className="flex gap-2">
                    {draftGroupIds.size > 0 && (
                        <>
                            <Button variant="outline" onClick={() => setDraftGroupIds(new Map())} disabled={isSaving}>
                                Hủy thay đổi
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => {
                                    if (confirm(`Lưu thay đổi quyền cho ${draftGroupIds.size} vai trò?`)) {
                                        void saveAllChanges();
                                    }
                                }}
                                disabled={isSaving}
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu thay đổi
                            </Button>
                        </>
                    )}
                    <Button onClick={openCreateDialog} disabled={isSaving}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo vai trò mới
                    </Button>
                </div>
            </div>

            <RoleFormDialog open={dialogOpen} isSaving={isSaving} form={form} onOpenChange={setDialogOpen} onFormChange={setForm} onSubmit={() => void submitRole()} />

            <EditGroupDialog
                open={editGroupOpen}
                onClose={() => {
                    setEditGroupOpen(false);
                    setEditGroupForm(null);
                }}
                form={editGroupForm}
                setForm={updateEditGroupForm}
                pages={pageCatalog}
                isSaving={isSaving}
                onSave={saveEditGroup}
            />

            {/* Permission Matrix Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tải dữ liệu...
                </div>
            ) : (
                <TablePermission
                    roles={roles}
                    pageCatalog={pageCatalog}
                    expanded={expanded}
                    expandedGroups={expandedGroups}
                    roleGroupIdSet={roleGroupIdSet}
                    onToggleExpand={toggleExpand}
                    onToggleExpandGroup={toggleExpandGroup}
                    pageCheckedState={pageCheckedState}
                    onToggleAllGroupsInPage={toggleAllGroupsInPage}
                    onEditRole={openEditDialog}
                    onDeleteRole={(roleId) => void removeRole(roleId)}
                    onEditGroup={(group, pageId) => openEditGroupDialog(group, pageId)}
                    onToggleGroup={(role, groupId) => toggleGroupForRole(role, groupId)}
                />
            )}
        </AdminPageShell>
    );
}
