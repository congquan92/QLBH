"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

type Props = {
    currentDate: Date;
    weekRange: string;
    onNavigate: (direction: "prev" | "next" | "today") => void;
};

export function UScheduleHeader({ currentDate, weekRange, onNavigate }: Props) {
    const monthYear = currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

    return (
        <div className="space-y-4">
            {/* Top Bar */}
            <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                    <Calendar className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight ml-2">Lịch làm việc</h1>
            </div>

            {/* Navigation */}
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
        </div>
    );
}
