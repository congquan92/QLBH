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
import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function OrdersPage() {
  useAdminAuth();
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
    void fetchOrders();
  }, [fetchOrders]);

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
