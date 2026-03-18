import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange, Funnel, MapPin, Search, Sparkles } from "lucide-react";
import { DELIVERY_STATUSES } from "./order-status";

export type OrderFiltersState = {
  keyword: string;
  deliveryStatus: string;
  startDate: string;
  endDate: string;
  deliveryDistrict: string;
  deliveryProvince: string;
};

type OrdersFiltersProps = {
  filters: OrderFiltersState;
  districtOptions: string[];
  provinceOptions: string[];
  isLoadingLocations?: boolean;
  onChange: (next: Partial<OrderFiltersState>) => void;
  onApply: () => void;
  onReset: () => void;
};

export function OrdersFilters({
  filters,
  districtOptions,
  provinceOptions,
  isLoadingLocations = false,
  onChange,
  onApply,
  onReset,
}: OrdersFiltersProps) {
  const activeFilterCount = [
    filters.keyword,
    filters.deliveryStatus,
    filters.deliveryDistrict,
    filters.deliveryProvince,
    filters.startDate,
    filters.endDate,
  ].filter((value) => value.trim().length > 0).length;
  return (  
    <Card className="overflow-hidden border-orange-200/80 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Funnel className="size-4 text-orange-600 " />
            Bộ lọc đơn hàng
          </CardTitle>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-200 ">
            <Sparkles className="size-3.5" />
            {activeFilterCount} điều kiện đang chọn
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Mã đơn, tên khách hàng, mã vận đơn..."
              value={filters.keyword}
              onChange={(e) => onChange({ keyword: e.target.value })}
            />
          </div>

          <Select
            value={filters.deliveryStatus || "ALL"}
            onValueChange={(value) =>
              onChange({ deliveryStatus: value === "ALL" ? "" : value })
            }
          >
            <SelectTrigger className="border-orange-200/70 focus:ring-orange-200 dark:border-orange-900/60 dark:focus:ring-orange-900/60">
              <SelectValue placeholder="Tình trạng đơn hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {DELIVERY_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.deliveryDistrict || "ALL"}
            onValueChange={(value) =>
              onChange({ deliveryDistrict: value === "ALL" ? "" : value })
            }
          >
            <SelectTrigger className="border-orange-200/70 focus:ring-orange-200 dark:border-orange-900/60 dark:focus:ring-orange-900/60">
              <SelectValue
                placeholder={
                  isLoadingLocations ? "Đang tải quận/huyện..." : "Quận/Huyện"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả quận/huyện</SelectItem>
              {districtOptions.map((district, index) => (
                <SelectItem key={index} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.deliveryProvince || "ALL"}
            onValueChange={(value) =>
              onChange({ deliveryProvince: value === "ALL" ? "" : value })
            }
          >
            <SelectTrigger className="border-orange-200/70 focus:ring-orange-200 dark:border-orange-900/60 dark:focus:ring-orange-900/60">
              <SelectValue
                placeholder={
                  isLoadingLocations
                    ? "Đang tải tỉnh/thành..."
                    : "Tỉnh/Thành phố"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả tỉnh/thành phố</SelectItem>
              {provinceOptions.map((province, index) => (
                <SelectItem key={index} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              type="date"
              value={filters.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </div>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              type="date"
              value={filters.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Lọc theo khu vực giao hàng và khoảng thời gian đặt đơn.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onReset}>
              Xóa bộ lọc
            </Button>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500"
              onClick={onApply}
            >
              Áp dụng bộ lọc
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
