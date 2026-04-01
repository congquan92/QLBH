import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGhnAddressOptions } from "@/hooks/useGhnAddressOptions";
import { Loader2, Pencil, RefreshCcw, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SupplierFormValues, SupplierRow } from "./inventory-types";

type SupplierManagementProps = {
  suppliers: SupplierRow[];
  isLoading: boolean;
  isSaving: boolean;
  onRefresh: () => Promise<void>;
  onSearch: (params: { keyword?: string; status?: string }) => Promise<void>;
  onGetDetail: (id: number) => Promise<SupplierFormValues>;
  onCreate: (payload: SupplierFormValues) => Promise<void>;
  onUpdate: (id: number, payload: SupplierFormValues) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRestore: (id: number) => Promise<void>;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
};

const EMPTY_FORM: SupplierFormValues = {
  name: "",
  phone: "",
  address: "",
  ward: "",
  district: "",
  province: "",
  status: "ACTIVE",
};

function supplierStatusBadge(status: string) {
  if (status === "DISABLED") return "bg-rose-100 text-rose-700";
  if (status === "INACTIVE") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export function SupplierManagement({
  suppliers,
  isLoading,
  isSaving,
  onRefresh,
  onSearch,
  onGetDetail,
  onCreate,
  onUpdate,
  onDelete,
  onRestore,
  createOpen,
  onCreateOpenChange,
}: SupplierManagementProps) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [form, setForm] = useState<SupplierFormValues>(EMPTY_FORM);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const {
    provinces,
    districts,
    wards,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
  } = useGhnAddressOptions(selectedProvinceId, selectedDistrictId);

  const resolvedProvinceValue =
    selectedProvinceId &&
    provinces.some((item) => String(item.ProvinceID) === selectedProvinceId)
      ? selectedProvinceId
      : form.province
        ? (provinces.find((item) => item.ProvinceName === form.province)
            ?.ProvinceID?.toString() ?? "")
        : "";

  const resolvedDistrictValue =
    selectedDistrictId &&
    districts.some((item) => String(item.DistrictID) === selectedDistrictId)
      ? selectedDistrictId
      : form.district
        ? (districts.find((item) => item.DistrictName === form.district)
            ?.DistrictID?.toString() ?? "")
        : "";

  const resolvedWardValue =
    form.wardId && wards.some((item) => item.WardCode === form.wardId)
      ? form.wardId
      : form.ward
        ? (wards.find((item) => item.WardName === form.ward)?.WardCode ?? "")
        : "";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void onSearch({
        keyword: keyword.trim() || undefined,
        status,
      });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [keyword, status, onSearch]);

  async function startEdit(id: number) {
    setIsLoadingDetail(true);
    onCreateOpenChange(true);

    try {
      const detail = await onGetDetail(id);
      setForm(detail);
      setSelectedProvinceId(detail.provinceId ?? "");
      setSelectedDistrictId(detail.districtId ?? "");
    } catch {
      onCreateOpenChange(false);
      toast.error("Không tải được chi tiết nhà cung cấp.");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  useEffect(() => {
    if (!createOpen) {
      queueMicrotask(() => {
        setForm(EMPTY_FORM);
        setSelectedProvinceId("");
        setSelectedDistrictId("");
      });
    }
  }, [createOpen]);

  useEffect(() => {
    if (!createOpen || selectedProvinceId || !form.province) return;

    const matchedProvince = provinces.find(
      (item) => item.ProvinceName === form.province,
    );
    if (matchedProvince) {
      queueMicrotask(() => {
        setSelectedProvinceId(String(matchedProvince.ProvinceID));
      });
    }
  }, [createOpen, form.province, provinces, selectedProvinceId]);

  useEffect(() => {
    if (!createOpen || selectedDistrictId || !form.district) return;

    const matchedDistrict = districts.find(
      (item) => item.DistrictName === form.district,
    );
    if (matchedDistrict) {
      queueMicrotask(() => {
        setSelectedDistrictId(String(matchedDistrict.DistrictID));
      });
    }
  }, [createOpen, form.district, districts, selectedDistrictId]);

  async function submitForm() {
    if (!form.name.trim()) return;
    if (!form.phone.trim()) return;

    const hasFullLocation =
      !!form.province?.trim() &&
      !!form.district?.trim() &&
      !!form.ward?.trim() &&
      !!form.provinceId?.trim() &&
      !!form.districtId?.trim() &&
      !!form.wardId?.trim();

    if (!hasFullLocation) {
      toast.error(
        "Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã để lưu đúng bộ dữ liệu địa chỉ.",
      );
      return;
    }

    if (form.id) {
      await onUpdate(form.id, form);
    } else {
      await onCreate(form);
    }
    onCreateOpenChange(false);
    setForm(EMPTY_FORM);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Nhà cung cấp</CardTitle>
            <CardDescription>
              Quản lý đối tác cung ứng, thông tin liên hệ và trạng thái hoạt
              động.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void onRefresh()}
              disabled={isLoading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-3">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên, số điện thoại, địa chỉ..."
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground md:justify-self-end md:self-center">
            {suppliers.length} bản ghi
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nhà cung cấp</th>
                <th className="px-4 py-3">Liên hệ</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((item) => (
                <tr key={item.id} className="border-b align-top">
                  <td className="px-4 py-3 font-medium">#{item.id}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">
                    <p>{item.phone || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[item.address, item.ward, item.district, item.province]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={supplierStatusBadge(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void startEdit(item.id)}
                        disabled={isSaving || isLoadingDetail}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {item.status === "INACTIVE" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => void onRestore(item.id)}
                          title="Khôi phục"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {item.status !== "DISABLED" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSaving || item.status === "INACTIVE"}
                          onClick={() => {
                            if (!confirm(`Tạm ngừng nhà cung cấp #${item.id}?`))
                              return;
                            void onDelete(item.id);
                          }}
                          title="Tạm ngừng"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && suppliers.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-muted-foreground" colSpan={6}>
                    Không có dữ liệu nhà cung cấp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải danh sách nhà cung cấp...
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {form.id
                ? `Cập nhật nhà cung cấp #${form.id}`
                : "Thêm nhà cung cấp"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tên nhà cung cấp</Label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Địa chỉ</Label>
              <Input
                value={form.address}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, address: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phường / Xã</Label>
              <Select
                value={resolvedWardValue}
                onValueChange={(value) => {
                  const selectedWard = wards.find(
                    (item) => item.WardCode === value,
                  );
                  setForm((prev) => ({
                    ...prev,
                    ward: selectedWard?.WardName ?? "",
                    wardId: value,
                  }));
                }}
                disabled={!selectedDistrictId || isLoadingWards}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingWards
                        ? "Đang tải phường/xã..."
                        : "Chọn phường/xã"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((item) => (
                    <SelectItem key={item.WardCode} value={item.WardCode}>
                      {item.WardName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quận / Huyện</Label>
              <Select
                value={resolvedDistrictValue}
                onValueChange={(value) => {
                  const selected = districts.find(
                    (item) => String(item.DistrictID) === value,
                  );
                  setSelectedDistrictId(value);
                  setForm((prev) => ({
                    ...prev,
                    district: selected?.DistrictName ?? "",
                    districtId: value,
                    ward: "",
                    wardId: "",
                  }));
                }}
                disabled={!selectedProvinceId || isLoadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingDistricts
                        ? "Đang tải quận/huyện..."
                        : "Chọn quận/huyện"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((item) => (
                    <SelectItem
                      key={item.DistrictID}
                      value={String(item.DistrictID)}
                    >
                      {item.DistrictName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tỉnh / Thành phố</Label>
              <Select
                value={resolvedProvinceValue}
                onValueChange={(value) => {
                  const selected = provinces.find(
                    (item) => String(item.ProvinceID) === value,
                  );
                  setSelectedProvinceId(value);
                  setSelectedDistrictId("");
                  setForm((prev) => ({
                    ...prev,
                    province: selected?.ProvinceName ?? "",
                    provinceId: value,
                    district: "",
                    districtId: "",
                    ward: "",
                    wardId: "",
                  }));
                }}
                disabled={isLoadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingProvinces
                        ? "Đang tải tỉnh/thành..."
                        : "Chọn tỉnh/thành"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((item) => (
                    <SelectItem
                      key={item.ProvinceID}
                      value={String(item.ProvinceID)}
                    >
                      {item.ProvinceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.id && (
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: value as SupplierFormValues["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onCreateOpenChange(false)}>
              Đóng
            </Button>
            <Button disabled={isSaving || isLoadingDetail} onClick={() => void submitForm()}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoadingDetail ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {form.id ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
