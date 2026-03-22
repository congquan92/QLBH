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
