"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalaryScale } from "@/types/admin-crud";
import { Pencil, Plus, Scale, Trash2 } from "lucide-react";

type Props = {
    scales: SalaryScale[];
    isLoading: boolean;
    isSaving: boolean;
    onAdd: () => void;
    onEdit: (item: SalaryScale) => void;
    onDelete: (id: number) => void;
};

export function SalaryScaleTable({ scales, isLoading, isSaving, onAdd, onEdit, onDelete }: Props) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Scale className="h-5 w-5" />
                            Thang Lương
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Hệ số lương theo số năm kinh nghiệm của nhân viên</p>
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
                                <th className="px-4 py-3">Tên thang lương</th>
                                <th className="px-4 py-3">Năm KN</th>
                                <th className="px-4 py-3">Hệ số</th>
                                <th className="px-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-8 w-20 rounded-md" /></td>
                                    </tr>
                                ))
                            ) : scales.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        Chưa có thang lương nào.
                                    </td>
                                </tr>
                            ) : (
                                scales.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 text-muted-foreground">#{item.id}</td>
                                        <td className="px-4 py-3 font-medium">{String(item.name ?? "-")}</td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono">{String(item.years_of_experience ?? 0)} năm</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-semibold">x{String(item.coefficient ?? "-")}</td>
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
