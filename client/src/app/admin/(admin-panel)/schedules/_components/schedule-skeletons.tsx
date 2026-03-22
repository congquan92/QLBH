"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CalendarSkeleton() {
    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="grid grid-cols-7 min-h-[520px]">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex flex-col border-r last:border-r-0">
                        {/* Day Header */}
                        <div className="flex flex-col items-center py-3 border-b gap-1.5">
                            <Skeleton className="h-3 w-6" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-10 rounded-full" />
                        </div>

                        {/* Shift cards */}
                        <div className="flex-1 p-1.5 space-y-1.5">
                            <Skeleton className="h-16 w-full rounded-md" />
                            <Skeleton className="h-12 w-full rounded-md" />
                            {i % 2 === 0 && <Skeleton className="h-10 w-full rounded-md" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MyScheduleSkeleton() {
    return (
        <div className="space-y-4">
            {/* Employee info */}
            <div className="flex items-center gap-4 p-4 rounded-xl border">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            {/* Calendar grid */}
            <CalendarSkeleton />
        </div>
    );
}

export function DailyStaffSkeleton() {
    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                    </div>
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
