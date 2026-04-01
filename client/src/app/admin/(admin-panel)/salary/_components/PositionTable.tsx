"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Position } from "@/types/admin-crud";
import { BriefcaseBusiness, Pencil, Plus, Trash2 } from "lucide-react";

type Props = {
    positions: Position[];
    isLoading: boolean;
    isSaving: boolean;
    onAdd: () => void;
    onEdit: (item: Position) => void;
    onDelete: (id: number) => void;
};

function formatSalaryType(value: unknown) {
    const type = String(value ?? "").toUpperCase();
    if (type === "HOURLY") return "Theo giờ";
    if (type === "MONTHLY") return "Theo tháng";
    return "-";
}

export function PositionTable({ positions, isLoading, isSaving, onAdd, onEdit, onDelete }: Props) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BriefcaseBusiness className="h-5 w-5" />
                            Chức vụ
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Quản lý chức vụ và mức lương cơ bản cho từng vị trí</p>
                    </div>
                    <Button size="sm" onClick={onAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Tên chức vụ</th>
                                <th className="px-4 py-3">Lương cơ bản</th>
                                <th className="px-4 py-3">Loại lương</th>
                                <th className="px-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-8 w-20 rounded-md" /></td>
                                    </tr>
                                ))
                            ) : positions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        Chưa có chức vụ nào.
                                    </td>
                                </tr>
                            ) : (
                                positions.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 text-muted-foreground">#{item.id}</td>
                                        <td className="px-4 py-3 font-medium">{String(item.name ?? "-")}</td>
                                        <td className="px-4 py-3 font-semibold">
                                            {Number(item.base_salary ?? 0).toLocaleString("vi-VN")} VND
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline">{formatSalaryType(item.salary_type)}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => onEdit(item)} disabled={isSaving}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDelete(item.id)}
                                                    disabled={isSaving}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
