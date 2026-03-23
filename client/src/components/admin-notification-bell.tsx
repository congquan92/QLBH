"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

type NotificationItem = {
    id: string;
    target: string;
    title: string;
    body: string;
    type?: string;
    orderId?: number | null;
    createdAt: number;
};

type StreamEnvelope = {
    path: string;
    data: unknown;
};

type NotificationPayload = {
    title?: string;
    body?: string;
    type?: string;
    order_id?: number | null;
    created_at?: number;
};

function normalizeBaseUrl(raw: string) {
    const value = String(raw ?? "").trim();
    return value.endsWith("/") ? value.slice(0, -1) : value;
}

function toArray(data: unknown, target: string): NotificationItem[] {
    if (!data || typeof data !== "object") return [];

    return Object.entries(data as Record<string, NotificationPayload>)
        .map(([id, item]) => ({
            id,
            target,
            title: String(item?.title ?? "Thông báo"),
            body: String(item?.body ?? ""),
            type: typeof item?.type === "string" ? item.type : undefined,
            orderId: typeof item?.order_id === "number" ? item.order_id : null,
            createdAt: Number(item?.created_at ?? Date.now()),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
}

export function AdminNotificationBell({ roleName, userId }: { roleName?: string; userId?: number }) {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [seenKeys, setSeenKeys] = useState<Set<string>>(new Set());

    const roleTarget = useMemo(() => String(roleName ?? "").trim().toUpperCase(), [roleName]);
    const userTarget = useMemo(() => (Number(userId) > 0 ? `user_${userId}` : ""), [userId]);
    const streamTargets = useMemo(() => [roleTarget, userTarget].filter(Boolean), [roleTarget, userTarget]);

    useEffect(() => {
        const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_FIREBASE_DB_URL ?? "");
        if (!base || streamTargets.length === 0) {
            return;
        }

        const sources: EventSource[] = [];

        const mergeItems = (target: string, nextItems: NotificationItem[]) => {
            setItems((current) => {
                const map = new Map<string, NotificationItem>();

                for (const item of current) {
                    map.set(`${item.target}:${item.id}`, item);
                }

                const keysInTarget = new Set(nextItems.map((item) => `${item.target}:${item.id}`));
                for (const [key, item] of map.entries()) {
                    if (item.target === target && !keysInTarget.has(key)) {
                        map.delete(key);
                    }
                }

                for (const item of nextItems) {
                    map.set(`${item.target}:${item.id}`, item);
                }

                return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
            });
        };

        for (const target of streamTargets) {
            const streamUrl = `${base}/notifications/${encodeURIComponent(target)}.json`;
            const source = new EventSource(streamUrl);

            source.onmessage = (event) => {
                try {
                    const envelope = JSON.parse(event.data) as StreamEnvelope;
                    if (!envelope || typeof envelope !== "object") return;

                    if (envelope.path === "/") {
                        const snapshotItems = toArray(envelope.data, target);
                        mergeItems(target, snapshotItems);
                        return;
                    }

                    const key = String(envelope.path ?? "").replace(/^\//, "");
                    if (!key) return;

                    const payload = envelope.data as NotificationPayload | null;

                    if (payload === null) {
                        setItems((current) => current.filter((item) => !(item.target === target && item.id === key)));
                        return;
                    }

                    const nextItem: NotificationItem = {
                        id: key,
                        target,
                        title: String(payload?.title ?? "Thông báo"),
                        body: String(payload?.body ?? ""),
                        type: typeof payload?.type === "string" ? payload.type : undefined,
                        orderId: typeof payload?.order_id === "number" ? payload.order_id : null,
                        createdAt: Number(payload?.created_at ?? Date.now()),
                    };

                    setItems((current) => {
                        const map = new Map(current.map((item) => [`${item.target}:${item.id}`, item]));
                        map.set(`${target}:${key}`, nextItem);
                        return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
                    });
                } catch {
                    // Ignore malformed event payloads.
                }
            };

            sources.push(source);
        }

        return () => {
            for (const source of sources) {
                source.close();
            }
        };
    }, [streamTargets]);

    const unreadCount = useMemo(() => items.filter((item) => !seenKeys.has(`${item.target}:${item.id}`)).length, [items, seenKeys]);

    function markAsSeen(item: NotificationItem) {
        const key = `${item.target}:${item.id}`;
        setSeenKeys((current) => new Set(current).add(key));
    }

    function markAllAsSeen() {
        setSeenKeys(new Set(items.map((item) => `${item.target}:${item.id}`)));
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" aria-label="Thông báo">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-w-[90vw] p-0">
                <div className="flex items-center justify-between px-3 py-2">
                    <DropdownMenuLabel className="p-0">Thông báo</DropdownMenuLabel>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsSeen}>
                        <CheckCheck className="mr-1 h-3.5 w-3.5" />
                        Đánh dấu đã đọc
                    </Button>
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto p-2">
                    {items.length === 0 ? (
                        <div className="rounded-md p-3 text-sm text-muted-foreground">Chưa có thông báo nào.</div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => {
                                const key = `${item.target}:${item.id}`;
                                const isSeen = seenKeys.has(key);
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${isSeen ? "bg-background" : "bg-muted/60 font-semibold"}`}
                                        onClick={() => markAsSeen(item)}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="line-clamp-1 text-sm">{item.title}</p>
                                            {!isSeen ? <Badge className="bg-red-500 text-white hover:bg-red-500">Mới</Badge> : null}
                                        </div>
                                        <p className={`mt-1 line-clamp-2 text-xs ${isSeen ? "text-muted-foreground" : "text-foreground"}`}>{item.body}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
