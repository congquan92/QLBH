import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pencil, Shield, Trash2 } from "lucide-react";
import React from "react";
import type { RbacGroupPermission, RbacPageCatalogItem, RbacRole } from "@/types/rbac";

type TablePermissionProps = {
    roles: RbacRole[];
    pageCatalog: RbacPageCatalogItem[];
    expanded: Record<number, boolean>;
    expandedGroups: Record<number, boolean>;
    roleGroupIdSet: Map<number, Set<number>>;
    onToggleExpand: (pageId: number) => void;
    onToggleExpandGroup: (groupId: number) => void;
    pageCheckedState: (roleId: number, pageGroups: NonNullable<RbacPageCatalogItem["items"]>) => "all" | "some" | "none";
    onToggleAllGroupsInPage: (role: RbacRole, pageGroups: NonNullable<RbacPageCatalogItem["items"]>) => void;
    onEditRole: (role: RbacRole) => void;
    onDeleteRole: (roleId: number) => void;
    onEditGroup: (group: RbacGroupPermission, pageId: number) => void;
    onToggleGroup: (role: RbacRole, groupId: number) => void;
};

export function TablePermission({
    roles,
    pageCatalog,
    expanded,
    expandedGroups,
    roleGroupIdSet,
    onToggleExpand,
    onToggleExpandGroup,
    pageCheckedState,
    onToggleAllGroupsInPage,
    onEditRole,
    onDeleteRole,
    onEditGroup,
    onToggleGroup,
}: TablePermissionProps) {
    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="sticky left-0 z-10 min-w-60 bg-muted/50 px-4 py-3 text-left font-semibold "> Các Quyền</th>
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
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEditRole(role)} title="Chỉnh sửa">
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => onDeleteRole(role.id)} title="Xóa">
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
                        const isExpanded = expanded[page.id] !== true;
                        const groups = page.items ?? [];
                        return (
                            <React.Fragment key={page.id}>
                                {/* Page row */}
                                <tr className="border-b bg-primary/5 hover:bg-primary/10">
                                    <td className="sticky left-0 z-10 bg-primary/5 px-4 py-2.5">
                                        <button className="flex items-center gap-2 font-semibold text-foreground hover:text-primary" onClick={() => onToggleExpand(page.id)}>
                                            {groups.length > 0 ? isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" /> : <span className="w-4 shrink-0" />}
                                            <span>{page.title}</span>
                                            {groups.length > 0 && <span className="text-xs font-normal text-muted-foreground">({groups.length} nhóm)</span>}
                                        </button>
                                    </td>
                                    {roles.map((role) => {
                                        const state = pageCheckedState(role.id, groups);
                                        return (
                                            <td key={role.id} className="border-l px-3 py-2.5 text-center">
                                                {groups.length > 0 ? (
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 cursor-pointer accent-primary"
                                                        checked={state === "all"}
                                                        ref={(el) => {
                                                            if (el) el.indeterminate = state === "some";
                                                        }}
                                                        onChange={() => onToggleAllGroupsInPage(role, groups)}
                                                        title={`Chọn tất cả nhóm trong ${page.title} cho ${role.name}`}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/40">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                                {/* GROUP PERMISSION rows */}
                                {isExpanded &&
                                    groups.map((group) => {
                                        const perms = group.permissions ?? [];
                                        const isGroupExpanded = expandedGroups[group.id] === true;
                                        return (
                                            <React.Fragment key={group.id}>
                                                <tr className="border-b bg-muted/10 hover:bg-muted/20">
                                                    <td className="sticky left-0 z-10 bg-muted/10 px-4 py-2">
                                                        <div className="flex items-center justify-between gap-2 pl-7">
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                {perms.length > 0 ? (
                                                                    <button onClick={() => onToggleExpandGroup(group.id)} className="flex items-center gap-2 hover:text-primary">
                                                                        {isGroupExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                                                                        <span className="font-medium text-foreground/80">{group.name}</span>
                                                                        {group.url && <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{group.url}</code>}
                                                                        <span className="text-xs text-muted-foreground/60">({perms.length} quyền)</span>
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <span className="w-3 shrink-0" />
                                                                        <span className="font-medium text-foreground/80">{group.name}</span>
                                                                        {group.url && <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{group.url}</code>}
                                                                    </>
                                                                )}
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 shrink-0 p-0 opacity-50 hover:opacity-100" onClick={() => onEditGroup(group, page.id)} title="Sửa nhóm quyền">
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    {roles.map((role) => (
                                                        <td key={role.id} className="border-l px-3 py-2 text-center">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 cursor-pointer accent-primary"
                                                                checked={roleGroupIdSet.get(role.id)?.has(group.id) ?? false}
                                                                onChange={() => onToggleGroup(role, group.id)}
                                                                title={`${role.name} – ${group.name}`}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                                {/* PERMISSION rows — read-only  */}
                                                {isGroupExpanded &&
                                                    perms.map((perm) => (
                                                        <tr key={perm.id} className="border-b bg-muted/5 hover:bg-muted/10">
                                                            <td className="sticky left-0 z-10 bg-muted/5 px-4 py-1.5">
                                                                <div className="flex items-center gap-2 pl-14 text-xs text-muted-foreground">
                                                                    <span className="text-muted-foreground/40">└</span>
                                                                    {/* <code className="font-mono text-foreground/70">{perm.name}</code> */}
                                                                    {perm.description && <span className="text-muted-foreground "> {perm.description}</span>}
                                                                </div>
                                                            </td>
                                                            {roles.map((role) => {
                                                                const hasGroup = roleGroupIdSet.get(role.id)?.has(group.id) ?? false;
                                                                return (
                                                                    <td key={role.id} className="border-l px-3 py-1.5 text-center">
                                                                        {hasGroup ? <span className="text-xs font-semibold text-green-600">✓</span> : <span className="text-xs text-muted-foreground/30">·</span>}
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
    );
}
