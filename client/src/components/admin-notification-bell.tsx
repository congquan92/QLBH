"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMemo, useState, useEffect, useRef } from "react";

type NotificationItem = {
    id: string;
    target: string;
    title: string;
    body: string;
    type?: string;
    orderId?: number | null;
    orderData?: unknown;
    seenBy?: Record<string, number>;
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
    order_data?: unknown;
    seen_by?: Record<string, number>;
    created_at?: number;
};

type OrderDetailSummary = {
    orderId?: number;
    customerName?: string;
    totalAmount?: number;
    itemCount?: number;
};

function normalizeBaseUrl(raw: string) {
    const value = String(raw ?? "").trim();
    return value.endsWith("/") ? value.slice(0, -1) : value;
}

function toRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return value as Record<string, unknown>;
}

function toNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

function extractOrderSummary(orderData: unknown): OrderDetailSummary {
    const parsed = typeof orderData === "string"
        ? (() => {
              try {
                  return JSON.parse(orderData) as unknown;
              } catch {
                  return {} as unknown;
              }
          })()
        : orderData;

    const root = toRecord(parsed);
    const userResponse = toRecord(root.userResponse);
    const detailResponses = Array.isArray(root.orderDetailResponses) ? root.orderDetailResponses : [];

    const orderId = toNumber(root.id);
    const totalAmount = toNumber(root.totalAmount ?? root.total_amount);
    const itemCount = detailResponses.reduce((sum, item) => {
        const qty = toNumber(toRecord(item).quantity);
        return sum + (qty ?? 0);
    }, 0);

    const customerName =
        String(root.customerName ?? root.customer_name ?? userResponse.fullName ?? userResponse.userName ?? "").trim() || undefined;

    return {
        orderId,
        customerName,
        totalAmount,
        itemCount: itemCount > 0 ? itemCount : undefined,
    };
}

function formatCurrency(value?: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: number) {
    if (!Number.isFinite(value) || value <= 0) return "";
    return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function normalizeNotificationBody(body: string, orderId?: number | null) {
    const clean = String(body ?? "")
        .replace(/\{\$order->id\}?/g, orderId ? `#${orderId}` : "")
        .replace(/\{\$order->id\)\}/g, orderId ? `#${orderId}` : "")
        .replace(/\s{2,}/g, " ")
        .trim();

    return clean;
}

function timestampMs() {
    return Date.now();
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
            orderData: item?.order_data,
            seenBy: toRecord(item?.seen_by) as Record<string, number>,
            createdAt: Number(item?.created_at ?? Date.now()),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
}

function isSeenByViewer(item: NotificationItem, viewerKey: string, localSeenKeys: Set<string>) {
    const fullKey = `${item.target}:${item.id}`;
    if (localSeenKeys.has(fullKey)) return true;
    const seenBy = item.seenBy ?? {};
    return Boolean(seenBy[viewerKey]);
}

export function AdminNotificationBell({ roleName, userId }: { roleName?: string; userId?: number }) {
    const router = useRouter();
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [localSeenKeys, setLocalSeenKeys] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const initializedTargetsRef = useRef<Set<string>>(new Set());
    const knownNotificationKeysRef = useRef<Set<string>>(new Set());
    const pageSize = 5;

    const roleTarget = useMemo(() => String(roleName ?? "").trim().toUpperCase(), [roleName]);
    const userTarget = useMemo(() => (Number(userId) > 0 ? `user_${userId}` : ""), [userId]);
    const viewerKey = useMemo(() => (Number(userId) > 0 ? `user_${userId}` : roleTarget || "anonymous"), [roleTarget, userId]);
    const streamTargets = useMemo(() => [roleTarget, userTarget].filter(Boolean), [roleTarget, userTarget]);

    useEffect(() => {
        const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_FIREBASE_DB_URL ?? "");
        if (!base || streamTargets.length === 0) {
            return;
        }

        const sources: EventSource[] = [];

        function pushToast(item: NotificationItem) {
            const detail = extractOrderSummary(item.orderData);
            const amount = formatCurrency(detail.totalAmount);
            const bodyText = normalizeNotificationBody(item.body, detail.orderId ?? item.orderId);
            const detailParts = [
                detail.orderId ? `Đơn #${detail.orderId}` : null,
                detail.customerName ? `Khách: ${detail.customerName}` : null,
                amount ? `Tổng: ${amount}` : null,
            ].filter(Boolean);

            toast(item.title || "Thông báo mới", {
                description: detailParts.length > 0 ? detailParts.join(" | ") : bodyText || "Bạn có thông báo mới.",
            });
        }

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

        const upsertItem = (target: string, key: string, payload: NotificationPayload | null, showToastWhenNew: boolean) => {
            if (payload === null) {
                setItems((current) => current.filter((item) => !(item.target === target && item.id === key)));
                knownNotificationKeysRef.current.delete(`${target}:${key}`);
                return;
            }

            const nextItem: NotificationItem = {
                id: key,
                target,
                title: String(payload?.title ?? "Thông báo"),
                body: String(payload?.body ?? ""),
                type: typeof payload?.type === "string" ? payload.type : undefined,
                orderId: typeof payload?.order_id === "number" ? payload.order_id : null,
                orderData: payload?.order_data,
                seenBy: toRecord(payload?.seen_by) as Record<string, number>,
                createdAt: Number(payload?.created_at ?? Date.now()),
            };

            const fullKey = `${target}:${key}`;
            const isKnown = knownNotificationKeysRef.current.has(fullKey);
            knownNotificationKeysRef.current.add(fullKey);

            if (showToastWhenNew && !isKnown) {
                pushToast(nextItem);
            }

            setItems((current) => {
                const map = new Map(current.map((item) => [`${item.target}:${item.id}`, item]));
                map.set(fullKey, nextItem);
                return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
            });
        };

        const handleEnvelope = (target: string, rawData: string) => {
            try {
                const envelope = JSON.parse(rawData) as StreamEnvelope;
                if (!envelope || typeof envelope !== "object") return;

                if (envelope.path === "/") {
                    const snapshotItems = toArray(envelope.data, target);
                    mergeItems(target, snapshotItems);

                    for (const item of snapshotItems) {
                        knownNotificationKeysRef.current.add(`${item.target}:${item.id}`);
                    }

                    initializedTargetsRef.current.add(target);
                    return;
                }

                const basePath = String(envelope.path ?? "").replace(/^\//, "");
                if (!basePath) return;

                const isInitialized = initializedTargetsRef.current.has(target);

                if (basePath.includes("/")) {
                    const [key, field] = basePath.split("/");
                    if (!key || !field) return;

                    const value = envelope.data;
                    setItems((current) => {
                        const map = new Map(current.map((item) => [`${item.target}:${item.id}`, item]));
                        const fullKey = `${target}:${key}`;
                        const existing = map.get(fullKey);
                        if (!existing) return current;

                        const patched: NotificationItem = { ...existing };
                        if (field === "title") patched.title = String(value ?? patched.title);
                        if (field === "body") patched.body = String(value ?? patched.body);
                        if (field === "type") patched.type = typeof value === "string" ? value : patched.type;
                        if (field === "order_id") patched.orderId = typeof value === "number" ? value : patched.orderId;
                        if (field === "order_data") patched.orderData = value;
                        if (field === "seen_by") patched.seenBy = toRecord(value) as Record<string, number>;
                        if (field === "created_at") patched.createdAt = Number(value ?? patched.createdAt);

                        map.set(fullKey, patched);
                        return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
                    });

                    if (isInitialized) {
                        knownNotificationKeysRef.current.add(`${target}:${key}`);
                    }
                    return;
                }

                upsertItem(target, basePath, envelope.data as NotificationPayload | null, isInitialized);
            } catch {
                // Ignore malformed event payloads.
            }
        };

        for (const target of streamTargets) {
            const streamUrl = `${base}/notifications/${encodeURIComponent(target)}.json`;
            const source = new EventSource(streamUrl);

            source.addEventListener("put", (event) => {
                handleEnvelope(target, (event as MessageEvent<string>).data);
            });
            source.addEventListener("patch", (event) => {
                handleEnvelope(target, (event as MessageEvent<string>).data);
            });
            source.onmessage = (event) => {
                handleEnvelope(target, event.data);
            };

            sources.push(source);
        }

        return () => {
            for (const source of sources) {
                source.close();
            }
        };
    }, [streamTargets]);

    const unreadCount = useMemo(() => items.filter((item) => !isSeenByViewer(item, viewerKey, localSeenKeys)).length, [items, localSeenKeys, viewerKey]);
    const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / pageSize)), [items.length]);
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const pagedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [currentPage, items]);

    async function syncSeenToFirebase(item: NotificationItem) {
        const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_FIREBASE_DB_URL ?? "");
        if (!base) return;

        const seenBy = { ...(item.seenBy ?? {}), [viewerKey]: timestampMs() };
        const url = `${base}/notifications/${encodeURIComponent(item.target)}/${encodeURIComponent(item.id)}.json`;

        await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                seen: true,
                seen_by: seenBy,
                seen_at: timestampMs(),
            }),
        });
    }

    async function markAsSeen(item: NotificationItem) {
        const key = `${item.target}:${item.id}`;
        setLocalSeenKeys((current) => new Set(current).add(key));

        try {
            await syncSeenToFirebase(item);
        } catch {
            // Keep local seen state even when sync fails.
        }

        // Keep dropdown content visible; navigation is handled by explicit button.
    }

    async function markAllAsSeen() {
        const keys = new Set(items.map((item) => `${item.target}:${item.id}`));
        setLocalSeenKeys(keys);
        await Promise.allSettled(items.map((item) => syncSeenToFirebase(item)));
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
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => void markAllAsSeen()}>
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
                            {pagedItems.map((item) => {
                                const key = `${item.target}:${item.id}`;
                                const isSeen = isSeenByViewer(item, viewerKey, localSeenKeys);
                                const detail = extractOrderSummary(item.orderData);
                                const amount = formatCurrency(detail.totalAmount);
                                const bodyText = normalizeNotificationBody(item.body, detail.orderId ?? item.orderId);
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${isSeen ? "bg-background" : "bg-muted/60 font-semibold"}`}
                                        onClick={() => void markAsSeen(item)}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="line-clamp-1 text-sm">{item.title}</p>
                                            {!isSeen ? <Badge className="bg-red-500 text-white hover:bg-red-500">Mới</Badge> : null}
                                        </div>
                                        <p className={`mt-1 line-clamp-2 text-xs ${isSeen ? "text-muted-foreground" : "text-foreground"}`}>{bodyText}</p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                                        {(detail.orderId || detail.customerName || amount || detail.itemCount) ? (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {detail.orderId ? <Badge variant="secondary">Đơn #{detail.orderId}</Badge> : null}
                                                {detail.customerName ? <Badge variant="secondary">Khách: {detail.customerName}</Badge> : null}
                                                {amount ? <Badge variant="secondary">Tổng: {amount}</Badge> : null}
                                                {detail.itemCount ? <Badge variant="secondary">SL: {detail.itemCount}</Badge> : null}
                                            </div>
                                        ) : null}
                                        {(item.orderId || item.type === "new_order") ? (
                                            <div className="mt-2">
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="h-auto p-0 text-xs"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        router.push("/admin/orders");
                                                    }}
                                                >
                                                    Mở trang đơn hàng
                                                </Button>
                                            </div>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                {items.length > 0 ? (
                    <>
                        <DropdownMenuSeparator />
                        <div className="flex items-center justify-between px-3 py-2 text-xs">
                            <span className="text-muted-foreground">Trang {currentPage}/{totalPages}</span>
                            <div className="flex gap-1">
                                <Button type="button" variant="outline" size="sm" className="h-7 px-2" disabled={currentPage <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                                    Trước
                                </Button>
                                <Button type="button" variant="outline" size="sm" className="h-7 px-2" disabled={currentPage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                                    Sau
                                </Button>
                            </div>
                        </div>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
