import type { GhnDistrict, GhnProvince, GhnWard } from "@/api/ghn.api";
import { Button } from "@/components/ui/button";
import { Helper } from "@/lib/helper";
import { CartItem } from "@/types/cart";
import { UserAddress } from "@/types/user";
import { Loader2 } from "lucide-react";
import { NewAddressForm, getAddressValue } from "./cart-utils";

interface CartCheckoutSummaryProps {
  cartItems: CartItem[];
  totalAmount: number;
  selectedItemCount: number;
  selectedTotalAmount: number;
  hasSelectedItems: boolean;
  addresses: UserAddress[];
  selectedAddressId: number | null;
  useNewAddress: boolean;
  newAddress: NewAddressForm;
  provinceOptions: GhnProvince[];
  districtOptions: GhnDistrict[];
  wardOptions: GhnWard[];
  isLoadingProvinces: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;
  paymentType: "COD" | "BANK_TRANSFER";
  note: string;
  isPlacingOrder: boolean;
  onSelectAddress: (addressId: number) => void;
  onUseNewAddressChange: (value: boolean) => void;
  onNewAddressChange: (
    updater: (current: NewAddressForm) => NewAddressForm,
  ) => void;
  onPaymentTypeChange: (value: "COD" | "BANK_TRANSFER") => void;
  onNoteChange: (value: string) => void;
  onCheckout: () => void;
}

export function CartCheckoutSummary({
  cartItems,
  totalAmount,
  selectedItemCount,
  selectedTotalAmount,
  hasSelectedItems,
  addresses,
  selectedAddressId,
  useNewAddress,
  newAddress,
  provinceOptions,
  districtOptions,
  wardOptions,
  isLoadingProvinces,
  isLoadingDistricts,
  isLoadingWards,
  paymentType,
  note,
  isPlacingOrder,
  onSelectAddress,
  onUseNewAddressChange,
  onNewAddressChange,
  onPaymentTypeChange,
  onNoteChange,
  onCheckout,
}: CartCheckoutSummaryProps) {
  return (
    <aside className="h-fit border border-gray-200 bg-gray-50 p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Số dòng sản phẩm</span>
          <span className="font-medium text-gray-900">{cartItems.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Đã chọn thanh toán</span>
          <span className="font-medium text-gray-900">{selectedItemCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tổng tạm tính</span>
          <span className="font-medium text-gray-900">
            {Helper.formatPrice(String(totalAmount))}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="flex items-center justify-between text-lg font-bold text-gray-900">
          <span>Tổng thanh toán</span>
          <span>{Helper.formatPrice(String(selectedTotalAmount))}</span>
        </p>
      </div>

      <section className="space-y-3 border-t border-gray-200 pt-4">
        <h3 className="text-base font-semibold text-gray-900">
          Địa chỉ giao hàng
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onUseNewAddressChange(false)}
            className={`border px-3 py-2 text-xs font-semibold ${!useNewAddress ? "border-red-600 bg-red-600 text-white" : "border-gray-300 bg-white text-gray-700"}`}
          >
            Chọn từ tài khoản
          </button>
          <button
            type="button"
            onClick={() => onUseNewAddressChange(true)}
            className={`border px-3 py-2 text-xs font-semibold ${useNewAddress ? "border-red-600 bg-red-600 text-white" : "border-gray-300 bg-white text-gray-700"}`}
          >
            Nhập địa chỉ mới
          </button>
        </div>

        {!useNewAddress ? (
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">
                Bạn chưa có địa chỉ trong tài khoản. Hãy chuyển sang tab
                &quot;Nhập địa chỉ mới&quot;.
              </p>
            ) : (
              addresses.map((address) => {
                const mapped = getAddressValue(address);
                return (
                  <label
                    key={address.id}
                    className={`block cursor-pointer border p-3 text-sm ${selectedAddressId === address.id ? "border-red-600 bg-red-50" : "border-gray-200 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="shipping-address"
                      className="mr-2"
                      checked={selectedAddressId === address.id}
                      onChange={() => onSelectAddress(address.id)}
                    />
                    <span className="font-semibold text-gray-900">
                      {mapped.customerName || "Địa chỉ"}
                    </span>
                    {address.is_default === 1 ||
                    address.is_default === true ||
                    address.isDefault ? (
                      <span className="ml-2 border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-700">
                        Mặc định
                      </span>
                    ) : null}
                    <p className="mt-1 text-xs text-gray-600">{mapped.phone}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      {[
                        mapped.detail,
                        mapped.ward,
                        mapped.district,
                        mapped.province,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </label>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid gap-2 text-sm">
            <input
              value={newAddress.customer_name}
              onChange={(event) =>
                onNewAddressChange((current) => ({
                  ...current,
                  customer_name: event.target.value,
                }))
              }
              placeholder="Người nhận"
              className="h-9 border border-gray-300 px-3"
            />
            <input
              value={newAddress.phone}
              onChange={(event) =>
                onNewAddressChange((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              placeholder="Số điện thoại"
              className="h-9 border border-gray-300 px-3"
            />
            <select
              value={newAddress.province_id}
              onChange={(event) => {
                const nextProvinceId = event.target.value;
                const selectedProvince = provinceOptions.find(
                  (item) => String(item.ProvinceID) === nextProvinceId,
                );
                onNewAddressChange((current) => ({
                  ...current,
                  province_id: nextProvinceId,
                  province: selectedProvince?.ProvinceName ?? "",
                  district_id: "",
                  district: "",
                  ward_id: "",
                  ward: "",
                }));
              }}
              disabled={isLoadingProvinces}
              className="h-9 border border-gray-300 px-3 disabled:bg-gray-100"
            >
              <option value="">
                {isLoadingProvinces
                  ? "Đang tải tỉnh/thành..."
                  : "Chọn Tỉnh/Thành"}
              </option>
              {provinceOptions.map((province) => (
                <option key={province.ProvinceID} value={province.ProvinceID}>
                  {province.ProvinceName}
                </option>
              ))}
            </select>
            <select
              value={newAddress.district_id}
              onChange={(event) => {
                const nextDistrictId = event.target.value;
                const selectedDistrict = districtOptions.find(
                  (item) => String(item.DistrictID) === nextDistrictId,
                );
                onNewAddressChange((current) => ({
                  ...current,
                  district_id: nextDistrictId,
                  district: selectedDistrict?.DistrictName ?? "",
                  ward_id: "",
                  ward: "",
                }));
              }}
              disabled={!newAddress.province_id || isLoadingDistricts}
              className="h-9 border border-gray-300 px-3 disabled:bg-gray-100"
            >
              <option value="">
                {isLoadingDistricts
                  ? "Đang tải quận/huyện..."
                  : "Chọn Quận/Huyện"}
              </option>
              {districtOptions.map((district) => (
                <option key={district.DistrictID} value={district.DistrictID}>
                  {district.DistrictName}
                </option>
              ))}
            </select>
            <select
              value={newAddress.ward_id}
              onChange={(event) => {
                const nextWardId = event.target.value;
                const selectedWard = wardOptions.find(
                  (item) => item.WardCode === nextWardId,
                );
                onNewAddressChange((current) => ({
                  ...current,
                  ward_id: nextWardId,
                  ward: selectedWard?.WardName ?? "",
                }));
              }}
              disabled={!newAddress.district_id || isLoadingWards}
              className="h-9 border border-gray-300 px-3 disabled:bg-gray-100"
            >
              <option value="">
                {isLoadingWards ? "Đang tải phường/xã..." : "Chọn Phường/Xã"}
              </option>
              {wardOptions.map((ward) => (
                <option key={ward.WardCode} value={ward.WardCode}>
                  {ward.WardName}
                </option>
              ))}
            </select>
            <input
              value={newAddress.address}
              onChange={(event) =>
                onNewAddressChange((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              placeholder="Địa chỉ chi tiết"
              className="h-9 border border-gray-300 px-3"
            />
          </div>
        )}
      </section>

      <section className="space-y-3 border-t border-gray-200 pt-4">
        <h3 className="text-base font-semibold text-gray-900">
          Hình thức chi trả
        </h3>
        <label
          className={`flex cursor-pointer items-center gap-2 border p-3 text-sm ${paymentType === "COD" ? "border-red-600 bg-red-50" : "border-gray-200 bg-white"}`}
        >
          <input
            type="radio"
            name="payment-type"
            checked={paymentType === "COD"}
            onChange={() => onPaymentTypeChange("COD")}
          />
          Tiền mặt (COD)
        </label>
        <label
          className={`flex cursor-pointer items-center gap-2 border p-3 text-sm ${paymentType === "BANK_TRANSFER" ? "border-red-600 bg-red-50" : "border-gray-200 bg-white"}`}
        >
          <input
            type="radio"
            name="payment-type"
            checked={paymentType === "BANK_TRANSFER"}
            onChange={() => onPaymentTypeChange("BANK_TRANSFER")}
          />
          Trực tuyến (VNPay)
        </label>

        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Ghi chú đơn hàng (tuỳ chọn)"
          rows={3}
          className="w-full border border-gray-300 p-3 text-sm"
        />

        <Button
          className="w-full rounded-none bg-red-600 hover:bg-red-700"
          onClick={onCheckout}
          disabled={
            isPlacingOrder || cartItems.length === 0 || !hasSelectedItems
          }
        >
          {isPlacingOrder ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : null}
          {paymentType === "BANK_TRANSFER"
            ? "Đặt hàng và chuyển tới cổng thanh toán"
            : "Đặt hàng (COD)"}
        </Button>
      </section>
    </aside>
  );
}
