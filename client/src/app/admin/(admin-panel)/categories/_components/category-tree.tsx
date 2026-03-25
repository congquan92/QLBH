"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Category, CategoryChild } from "@/types/navbar";
import { ChevronDown, ChevronRight, FolderOpen, FolderTree, GripVertical, Loader2, Pencil, RotateCcw, Save, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

type AnyCategory = Category | CategoryChild;

interface CategoryTreeProps {
    categories: Category[];
    isLoading: boolean;
    isSaving: boolean;
    onEdit: (item: AnyCategory, parentId?: number) => void;
    onDelete: (item: AnyCategory) => void;
    onRestore: (id: number) => void;
    /** Called when user reorders and clicks Save */
    onReorder: (newCategories: Category[]) => Promise<void>;
}

export function CategoryTree({ categories, isLoading, isSaving, onEdit, onDelete, onRestore, onReorder }: CategoryTreeProps) {
    const [localCategories, setLocalCategories] = useState<Category[]>(categories);
    const [expanded, setExpanded] = useState<Record<number, boolean>>(() => {
        const init: Record<number, boolean> = {};
        for (const cat of categories) {
            if ((cat.childCategory?.length ?? 0) > 0) init[cat.id] = true;
        }
        return init;
    });
    const [isDirty, setIsDirty] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    // ── Drag state ──
    const dragParentIndex = useRef<number | null>(null);
    const dragChildIndex = useRef<number | null>(null);
    const dragOverParentIndex = useRef<number | null>(null);
    const dragOverChildIndex = useRef<number | null>(null);
    const [draggingParentIdx, setDraggingParentIdx] = useState<number | null>(null);
    const [draggingChildKey, setDraggingChildKey] = useState<string | null>(null);

    function toggleExpand(id: number) {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    // ── Parent drag handlers ──
    function onParentDragStart(e: React.DragEvent, idx: number) {
        dragParentIndex.current = idx;
        dragChildIndex.current = null;
        setDraggingParentIdx(idx);
        e.dataTransfer.effectAllowed = "move";
    }

    function onParentDragOver(e: React.DragEvent, idx: number) {
        e.preventDefault();
        dragOverParentIndex.current = idx;
        dragOverChildIndex.current = null;
    }

    function onParentDrop(e: React.DragEvent, dropIdx: number) {
        e.preventDefault();
        const fromIdx = dragParentIndex.current;
        if (fromIdx === null || fromIdx === dropIdx) {
            setDraggingParentIdx(null);
            return;
        }
        const updated = [...localCategories];
        const [moved] = updated.splice(fromIdx, 1);
        updated.splice(dropIdx, 0, moved);
        setLocalCategories(updated);
        // Không set isDirty — server không hỗ trợ sort thứ tự root
        // Chỉ thay đổi UI để dễ nhìn, không lưu được
        setDraggingParentIdx(null);
        dragParentIndex.current = null;
    }

    function onParentDragEnd() {
        setDraggingParentIdx(null);
        dragParentIndex.current = null;
    }

    // ── Child drag handlers ──
    function onChildDragStart(e: React.DragEvent, parentIdx: number, childIdx: number) {
        dragParentIndex.current = parentIdx;
        dragChildIndex.current = childIdx;
        setDraggingChildKey(`${parentIdx}-${childIdx}`);
        e.dataTransfer.effectAllowed = "move";
        e.stopPropagation();
    }

    function onChildDragOver(e: React.DragEvent, parentIdx: number, childIdx: number) {
        e.preventDefault();
        e.stopPropagation();
        dragOverParentIndex.current = parentIdx;
        dragOverChildIndex.current = childIdx;
    }

    function onChildDrop(e: React.DragEvent, dropParentIdx: number, dropChildIdx: number) {
        e.preventDefault();
        e.stopPropagation();
        const fromParent = dragParentIndex.current;
        const fromChild = dragChildIndex.current;

        if (fromParent === null || fromChild === null) return;
        if (fromParent === dropParentIdx && fromChild === dropChildIdx) {
            setDraggingChildKey(null);
            return;
        }

        const updated = localCategories.map((c) => ({
            ...c,
            childCategory: [...(c.childCategory ?? [])],
        }));

        const [movedChild] = updated[fromParent].childCategory.splice(fromChild, 1);
        updated[dropParentIdx].childCategory.splice(dropChildIdx, 0, movedChild);

        setLocalCategories(updated);
        // Chỉ dirty khi thực sự đổi cha (cross-parent) — đây là thứ API hỗ trợ
        if (fromParent !== dropParentIdx) {
            setIsDirty(true);
        }
        setDraggingChildKey(null);
        dragChildIndex.current = null;
    }

    function onChildDragEnd() {
        setDraggingChildKey(null);
    }

    async function handleSaveOrder() {
        setIsSavingOrder(true);
        await onReorder(localCategories);
        setIsDirty(false);
        setIsSavingOrder(false);
    }

    function handleDiscard() {
        setLocalCategories(categories);
        setIsDirty(false);
    }

    const totalCount = localCategories.reduce((acc, cat) => acc + 1 + (cat.childCategory?.length ?? 0), 0);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải danh mục...
            </div>
        );
    }

    if (localCategories.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <FolderTree className="h-10 w-10 opacity-25" />
                <p className="text-sm">Chưa có danh mục nào.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header info + save bar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{totalCount}</span> danh mục · <span className="font-medium text-foreground">{localCategories.length}</span> danh mục gốc
                </p>
                {isDirty && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-600 font-medium">● Có danh mục con đổi nhóm chưa lưu</span>
                        <Button variant="outline" size="sm" onClick={handleDiscard} disabled={isSavingOrder}>
                            Huỷ
                        </Button>
                        <Button size="sm" onClick={() => void handleSaveOrder()} disabled={isSavingOrder}>
                            {isSavingOrder ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                            Lưu thứ tự
                        </Button>
                    </div>
                )}
            </div>

            {/* Tree */}
            <div className="space-y-2">
                {localCategories.map((category, parentIdx) => {
                    const hasChildren = (category.childCategory?.length ?? 0) > 0;
                    const isExpanded = !!expanded[category.id];
                    const isActive = category.status === "ACTIVE";
                    const isDraggingThis = draggingParentIdx === parentIdx;

                    return (
                        <div
                            key={category.id}
                            draggable
                            onDragStart={(e) => onParentDragStart(e, parentIdx)}
                            onDragOver={(e) => onParentDragOver(e, parentIdx)}
                            onDrop={(e) => onParentDrop(e, parentIdx)}
                            onDragEnd={onParentDragEnd}
                            className={`rounded-lg border bg-card transition-all ${isDraggingThis ? "opacity-40 scale-[0.98] shadow-none" : "shadow-sm hover:shadow-md"}`}
                        >
                            {/* Parent row */}
                            <div className="flex items-center gap-2 px-3 py-2.5">
                                {/* Grip */}
                                <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0 cursor-grab active:cursor-grabbing" />

                                {/* Expand toggle */}
                                <button type="button" onClick={() => toggleExpand(category.id)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" disabled={!hasChildren}>
                                    {hasChildren ? isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : <FolderTree className="h-4 w-4 opacity-25" />}
                                </button>

                                {/* Icon + Name */}
                                <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
                                <span className="flex-1 font-medium text-sm truncate">{category.name}</span>

                                {/* Badges */}
                                {hasChildren && (
                                    <Badge variant="secondary" className="shrink-0 text-xs">
                                        {category.childCategory.length} con
                                    </Badge>
                                )}
                                <Badge variant={isActive ? "default" : "destructive"} className="shrink-0 text-xs">
                                    {isActive ? "Kích hoạt" : "Đã xóa"}
                                </Badge>

                                {/* Actions */}
                                <div className="flex shrink-0 gap-0.5">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(category)} title="Chỉnh sửa">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => onDelete(category)} disabled={isSaving} title="Xóa">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRestore(category.id)} disabled={isSaving} title="Khôi phục">
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Children */}
                            {hasChildren && isExpanded && (
                                <div className="border-t bg-muted/30 px-3 py-2 space-y-1.5">
                                    {category.childCategory.map((child, childIdx) => {
                                        const childActive = child.status === "ACTIVE";
                                        const childKey = `${parentIdx}-${childIdx}`;
                                        const isDraggingChild = draggingChildKey === childKey;

                                        return (
                                            <div
                                                key={child.id}
                                                draggable
                                                onDragStart={(e) => onChildDragStart(e, parentIdx, childIdx)}
                                                onDragOver={(e) => onChildDragOver(e, parentIdx, childIdx)}
                                                onDrop={(e) => onChildDrop(e, parentIdx, childIdx)}
                                                onDragEnd={onChildDragEnd}
                                                className={`flex items-center gap-2 rounded-md border bg-background px-3 py-2 transition-all ${isDraggingChild ? "opacity-40 scale-[0.97]" : "hover:bg-muted/50"}`}
                                            >
                                                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing" />
                                                <span className="ml-3 text-sm flex-1 truncate">{child.name}</span>
                                                <Badge variant={childActive ? "outline" : "destructive"} className="shrink-0 text-xs">
                                                    {childActive ? "Kích hoạt" : "Đã xóa"}
                                                </Badge>
                                                <div className="flex shrink-0 gap-0.5">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(child, category.id)} title="Chỉnh sửa">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => onDelete(child)} disabled={isSaving} title="Xóa">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRestore(child.id)} disabled={isSaving} title="Khôi phục">
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
