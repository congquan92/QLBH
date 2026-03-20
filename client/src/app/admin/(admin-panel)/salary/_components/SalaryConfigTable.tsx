"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalaryConfig } from "@/types/admin-crud";
import { CalendarDays, Landmark, Pencil, Plus, Trash2 } from "lucide-react";

type Props = {
    configs: SalaryConfig[];
    isLoading: boolean;
    isSaving: boolean;
    onAdd: () => void;
    onEdit: (item: SalaryConfig) => void;
    onDelete: (id: number) => void;
    onOpenHolidayManager: () => void;
};

export function SalaryConfigTable({ configs, isLoading, isSaving, onAdd, onEdit, onDelete, onOpenHolidayManager }: Props) {

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Landmark className="h-5 w-5" />
                            Salary Config
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Quản lý cấu hình nhân hệ số lương theo loại nhân viên và ngày lễ</p>
                    </div>
                    <div className="flex gap-2 items-center justify-center">
                        <Button size="sm" onClick={onAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                        <Button variant="outline" onClick={onOpenHolidayManager}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Quản lý Ngày Lễ
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Rule Name</th>
                                <th className="px-4 py-3">Loại NV</th>
                                <th className="px-4 py-3">Hệ số</th>
                                <th className="px-4 py-3">Ngày lễ</th>
                                <th className="px-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-8 w-20 rounded-md" /></td>
                                    </tr>
                                ))
                            ) : configs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Chưa có salary config nào.
                                    </td>
                                </tr>
                            ) : (
                                configs.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 text-muted-foreground">#{item.id}</td>
                                        <td className="px-4 py-3 font-medium">{String(item.rule_name ?? "-")}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline">{String(item.employee_type ?? "-")}</Badge>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-semibold">x{String(item.multiplier ?? "-")}</td>
                                        <td className="px-4 py-3">
                                            {item.is_holiday ? (
                                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Lễ</Badge>
                                            ) : (
                                                <Badge variant="secondary">Thường</Badge>
                                            )}
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
