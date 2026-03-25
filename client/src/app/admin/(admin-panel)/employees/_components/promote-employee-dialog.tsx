"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Position } from "@/types/admin-crud";
import type { UserProfile } from "@/types/user";
import { ArrowUpCircle, Briefcase, Calendar, ChevronRight, Loader2, TrendingUp } from "lucide-react";
import { getUsername } from "./employee-table";

const TOMORROW_MIN_DATE = new Date(Date.now() + 86400000).toISOString().split("T")[0];

type Props = {
    user: UserProfile | null;
    positions: Position[];
    isSaving: boolean;
    positionId: string;
    employmentType: string;
    effectiveDate: string;
    onChangePosition: (positionId: string) => void;
    onChangeEmploymentType: (type: string) => void;
    onChangeEffectiveDate: (date: string) => void;
    onSave: () => void;
    onClose: () => void;
};

export function PromoteEmployeeDialog({ user, positions, isSaving, positionId, employmentType, effectiveDate, onChangePosition, onChangeEmploymentType, onChangeEffectiveDate, onSave, onClose }: Props) {
    if (!user) return null;

    const username = getUsername(user);
    const displayName = String(user.fullName ?? username ?? "Unknown");
    const initials = displayName.charAt(0).toUpperCase();
    const currentPosition = user.positionResponse?.name ?? "Chưa có chức vụ";

    // Find the selected new position to show preview
    const selectedPosition = positions.find((p) => String(p.id) === positionId);

    // Check if we're changing to a different position
    const isPositionChanged = positionId && user.positionResponse?.id !== Number(positionId);

    return (
        <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-100 to-indigo-100">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <DialogTitle>Thăng chức / Điều chuyển</DialogTitle>
                            <DialogDescription className="mt-0.5">Thay đổi chức vụ và loại hình làm việc của nhân viên.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Profile preview */}
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                        <Avatar className="h-11 w-11">
                            <AvatarImage src={String(user.avatar ?? "")} alt={displayName} />
                            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-none">{displayName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                ID #{user.id} · @{username || "-"}
                            </p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs bg-muted/50">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {currentPosition}
                        </Badge>
                    </div>

                    {/* Position change preview */}
                    {isPositionChanged && selectedPosition && (
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-purple-200 bg-purple-50/50 p-3">
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Hiện tại</p>
                                <Badge variant="secondary" className="text-xs">
                                    {currentPosition}
                                </Badge>
                            </div>
                            <ChevronRight className="h-4 w-4 text-purple-400 shrink-0" />
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-purple-600 mb-0.5 font-medium">Mới</p>
                                <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">{selectedPosition.name}</Badge>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Chức vụ mới */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                            <ArrowUpCircle className="h-3.5 w-3.5 text-purple-500" />
                            Chức vụ mới
                        </Label>
                        <Select value={positionId} onValueChange={onChangePosition}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn chức vụ mới" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.map((pos) => (
                                    <SelectItem key={pos.id} value={String(pos.id)}>
                                        <div className="flex items-center justify-between gap-3 w-full">
                                            <span>{pos.name}</span>
                                            {pos.base_salary && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    {Number(pos.base_salary).toLocaleString("vi-VN")}đ{pos.salary_type === "HOURLY" ? "/giờ" : "/tháng"}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Loại hình */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                            Loại hình làm việc
                        </Label>
                        <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm flex items-center font-medium">{employmentType === "PART_TIME" ? "Part-time (Bán thời gian)" : "Full-time (Toàn thời gian)"}</div>
                        <p className="text-[11px] text-muted-foreground">Loại hình làm việc tự động theo chức vụ để tránh lệch dữ liệu lịch và bảng lương.</p>
                    </div>

                    {/* Ngày hiệu lực */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-green-500" />
                            Ngày hiệu lực
                        </Label>
                        <Input type="date" value={effectiveDate} onChange={(e) => onChangeEffectiveDate(e.target.value)} min={TOMORROW_MIN_DATE} />
                        <p className="text-[11px] text-muted-foreground">
                            Ngày hiệu lực phải từ <strong>ngày mai</strong> trở đi. Lương mới sẽ được tính từ ngày này.
                        </p>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Hủy
                    </Button>
                    <Button onClick={onSave} disabled={isSaving || !positionId || !employmentType || !effectiveDate} className="min-w-32 gap-1.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        <TrendingUp className="h-4 w-4" />
                        Xác nhận thăng chức
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
