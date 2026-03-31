"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { ProductApi } from "@/api/product.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Helper } from "@/lib/helper";
import type { ProductDetail } from "@/types/product";
import { AlertTriangle, Loader2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type StockAlertItem = {
    productId: number;
    productName: string;
    variantId: number;
    sku: string;
    attributesLabel: string;
    quantity: number;
    pendingImportIds: number[];
};

const LOW_STOCK_THRESHOLD = 10;

function toSafeString(value: unknown): string {
    return String(value ?? "").trim();
}

function normalizePendingImports(items: Array<Record<string, unknown>>): Map<number, Set<number>> {
    const map = new Map<number, Set<number>>();

    for (const item of items) {
        const status = toSafeString(item.status).toUpperCase();
        if (status !== "PENDING") {
            continue;
        }

        const importId = Number(item.id ?? 0);
        const details = (item.importDetail as Array<Record<string, unknown>> | undefined) ?? (item.import_detail as Array<Record<string, unknown>> | undefined) ?? [];

        for (const detail of details) {
            const variantId = Number(detail.product_variant_id ?? detail.productVariantId ?? 0);
            if (!Number.isFinite(variantId) || variantId <= 0) {
                continue;
            }

            if (!map.has(variantId)) {
                map.set(variantId, new Set<number>());
            }

            if (importId > 0) {
                map.get(variantId)?.add(importId);
            }
        }
    }

    return map;
}

function toStockAlerts(detail: ProductDetail, pendingMap: Map<number, Set<number>>): StockAlertItem[] {
    return (detail.productVariant ?? [])
        .map((variant) => {
            const variantId = Number(variant.id ?? 0);
            const attrs = (variant.variantAttributes ?? [])
                .map((item) => `${toSafeString(item.attribute)}: ${toSafeString(item.value)}`)
                .filter(Boolean)
                .join(" | ");

            return {
                productId: Number(detail.id ?? 0),
                productName: toSafeString(detail.name) || `Product #${String(detail.id ?? "-")}`,
                variantId,
                sku: toSafeString(variant.sku),
                attributesLabel: attrs,
                quantity: Number(variant.quantity ?? 0),
                pendingImportIds: Array.from(pendingMap.get(variantId) ?? []),
            } satisfies StockAlertItem;
        })
        .filter((item) => item.variantId > 0 && Number.isFinite(item.quantity) && item.quantity <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.quantity - b.quantity);
}

export function AdminStockAlertBell() {
    const router = useRouter();
    const [items, setItems] = useState<StockAlertItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedVariantIds, setSelectedVariantIds] = useState<Set<number>>(new Set());

    const needsActionCount = useMemo(() => items.filter((item) => item.pendingImportIds.length === 0).length, [items]);

    const loadStockAlerts = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const [importsRes, productRes] = await Promise.all([
                AdminCrudApi.getImportProducts({ page: 1, size: 300, sort: "id:desc" }),
                ProductApi.getAdminProducts(1, 200),
            ]);

            const pendingMap = normalizePendingImports((importsRes.data.data as Array<Record<string, unknown>>) ?? []);
            const products = (productRes.data.data ?? []).filter((item) => toSafeString(item.status).toUpperCase() !== "INACTIVE");

            const detailResults = await Promise.allSettled(products.map((item) => ProductApi.getAdminProductDetail(item.id)));
            const nextItems: StockAlertItem[] = [];

            for (const result of detailResults) {
                if (result.status !== "fulfilled") {
                    continue;
                }

                nextItems.push(...toStockAlerts(result.value.data, pendingMap));
            }

            setItems(nextItems);
            setSelectedVariantIds((prev) => {
                const next = new Set<number>();
                for (const item of nextItems) {
                    if (prev.has(item.variantId)) {
                        next.add(item.variantId);
                    }
                }
                return next;
            });
            setLoaded(true);
        } catch (error) {
            setErrorMessage(Helper.errorMessage(error));
            setLoaded(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectedCount = selectedVariantIds.size;

    function openInventoryWithSelection(useSelectedOnly: boolean) {
        const variantIds = useSelectedOnly ? Array.from(selectedVariantIds) : items.map((item) => item.variantId);
        const cleanedIds = Array.from(new Set(variantIds.filter((id) => Number.isFinite(id) && id > 0)));
        if (cleanedIds.length === 0) {
            router.push("/admin/inventory");
            return;
        }

        router.push(`/admin/inventory?lowStock=${cleanedIds.join(",")}`);
    }

    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (open && !loaded && !isLoading) {
                    void loadStockAlerts();
                }
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" aria-label="Cảnh báo tồn kho biến thể">
                    <AlertTriangle className="h-4 w-4" />
                    {needsActionCount > 0 ? (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                            {needsActionCount > 99 ? "99+" : needsActionCount}
                        </span>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-120 max-w-[95vw] p-0">
                <div className="flex items-center justify-between px-3 py-2">
                    <DropdownMenuLabel className="p-0">Cảnh báo biến thể sắp hết hàng</DropdownMenuLabel>
                    <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => void loadStockAlerts()} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="mr-1 h-3.5 w-3.5" />}
                            Làm mới
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openInventoryWithSelection(false)}>
                            Mở kho hàng
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openInventoryWithSelection(true)} disabled={selectedCount === 0}>
                            Tới kho ({selectedCount})
                        </Button>
                    </div>
                </div>
                <DropdownMenuSeparator />

                <div className="max-h-96 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="rounded-md p-3 text-sm text-muted-foreground">Đang tải cảnh báo tồn kho...</div>
                    ) : errorMessage ? (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
                    ) : items.length === 0 ? (
                        <div className="rounded-md p-3 text-sm text-muted-foreground">Không có biến thể nào sắp hết hàng.</div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <label key={`${item.productId}-${item.variantId}`} className="flex cursor-pointer items-start gap-2 rounded-md border p-3 hover:bg-muted/30">
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4"
                                        checked={selectedVariantIds.has(item.variantId)}
                                        onChange={(event) => {
                                            setSelectedVariantIds((prev) => {
                                                const next = new Set(prev);
                                                if (event.target.checked) {
                                                    next.add(item.variantId);
                                                } else {
                                                    next.delete(item.variantId);
                                                }
                                                return next;
                                            });
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="line-clamp-1 text-sm font-semibold">{item.productName}</p>
                                        <Badge className={item.quantity <= 1 ? "bg-red-500 text-white hover:bg-red-500" : "bg-amber-500 text-white hover:bg-amber-500"}>Tồn: {item.quantity}</Badge>
                                    </div>

                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">SKU: {item.sku || `#${item.variantId}`}</p>
                                    {item.attributesLabel ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.attributesLabel}</p> : null}

                                    <div className="mt-2">
                                        {item.pendingImportIds.length > 0 ? (
                                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                                                Đang ở đơn nhập PENDING: #{item.pendingImportIds.slice(0, 3).join(", #")}
                                                {item.pendingImportIds.length > 3 ? "..." : ""}
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-500 text-white hover:bg-red-500">Chưa có đơn nhập PENDING</Badge>
                                        )}
                                    </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
