"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { OrderApi } from "@/api/order.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { OrderSummary } from "@/types/order";
import { OrdersHeader } from "./_components/orders-header";
import { OrdersFilters, type OrderFiltersState } from "./_components/orders-filters";
import { OrdersTable } from "./_components/orders-table";

const DEFAULT_FILTERS: OrderFiltersState = {
    keyword: "",
    deliveryStatus: "",
    startDate: "",
    endDate: "",
    deliveryDistrict: "",
    deliveryProvince: "",
};

export default function OrdersPage() {
    useAdminAuth();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [draftFilters, setDraftFilters] = useState<OrderFiltersState>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<OrderFiltersState>(DEFAULT_FILTERS);

    const districtOptions = useMemo(() => {
        const values = orders.map((o) => String(o.deliveryDistrictName ?? "").trim()).filter((v) => v.length > 0);
        return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "vi"));
    }, [orders]);

    const provinceOptions = useMemo(() => {
        const values = orders.map((o) => String(o.deliveryProvinceName ?? "").trim()).filter((v) => v.length > 0);
        return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "vi"));
    }, [orders]);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const orderRes = await OrderApi.getAdminOrders({
                page: 1,
                size: 100,
                sort: "id:desc",
                keyword: appliedFilters.keyword || undefined,
                deliveryStatus: appliedFilters.deliveryStatus || undefined,
                startDate: appliedFilters.startDate || undefined,
                endDate: appliedFilters.endDate || undefined,
                deliveryDistrict: appliedFilters.deliveryDistrict || undefined,
                deliveryProvince: appliedFilters.deliveryProvince || undefined,
            });
            setOrders(orderRes.data.data);
        } catch {
            toast.error("Không thể tải danh sách đơn hàng");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [appliedFilters]);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);

    function applyFilters() {
        setAppliedFilters(draftFilters);
    }

    function resetFilters() {
        setDraftFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    }

    async function handleChangeStatus(orderId: number, newStatus: string) {
        setUpdatingOrderId(orderId);
        try {
            const res = await OrderApi.changeStatus(orderId, newStatus);
            if (res.status === 200) {
                toast.success(`Đã cập nhật trạng thái đơn #${orderId}`);
                await fetchOrders();
            } else {
                toast.error(res.message || "Không thể cập nhật trạng thái");
            }
        } catch {
            toast.error("Không thể cập nhật trạng thái");
        } finally {
            setUpdatingOrderId(null);
        }
    }

    async function handleCancelOrder(orderId: number) {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

        setUpdatingOrderId(orderId);
        try {
            const res = await OrderApi.cancel(orderId);
            if (res.status === 200) {
                toast.success(`Đã hủy đơn hàng #${orderId}`);
                await fetchOrders();
            } else {
                toast.error(res.message || "Không thể hủy đơn hàng");
            }
        } catch {
            toast.error("Không thể hủy đơn hàng");
        } finally {
            setUpdatingOrderId(null);
        }
    }

    return (
        <div className="space-y-4">
            <OrdersHeader />

            <OrdersFilters filters={draftFilters} districtOptions={districtOptions} provinceOptions={provinceOptions} onChange={(next) => setDraftFilters((prev) => ({ ...prev, ...next }))} onApply={applyFilters} onReset={resetFilters} />

            {isLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải danh sách đơn hàng...
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đơn hàng</CardTitle>
                    <CardDescription>Trạng thái chỉ cho phép cập nhật theo luồng kế tiếp, không thể quay ngược.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OrdersTable orders={orders} isLoading={isLoading} updatingOrderId={updatingOrderId} onChangeStatus={handleChangeStatus} onCancelOrder={handleCancelOrder} />
                </CardContent>
            </Card>
        </div>
    );
}
