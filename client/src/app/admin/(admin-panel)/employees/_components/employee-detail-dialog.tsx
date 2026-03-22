"use client";

import { JobHistoryApi } from "@/api/admin/job-history.api";
import { SalaryApi } from "@/api/admin/salary.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Helper } from "@/lib/helper";
import type { CareerPath } from "@/types/job-history";
import type { SalaryCalculation } from "@/types/salary";
import type { UserProfile } from "@/types/user";
import type { Position } from "@/types/admin-crud";
import {
    ArrowRight,
    Banknote,
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    History,
    Mail,
    Phone,
    Shield,
    Star,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getEmploymentType, getRoleLabel, getUsername } from "./employee-table";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserProfile | null;
    positions: Position[];
}

type TabKey = "info" | "salary" | "career";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "info", label: "Thông tin", icon: User },
    { key: "salary", label: "Lương tháng", icon: Banknote },
    { key: "career", label: "Lộ trình", icon: History },
];

const now = new Date();
const DEFAULT_MONTH = now.getMonth() + 1;
const DEFAULT_YEAR = now.getFullYear();

export function EmployeeDetailDialog({ open, onOpenChange, user, positions }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>("info");

    // Salary state
    const [salaryMonth, setSalaryMonth] = useState(DEFAULT_MONTH);
    const [salaryYear, setSalaryYear] = useState(DEFAULT_YEAR);
    const [salary, setSalary] = useState<SalaryCalculation | null>(null);
    const [isSalaryLoading, setIsSalaryLoading] = useState(false);
    const [salaryFetched, setSalaryFetched] = useState(false);

    // Career state
    const [career, setCareer] = useState<CareerPath | null>(null);
    const [isCareerLoading, setIsCareerLoading] = useState(false);
    const [careerFetched, setCareerFetched] = useState(false);

    // Reset khi đổi user
    useEffect(() => {
        if (open && user) {
            setActiveTab("info");
            setSalaryMonth(DEFAULT_MONTH);
            setSalaryYear(DEFAULT_YEAR);
            setSalary(null);
            setSalaryFetched(false);
            setCareer(null);
            setCareerFetched(false);
        }
    }, [open, user?.id]);

    // Fetch salary when tab active
    useEffect(() => {
        if (activeTab === "salary" && !salaryFetched && user) {
            void fetchSalary();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Fetch career when tab active
    useEffect(() => {
        if (activeTab === "career" && !careerFetched && user) {
            void fetchCareer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    async function fetchSalary(month = salaryMonth, year = salaryYear) {
        if (!user) return;
        setIsSalaryLoading(true);
        try {
            const res = await SalaryApi.calculateSalary(user.id, month, year);
            setSalary(res.data ?? null);
            setSalaryFetched(true);
        } catch {
            toast.error("Không thể tải dữ liệu lương.");
            setSalary(null);
        } finally {
            setIsSalaryLoading(false);
        }
    }

    async function fetchCareer() {
        if (!user) return;
        setIsCareerLoading(true);
        try {
            const res = await JobHistoryApi.getCareerById(user.id);
            setCareer(res.data ?? null);
            setCareerFetched(true);
        } catch {
            toast.error("Không thể tải lộ trình công tác.");
            setCareer(null);
        } finally {
            setIsCareerLoading(false);
        }
    }

    function handleMonthStep(delta: number) {
        let m = salaryMonth + delta;
        let y = salaryYear;
        if (m < 1) { m = 12; y -= 1; }
        if (m > 12) { m = 1; y += 1; }
        setSalaryMonth(m);
        setSalaryYear(y);
        setSalaryFetched(false);
        setSalary(null);
        void fetchSalary(m, y);
    }

    if (!user) return null;

    const username = getUsername(user);
    const displayName = String(user.fullName ?? username ?? "Unknown");
    const initials = displayName.charAt(0).toUpperCase();
    const status = String(user.status ?? "ACTIVE");
    const isActive = status === "ACTIVE";
    const roleLabel = getRoleLabel(user);
    const positionLabel = user.positionResponse?.name ?? "-";
    const employmentLabel = getEmploymentType(user);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-5 pt-5 pb-0">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 shrink-0 ring-2 ring-primary/20">
                            <AvatarImage src={String(user.avatar ?? "")} alt={displayName} />
                            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <DialogTitle className="text-lg font-bold leading-none">{displayName}</DialogTitle>
                            <DialogDescription className="mt-1 text-xs">
                                ID #{user.id} · @{username || "-"}
                            </DialogDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0 ${isActive
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                        }`}
                                >
                                    {isActive ? "Đang làm việc" : "Đã khóa"}
                                </Badge>
                                <Badge variant="outline" className="text-xs px-2 py-0 bg-muted">
                                    {roleLabel}
                                </Badge>
                                {employmentLabel !== "-" && (
                                    <Badge
                                        variant="outline"
                                        className={`text-xs px-2 py-0 ${employmentLabel === "Full-time"
                                            ? "bg-blue-50 text-blue-600 border-blue-200"
                                            : "bg-purple-50 text-purple-600 border-purple-200"
                                            }`}
                                    >
                                        {employmentLabel}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex gap-0 border-b">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${activeTab === tab.key
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </DialogHeader>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* ===== Tab: Thông tin ===== */}
                    {activeTab === "info" && (
                        <div className="space-y-4">
                            {/* Liên hệ */}
                            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Liên hệ</h4>
                                <InfoRow icon={Mail} label="Email" value={String(user.email ?? "-")} />
                                <InfoRow icon={Phone} label="Điện thoại" value={String(user.phone ?? "-")} />
                                <InfoRow icon={User} label="Giới tính" value={
                                    user.gender === "MALE" ? "Nam" : user.gender === "FEMALE" ? "Nữ" : user.gender ? String(user.gender) : "-"
                                } />
                                <InfoRow icon={Calendar} label="Ngày sinh" value={
                                    user.dateOfBirth ? new Date(String(user.dateOfBirth)).toLocaleDateString("vi-VN") : "-"
                                } />
                            </div>

                            {/* Nhân sự */}
                            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Nhân sự</h4>
                                <InfoRow icon={Shield} label="Vai trò" value={roleLabel} />
                                <InfoRow icon={Briefcase} label="Chức vụ" value={positionLabel} />
                                <InfoRow icon={Clock} label="Loại hình" value={employmentLabel} />
                            </div>

                        </div>
                    )}

                    {/* ===== Tab: Lương ===== */}
                    {activeTab === "salary" && (
                        <div className="space-y-4">
                            {/* Month selector */}
                            <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleMonthStep(-1)}
                                    disabled={isSalaryLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-center">
                                    <p className="text-sm font-semibold">Tháng {salaryMonth}/{salaryYear}</p>
                                    <p className="text-xs text-muted-foreground">Bảng lương tính toán</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleMonthStep(1)}
                                    disabled={isSalaryLoading || (salaryMonth === DEFAULT_MONTH && salaryYear === DEFAULT_YEAR)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            {isSalaryLoading ? (
                                <SalarySkeleton />
                            ) : salary ? (
                                <div className="space-y-4">
                                    {/* Tổng lương nổi bật */}
                                    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 text-center shadow-sm">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tổng lương thực nhận</p>
                                        <p className="mt-1 text-4xl font-extrabold text-primary">
                                            {Helper.formatCurrency(salary.final_salary ?? 0)}
                                        </p>
                                        <p className="mt-1.5 text-xs text-muted-foreground font-medium">
                                            {String(salary.position ?? "-")} · Tháng {String(salary.month ?? "-")}
                                        </p>
                                    </div>

                                    {/* Thông tin cơ bản */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <SalaryCard label="Lương cơ bản" value={Helper.formatCurrency(salary.base_salary ?? 0)} />
                                        <SalaryCard label="Thưởng lễ" value={Helper.formatCurrency(salary.total_holiday_bonus ?? 0)} color="text-green-600" />
                                        <SalaryCard label="Cộng thêm" value={Helper.formatCurrency(salary.total_manual_bonus ?? 0)} color="text-amber-600" />
                                    </div>

                                    {/* Chi tiết chế độ lương */}
                                    {salary.employment_type && (
                                        <div className="rounded-xl border bg-muted/20 p-3">
                                            <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-widest">
                                                Chế độ lương
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                    {String(salary.employment_type)}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {/* Chi tiết khoản cộng thêm (manual bonus) */}
                                    {Array.isArray(salary.manual_bonus_details) && salary.manual_bonus_details.length > 0 && (
                                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                                            <div className="bg-amber-50/60 px-4 py-3 border-b">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1.5">
                                                    <Star className="h-4 w-4" />
                                                    Khoản cộng thêm ({salary.manual_bonus_details.length})
                                                </p>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="sticky top-0 bg-muted/20 z-10 backdrop-blur-sm">
                                                        <tr>
                                                            <th className="px-4 py-2.5 text-left font-semibold text-xs text-muted-foreground uppercase">Loại</th>
                                                            <th className="px-4 py-2.5 text-left font-semibold text-xs text-muted-foreground uppercase">Lý do</th>
                                                            <th className="px-4 py-2.5 text-right font-semibold text-xs text-muted-foreground uppercase">Số tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {salary.manual_bonus_details.map((d) => (
                                                            <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                                                                        d.type === "OVERTIME" ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                        : d.type === "BONUS" ? "bg-green-50 text-green-700 border-green-200"
                                                                        : "bg-purple-50 text-purple-700 border-purple-200"
                                                                    }`}>
                                                                        {d.type === "OVERTIME" ? "Tăng ca" : d.type === "BONUS" ? "Thưởng" : "Phụ cấp"}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-muted-foreground">{d.reason || "-"}</td>
                                                                <td className="px-4 py-3 text-right font-semibold text-amber-600">
                                                                    +{Helper.formatCurrency(d.amount ?? 0)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Chi tiết thưởng lễ nếu có */}
                                    {Array.isArray(salary.bonus_details) && salary.bonus_details.length > 0 && (
                                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                                            <div className="bg-muted/40 px-4 py-3 border-b">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                                                    <Banknote className="h-4 w-4" />
                                                    Chi tiết thưởng lễ ({salary.bonus_details.length})
                                                </p>
                                            </div>
                                            <div className="max-h-56 overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="sticky top-0 bg-muted/20 z-10 backdrop-blur-sm">
                                                        <tr>
                                                            <th className="px-4 py-2.5 text-left font-semibold text-xs text-muted-foreground uppercase">Tên khoản thưởng</th>
                                                            <th className="px-4 py-2.5 text-right font-semibold text-xs text-muted-foreground uppercase">Số tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {salary.bonus_details.map((d, i) => (
                                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                                <td className="px-4 py-3 font-medium text-foreground">{String(d.name ?? "-")}</td>
                                                                <td className="px-4 py-3 text-right font-semibold text-green-600">
                                                                    +{Helper.formatCurrency(Number(d.amount ?? 0))}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Banknote className="mb-2 h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">Không có dữ liệu lương</p>
                                    <p className="mt-1 text-xs text-muted-foreground/70">
                                        Tháng {salaryMonth}/{salaryYear} chưa có dữ liệu chấm công.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => void fetchSalary()}
                                    >
                                        Thử lại
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== Tab: Lộ trình ===== */}
                    {activeTab === "career" && (
                        <div className="space-y-4">
                            {isCareerLoading ? (
                                <CareerSkeleton />
                            ) : career ? (
                                <div className="space-y-4">
                                    {/* Tổng quan */}
                                    <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Chức vụ hiện tại</h4>
                                        <p className="text-base font-bold text-foreground">{career.current_position?.name ?? "-"}</p>
                                        <p className="text-xs text-muted-foreground">{career.full_name}</p>
                                    </div>

                                    {/* Timeline */}
                                    {Array.isArray(career.career_history) && career.career_history.length > 0 ? (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                                                Lịch sử thay đổi ({career.career_history.length})
                                            </h4>
                                            <div className="relative space-y-0">
                                                {career.career_history.map((record, i) => (
                                                    <div key={record.id} className="flex gap-3">
                                                        {/* Timeline line */}
                                                        <div className="flex flex-col items-center">
                                                            <div className={`mt-3 h-3 w-3 shrink-0 rounded-full border-2 ${i === 0 ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
                                                                }`} />
                                                            {i < (career.career_history?.length ?? 0) - 1 && (
                                                                <div className="w-0.5 flex-1 bg-border" />
                                                            )}
                                                        </div>

                                                        <div className={`pb-4 min-w-0 flex-1 rounded-xl border p-3 mb-2 ${i === 0 ? "bg-primary/5 border-primary/20" : "bg-card"
                                                            }`}>
                                                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                                <span className="text-xs font-semibold">{String(record.position_name ?? "-")}</span>
                                                                {i === 0 && (
                                                                    <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 ml-auto">
                                                                        Hiện tại
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {record.effective_date
                                                                        ? new Date(String(record.effective_date)).toLocaleDateString("vi-VN")
                                                                        : "-"
                                                                    }
                                                                    {" - "}
                                                                    {record.end_date ?? "Hiện tại"}
                                                                </span>
                                                                {record.employment_type && (
                                                                    <span className="italic">{String(record.employment_type)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <History className="mb-2 h-8 w-8 text-muted-foreground/30" />
                                            <p className="text-sm text-muted-foreground">Chưa có lịch sử thay đổi chức vụ</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <History className="mb-2 h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">Không thể tải lộ trình</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => {
                                            setCareerFetched(false);
                                            void fetchCareer();
                                        }}
                                    >
                                        Thử lại
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t px-5 py-3 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
            <Separator orientation="vertical" className="h-3" />
            <span className="text-xs font-medium break-all">{value}</span>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    color,
    bg,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}) {
    return (
        <div className={`flex items-center gap-3 rounded-xl border p-3 ${bg}`}>
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className={`text-sm font-semibold ${color}`}>{value}</p>
            </div>
        </div>
    );
}

function SalaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="rounded-xl border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={`mt-0.5 text-sm font-semibold ${color ?? "text-foreground"}`}>{value}</p>
        </div>
    );
}

function SalarySkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}

function CareerSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
        </div>
    );
}
