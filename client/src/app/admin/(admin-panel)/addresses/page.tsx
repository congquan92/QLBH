"use client";

import { UserApi } from "@/api/user.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGhnAddressOptions } from "@/hooks/useGhnAddressOptions";
import type { UserAddress } from "@/types/user";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type AddressForm = {
  customer_name: string;
  phone: string;
  province: string;
  province_id: string;
  district: string;
  district_id: string;
  ward: string;
  ward_id: string;
  address_type: string;
  address: string;
};

const emptyForm: AddressForm = {
  customer_name: "",
  phone: "",
  province: "",
  province_id: "",
  district: "",
  district_id: "",
  ward: "",
  ward_id: "",
  address_type: "HOME",
  address: "",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const {
    provinces,
    districts,
    wards,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
  } = useGhnAddressOptions(form.province_id, form.district_id);

  const pageTitle = useMemo(
    () => (editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ"),
    [editingId],
  );

  async function fetchAddresses() {
    setIsLoading(true);
    try {
      const res = await UserApi.getMyAddresses({
        page: 1,
        size: 100,
        sort: "id:desc",
      });
      setAddresses(res.data?.data ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách địa chỉ",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchAddresses();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function beginEdit(item: UserAddress) {
    setEditingId(item.id);
    setForm({
      customer_name: String(item.fullName ?? item.customer_name ?? ""),
      phone: String(item.phone ?? ""),
      province: String(item.provinceName ?? item.province ?? ""),
      province_id: String(item.provinceId ?? ""),
      district: String(item.districtName ?? item.district ?? ""),
      district_id: String(item.districtId ?? ""),
      ward: String(item.wardName ?? item.ward ?? ""),
      ward_id: String(item.wardId ?? ""),
      address_type: String(item.address_type ?? "HOME"),
      address: String(item.detail ?? item.address ?? ""),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.customer_name ||
      !form.phone ||
      !form.province ||
      !form.district ||
      !form.ward ||
      !form.address
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ");
      return;
    }

    const provinceId = Number(form.province_id);
    const districtId = Number(form.district_id);
    const wardId = Number(form.ward_id);
    if (
      !Number.isFinite(provinceId) ||
      !Number.isFinite(districtId) ||
      !Number.isFinite(wardId) ||
      provinceId <= 0 ||
      districtId <= 0 ||
      wardId <= 0
    ) {
      toast.error("Mã Tỉnh/Quận/Phường không hợp lệ");
      return;
    }

    setIsSaving(true);
    const payload = {
      customer_name: form.customer_name,
      phone: form.phone,
      province: form.province,
      province_id: provinceId,
      district: form.district,
      district_id: districtId,
      ward: form.ward,
      ward_id: wardId,
      address_type: form.address_type,
      address: form.address,
    };

    try {
      if (editingId) {
        await UserApi.updateAddress(editingId, payload);
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await UserApi.addAddress(payload);
        toast.success("Đã thêm địa chỉ");
      }
      resetForm();
      await fetchAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu địa chỉ",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSetDefault(id: number) {
    setUpdatingId(id);
    try {
      await UserApi.setDefaultAddress(id);
      toast.success("Đã đặt địa chỉ mặc định");
      await fetchAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể đặt mặc định",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    setUpdatingId(id);
    try {
      await UserApi.deleteAddress(id);
      toast.success("Đã xóa địa chỉ");
      await fetchAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa địa chỉ",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Địa chỉ</h1>
        <p className="text-muted-foreground">
          Quản lý danh sách địa chỉ giao hàng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {pageTitle}
          </CardTitle>
          <CardDescription>
            Tạo mới hoặc chỉnh sửa địa chỉ giao hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Họ tên người nhận</Label>
                <Input
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customer_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Loại địa chỉ</Label>
                <Input
                  value={form.address_type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      address_type: e.target.value,
                    }))
                  }
                  placeholder="HOME / WORK"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Tỉnh/Thành</Label>
                <select
                  value={form.province_id}
                  onChange={(e) => {
                    const nextProvinceId = e.target.value;
                    const selectedProvince = provinces.find(
                      (item) => String(item.ProvinceID) === nextProvinceId,
                    );
                    setForm((prev) => ({
                      ...prev,
                      province_id: nextProvinceId,
                      province: selectedProvince?.ProvinceName ?? "",
                      district_id: "",
                      district: "",
                      ward_id: "",
                      ward: "",
                    }));
                  }}
                  disabled={isLoadingProvinces}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingProvinces
                      ? "Đang tải tỉnh/thành..."
                      : "Chọn Tỉnh/Thành"}
                  </option>
                  {provinces.map((province) => (
                    <option
                      key={province.ProvinceID}
                      value={province.ProvinceID}
                    >
                      {province.ProvinceName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Quận/Huyện</Label>
                <select
                  value={form.district_id}
                  onChange={(e) => {
                    const nextDistrictId = e.target.value;
                    const selectedDistrict = districts.find(
                      (item) => String(item.DistrictID) === nextDistrictId,
                    );
                    setForm((prev) => ({
                      ...prev,
                      district_id: nextDistrictId,
                      district: selectedDistrict?.DistrictName ?? "",
                      ward_id: "",
                      ward: "",
                    }));
                  }}
                  disabled={!form.province_id || isLoadingDistricts}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingDistricts
                      ? "Đang tải quận/huyện..."
                      : "Chọn Quận/Huyện"}
                  </option>
                  {districts.map((district) => (
                    <option
                      key={district.DistrictID}
                      value={district.DistrictID}
                    >
                      {district.DistrictName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Phường/Xã</Label>
                <select
                  value={form.ward_id}
                  onChange={(e) => {
                    const nextWardId = e.target.value;
                    const selectedWard = wards.find(
                      (item) => item.WardCode === nextWardId,
                    );
                    setForm((prev) => ({
                      ...prev,
                      ward_id: nextWardId,
                      ward: selectedWard?.WardName ?? "",
                    }));
                  }}
                  disabled={!form.district_id || isLoadingWards}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingWards
                      ? "Đang tải phường/xã..."
                      : "Chọn Phường/Xã"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.WardCode} value={ward.WardCode}>
                      {ward.WardName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ chi tiết</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {editingId ? "Cập nhật" : "Thêm mới"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách địa chỉ</CardTitle>
          <CardDescription>
            Đặt mặc định, chỉnh sửa hoặc xóa địa chỉ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải dữ liệu...
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Chưa có địa chỉ nào.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((item) => {
                const isWorking = updatingId === item.id;
                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium">
                        {String(
                          item.fullName ?? item.customer_name ?? "Khong ro",
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {String(item.phone ?? "")}
                      </div>
                      <div className="text-sm mt-1">
                        {String(item.detail ?? item.address ?? "")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {String(item.wardName ?? item.ward ?? "")} -{" "}
                        {String(item.districtName ?? item.district ?? "")} -{" "}
                        {String(item.provinceName ?? item.province ?? "")}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => beginEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => void handleSetDefault(item.id)}
                        disabled={isWorking}
                      >
                        {isWorking ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Star
                            className={`h-4 w-4 ${item.isDefault ? "fill-yellow-400 text-yellow-500" : ""}`}
                          />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => void handleDelete(item.id)}
                        disabled={isWorking}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
