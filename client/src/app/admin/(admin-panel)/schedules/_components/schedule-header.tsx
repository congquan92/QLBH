"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Users, Plus, BriefcaseBusiness, TriangleAlert, Fingerprint, Loader2, Clock3 } from "lucide-react";

type ViewMode = "weekly-report" | "daily-staff" | "assign" | "shift-management" | "position-default" | "late-arrivals";

type Props = {
    viewMode: ViewMode;
    currentDate: Date;
    weekRange: string;
    onViewModeChange: (mode: ViewMode) => void;
    onNavigate: (direction: "prev" | "next" | "today") => void;
    isRecordingAttendance: boolean;
    onAttendanceRecord: () => void;
};

const VIEW_TABS: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "weekly-report", label: "Báo cáo tuần", icon: <Calendar className="h-4 w-4" /> },
    { key: "daily-staff", label: "Nhân viên hôm nay", icon: <Users className="h-4 w-4" /> },
    { key: "assign", label: "Phân ca", icon: <Plus className="h-4 w-4" /> },
    { key: "shift-management", label: "Danh sách ca", icon: <Clock3 className="h-4 w-4" /> },
    { key: "position-default", label: "Lịch theo chức vụ", icon: <BriefcaseBusiness className="h-4 w-4" /> },
    { key: "late-arrivals", label: "Danh sách đi trễ", icon: <TriangleAlert className="h-4 w-4" /> },
];

export function ScheduleHeader({ viewMode, currentDate, weekRange, onViewModeChange, onNavigate, isRecordingAttendance, onAttendanceRecord }: Props) {
    const monthYear = currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

    return (
        <div className="space-y-4">
            {/* Top Bar - giống Google Calendar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight ml-2">Lịch làm việc</h1>
                    </div>
                </div>
            </div>

            {/* Navigation + View Mode Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Left: Navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => onNavigate("today")}
                    >
                        Hôm nay
                    </Button>
                    <div className="flex items-center bg-muted rounded-lg p-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-background"
                            onClick={() => onNavigate("prev")}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-background"
                            onClick={() => onNavigate("next")}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold capitalize">{monthYear}</span>
                        <span className="text-xs text-muted-foreground">{weekRange}</span>
                    </div>
                </div>

                {/* Right: View Mode Tabs */}
                <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
                    {VIEW_TABS.map((tab) => (
                        <Button
                            key={tab.key}
                            variant={viewMode === tab.key ? "default" : "ghost"}
                            size="sm"
                            className={`h-8 px-3 text-xs font-medium gap-1.5 transition-all ${
                                viewMode === tab.key
                                    ? "shadow-sm"
                                    : "hover:bg-background/60 text-muted-foreground"
                            }`}
                            onClick={() => onViewModeChange(tab.key)}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </Button>
                    ))}
                </div>

                <Button size="sm" onClick={onAttendanceRecord} disabled={isRecordingAttendance}>
                    {isRecordingAttendance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
                    Điểm danh
                </Button>
            </div>
        </div>
    );
}
