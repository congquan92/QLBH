"use client";

import { GhnApi, type GhnDistrict, type GhnProvince } from "@/api/ghn.api";
import { OrderApi } from "@/api/order.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { OrderSummary } from "@/types/order";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  OrdersFilters,
  type OrderFiltersState,
} from "./_components/orders-filters";
import { OrdersHeader } from "./_components/orders-header";
import { OrdersTable } from "./_components/orders-table";

const DEFAULT_FILTERS: OrderFiltersState = {
  keyword: "",
  deliveryStatus: "",
  startDate: "",
  endDate: "",
  deliveryDistrict: "",
  deliveryProvince: "",
};

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function normalizeRoleTarget(roleName?: string) {
  const role = String(roleName ?? "").trim().toLowerCase();
  if (!role) return "";
  if (role.startsWith("role_")) return role;
  return `role_${role}`;
}

export default function OrdersPage() {
  const { session } = useAdminAuth();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") ?? "";
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [draftFilters, setDraftFilters] =
    useState<OrderFiltersState>({ ...DEFAULT_FILTERS, keyword: initialKeyword });
  const [appliedFilters, setAppliedFilters] =
    useState<OrderFiltersState>({ ...DEFAULT_FILTERS, keyword: initialKeyword });
  const [provinceOptions, setProvinceOptions] = useState<GhnProvince[]>([]);
  const [districtOptions, setDistrictOptions] = useState<GhnDistrict[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const fetchOrdersRef = useRef<() => Promise<void>>(async () => {});
  const realtimeRefreshTimeoutRef = useRef<number | null>(null);
  const notificationInitializedTargetsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const nextKeyword = searchParams.get("keyword") ?? "";
    setDraftFilters((prev) => ({ ...prev, keyword: nextKeyword }));
    setAppliedFilters((prev) => ({ ...prev, keyword: nextKeyword }));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setIsLoadingLocations(true);

    void Promise.all([GhnApi.getProvinces(), GhnApi.getDistricts()])
      .then(([provinces, districts]) => {
        if (!active) return;
        setProvinceOptions(provinces);
        setDistrictOptions(districts);
      })
      .catch(() => {
        if (!active) return;
        toast.error("Không thể tải danh sách tỉnh/quận từ GHN.");
        setProvinceOptions([]);
        setDistrictOptions([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingLocations(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const districtNameOptions = useMemo(() => {
    const selectedProvince = provinceOptions.find(
      (item) => item.ProvinceName === draftFilters.deliveryProvince,
    );
    const candidateDistricts = selectedProvince
      ? districtOptions.filter(
          (item) => item.ProvinceID === selectedProvince.ProvinceID,
        )
      : districtOptions;
    return candidateDistricts.map((item) => item.DistrictName);
  }, [districtOptions, draftFilters.deliveryProvince, provinceOptions]);

  const provinceNameOptions = useMemo(
    () => provinceOptions.map((item) => item.ProvinceName),
    [provinceOptions],
  );

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
    fetchOrdersRef.current = fetchOrders;
  }, [fetchOrders]);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (realtimeRefreshTimeoutRef.current !== null) {
      window.clearTimeout(realtimeRefreshTimeoutRef.current);
    }

    realtimeRefreshTimeoutRef.current = window.setTimeout(() => {
      void fetchOrdersRef.current();
    }, 300);
  }, []);

  const notificationTargets = useMemo(() => {
    const fromSession = normalizeRoleTarget(session?.roleName);
    return Array.from(new Set(["role_admin", "role_order_staff", fromSession].filter(Boolean)));
  }, [session?.roleName]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_FIREBASE_DB_URL ?? "");
    if (!base) {
      return;
    }

    const source = new EventSource(`${base}/orders.json`);

    const handleRealtimeEvent = (raw: string) => {
      try {
        const payload = JSON.parse(raw) as { path?: string; data?: unknown };
        if (!payload || typeof payload !== "object") return;

        const path = String(payload.path ?? "");
        if (path === "/" || /^\/order_\d+/.test(path)) {
          scheduleRealtimeRefresh();
        }
      } catch {
        // Ignore malformed realtime payload.
      }
    };

    source.addEventListener("put", (event) => {
      handleRealtimeEvent((event as MessageEvent<string>).data);
    });

    source.addEventListener("patch", (event) => {
      handleRealtimeEvent((event as MessageEvent<string>).data);
    });

    source.onmessage = (event) => {
      handleRealtimeEvent(event.data);
    };

    return () => {
      source.close();
      if (realtimeRefreshTimeoutRef.current !== null) {
        window.clearTimeout(realtimeRefreshTimeoutRef.current);
      }
    };
  }, [scheduleRealtimeRefresh]);

  useEffect(() => {
    const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_FIREBASE_DB_URL ?? "");
    if (!base || notificationTargets.length === 0) {
      return;
    }

    const sources: EventSource[] = [];

    const shouldRefreshFromNotification = (path: string, data: unknown, target: string) => {
      if (path === "/") {
        if (!notificationInitializedTargetsRef.current.has(target)) {
          notificationInitializedTargetsRef.current.add(target);
          return false;
        }
        return false;
      }

      // New notification entry: /{notificationId}
      if (/^\/[^/]+$/.test(path) && data && typeof data === "object") {
        const type = String((data as { type?: unknown }).type ?? "").toLowerCase();
        return type === "new_order" || type === "order_status_admin";
      }

      // Type field updated: /{notificationId}/type
      if (/^\/[^/]+\/type$/.test(path)) {
        const type = String(data ?? "").toLowerCase();
        return type === "new_order" || type === "order_status_admin";
      }

      return false;
    };

    const handleNotificationEvent = (target: string, raw: string) => {
      try {
        const payload = JSON.parse(raw) as { path?: string; data?: unknown };
        if (!payload || typeof payload !== "object") return;

        const path = String(payload.path ?? "");
        if (shouldRefreshFromNotification(path, payload.data, target)) {
          scheduleRealtimeRefresh();
        }
      } catch {
        // Ignore malformed realtime payload.
      }
    };

    for (const target of notificationTargets) {
      const source = new EventSource(`${base}/notifications/${encodeURIComponent(target)}.json`);

      source.addEventListener("put", (event) => {
        handleNotificationEvent(target, (event as MessageEvent<string>).data);
      });

      source.addEventListener("patch", (event) => {
        handleNotificationEvent(target, (event as MessageEvent<string>).data);
      });

      source.onmessage = (event) => {
        handleNotificationEvent(target, event.data);
      };

      sources.push(source);
    }

    return () => {
      for (const source of sources) {
        source.close();
      }
    };
  }, [notificationTargets, scheduleRealtimeRefresh]);

  function applyFilters() {
    setAppliedFilters(draftFilters);
  }

  function resetFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }

  function handleDraftFiltersChange(next: Partial<OrderFiltersState>) {
    setDraftFilters((prev) => {
      const merged = { ...prev, ...next };

      if (Object.prototype.hasOwnProperty.call(next, "deliveryProvince")) {
        merged.deliveryDistrict = "";
      }

      return merged;
    });
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

  return (
    <div className="space-y-4">
      <OrdersHeader />

      <OrdersFilters
        filters={draftFilters}
        districtOptions={districtNameOptions}
        provinceOptions={provinceNameOptions}
        isLoadingLocations={isLoadingLocations}
        onChange={handleDraftFiltersChange}
        onApply={applyFilters}
        onReset={resetFilters}
      />


      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <CardDescription>
            Trạng thái chỉ cho phép cập nhật theo luồng kế tiếp, không thể quay
            ngược.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable
            orders={orders}
            isLoading={isLoading}
            updatingOrderId={updatingOrderId}
            onChangeStatus={handleChangeStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
}
