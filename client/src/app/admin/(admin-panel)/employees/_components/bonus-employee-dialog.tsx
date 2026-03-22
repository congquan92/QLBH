"use client";

import { BonusApi, type BonusItem } from "@/api/admin/bonus.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Helper } from "@/lib/helper";
import type { UserProfile } from "@/types/user";
import { DollarSign, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
    user: UserProfile | null;
    onClose: () => void;
    onUpdated?: () => void;
};

const BONUS_TYPES = [
    { value: "OVERTIME", label: "Tăng ca" },
    { value: "BONUS", label: "Thưởng" },
    { value: "ALLOWANCE", label: "Phụ cấp" },
] as const;

function getTypeLabel(type: string) {
    return BONUS_TYPES.find((t) => t.value === type)?.label ?? type;
}

function getTypeBadgeClass(type: string) {
    switch (type) {
        case "OVERTIME": return "bg-blue-100 text-blue-700 border-blue-200";
        case "BONUS": return "bg-green-100 text-green-700 border-green-200";
        case "ALLOWANCE": return "bg-purple-100 text-purple-700 border-purple-200";
        default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
}

export function BonusEmployeeDialog({ user, onClose, onUpdated }: Props) {
    const [bonuses, setBonuses] = useState<BonusItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [bonusType, setBonusType] = useState("OVERTIME");
    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [year, setYear] = useState(String(new Date().getFullYear()));

    const fetchBonuses = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await BonusApi.getList({
                user_id: user.id,
                month: Number(month),
                year: Number(year),
            });
            setBonuses(Array.isArray(res.data) ? res.data : []);
        } catch {
            setBonuses([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, month, year]);

    useEffect(() => {
        void fetchBonuses();
    }, [fetchBonuses]);

    async function handleAdd() {
        if (!user || !amount || Number(amount) <= 0) {
            toast.error("Vui lòng nhập số tiền hợp lệ.");
            return;
        }
        setIsSaving(true);
        try {
            await BonusApi.create({
                user_id: user.id,
                month: Number(month),
                year: Number(year),
                amount: Number(amount),
                reason: reason.trim() || undefined,
                type: bonusType,
            });
            toast.success("Đã thêm tiền thưởng.");
            setAmount("");
            setReason("");
            await fetchBonuses();
            onUpdated?.();
        } catch (error) {
            const axErr = error as { response?: { data?: { message?: string } } };
            toast.error(axErr?.response?.data?.message ?? "Thêm thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(id: number) {
        setIsSaving(true);
        try {
            await BonusApi.delete(id);
            toast.success("Đã xóa tiền thưởng.");
            await fetchBonuses();
            onUpdated?.();
        } catch {
            toast.error("Xóa thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    if (!user) return null;

    const displayName = String(user.fullName ?? user.email ?? "Unknown");
    const initials = displayName.charAt(0).toUpperCase();
    const totalBonus = bonuses.reduce((s, b) => s + Number(b.amount), 0);

    return (
        <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
                            <DollarSign className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <DialogTitle>Thêm tiền thưởng</DialogTitle>
                            <DialogDescription className="mt-0.5">
                                Tăng ca, thưởng, phụ cấp cho nhân viên.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Profile */}
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                        <Avatar className="h-11 w-11">
                            <AvatarImage src={String(user.avatar ?? "")} alt={displayName} />
                            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm leading-none">{displayName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                ID #{user.id} · {user.positionResponse?.name ?? "-"}
                            </p>
                        </div>
                    </div>

                    {/* Tháng/Năm */}
                    <div className="flex gap-3">
                        <div className="flex-1 space-y-1.5">
                            <Label className="text-sm">Tháng</Label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <Label className="text-sm">Năm</Label>
                            <Input type="number" min={2020} max={2100} value={year} onChange={(e) => setYear(e.target.value)} />
                        </div>
                    </div>

                    <Separator />

                    {/* Form thêm */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium">Thêm khoản mới</p>
                        <div className="flex gap-2">
                            <div className="flex-1 space-y-1.5">
                                <Label className="text-xs">Số tiền (VNĐ)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="500000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <div className="w-36 space-y-1.5">
                                <Label className="text-xs">Loại</Label>
                                <Select value={bonusType} onValueChange={setBonusType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {BONUS_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Lý do (tùy chọn)</Label>
                            <Input
                                placeholder="VD: Tăng ca ngày 15/3"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => void handleAdd()} disabled={isSaving} size="sm" className="gap-1.5">
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            Thêm
                        </Button>
                    </div>

                    <Separator />

                    {/* Danh sách bonus đã có */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                                Danh sách T{month}/{year}
                            </p>
                            {totalBonus > 0 && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                    Tổng: {Helper.formatPrice(String(totalBonus))}
                                </Badge>
                            )}
                        </div>

                        {isLoading ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">Đang tải...</p>
                        ) : bonuses.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">
                                Chưa có khoản thưởng nào cho tháng này.
                            </p>
                        ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {bonuses.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/30 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getTypeBadgeClass(b.type)}`}>
                                                    {getTypeLabel(b.type)}
                                                </Badge>
                                                <span className="font-mono font-semibold text-green-600">
                                                    +{Helper.formatPrice(String(b.amount))}
                                                </span>
                                            </div>
                                            {b.reason && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.reason}</p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 shrink-0"
                                            onClick={() => void handleDelete(b.id)}
                                            disabled={isSaving}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
