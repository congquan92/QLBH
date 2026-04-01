import type { GhnDistrict, GhnProvince, GhnWard } from "@/api/ghn.api";
import { Button } from "@/components/ui/button";
import { Helper } from "@/lib/helper";
import { CartItem } from "@/types/cart";
import { UserAddress } from "@/types/user";
import { Voucher } from "@/types/voucher";
import { Loader2, Tag, Truck, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
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
  // Voucher
  vouchers: Voucher[];
  selectedVoucherId: number | null;
  voucherDiscountAmount: number;
  // Shipping
  shippingFee: number | null;
  isCalculatingShipping: boolean;
  onSelectAddress: (addressId: number) => void;
  onUseNewAddressChange: (value: boolean) => void;
  onNewAddressChange: (
    updater: (current: NewAddressForm) => NewAddressForm,
  ) => void;
  onPaymentTypeChange: (value: "COD" | "BANK_TRANSFER") => void;
  onNoteChange: (value: string) => void;
  onSelectVoucher: (id: number | null) => void;
  onCheckout: () => void;
}

function VoucherBadge({ voucher }: { voucher: Voucher }) {
  const discount =
    voucher.type === "PERCENTAGE"
      ? `Giảm ${voucher.discountValue}%`
      : `Giảm ${Helper.formatPrice(String(voucher.discountValue ?? 0))}`;

  const extra =
    voucher.maxDiscountValue != null
      ? ` (tối đa ${Helper.formatPrice(String(voucher.maxDiscountValue))})`
      : "";

  const minOrder =
    voucher.minDiscountValue != null && Number(voucher.minDiscountValue) > 0
      ? ` · Đơn từ ${Helper.formatPrice(String(voucher.minDiscountValue))}`
      : "";

  const remaining = Number(voucher.remaining_quantity ?? voucher.remainingQuantity ?? 0);
  const usageLimit = Number(voucher.usageLimitPerUser ?? voucher.usage_limit_per_user ?? 0);
  const usedByUser = Number(voucher.currentUserUsedCount ?? voucher.current_user_used_count ?? 0);
  const usageText = usageLimit > 0 ? ` · Lượt dùng: ${usedByUser}/${usageLimit}` : "";
  const remainingText = ` · Còn: ${Math.max(0, remaining)}`;

  return (
    <span className="text-xs text-gray-600">
      {voucher.isShipping ? (
        <Truck className="mr-1 inline-block size-3 text-blue-500" />
      ) : (
        <Tag className="mr-1 inline-block size-3 text-red-500" />
      )}
      {discount}
      {extra}
      {minOrder}
      {usageText}
      {remainingText}
    </span>
  );
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
  vouchers,
  selectedVoucherId,
  voucherDiscountAmount,
  shippingFee,
  isCalculatingShipping,
  onSelectAddress,
  onUseNewAddressChange,
  onNewAddressChange,
  onPaymentTypeChange,
  onNoteChange,
  onSelectVoucher,
  onCheckout,
}: CartCheckoutSummaryProps) {
  const [showVoucherList, setShowVoucherList] = useState(false);

  const selectedVoucher = vouchers.find((v) => v.id === selectedVoucherId) ?? null;
  const isShippingVoucherSelected = Boolean(selectedVoucher?.isShipping ?? selectedVoucher?.is_shipping ?? false);

  // Tổng thanh toán = hàng + ship - voucher
  const shippingFeeValue = shippingFee ?? 0;
  const finalTotal = Math.max(0, selectedTotalAmount + shippingFeeValue - voucherDiscountAmount);

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

        {/* Phí vận chuyển */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Truck className="size-3.5 text-gray-400" />
            Phí vận chuyển (GHN)
          </span>
          <span className="font-medium text-gray-900">
            {isCalculatingShipping ? (
              <span className="flex items-center gap-1 text-gray-400">
                <Loader2 className="size-3 animate-spin" />
                Đang tính...
              </span>
            ) : shippingFee != null ? (
              Helper.formatPrice(String(shippingFee))
            ) : (
              <span className="text-gray-400 italic">Chọn địa chỉ</span>
            )}
          </span>
        </div>

        {/* Giảm giá voucher */}
        {voucherDiscountAmount > 0 && (
          <div className="flex items-center justify-between text-green-700">
            <span className="flex items-center gap-1">
              <Tag className="size-3.5" />
              {isShippingVoucherSelected ? "Giảm phí vận chuyển" : "Giảm voucher"}
            </span>
            <span className="font-medium">
              − {Helper.formatPrice(String(voucherDiscountAmount))}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="flex items-center justify-between text-lg font-bold text-gray-900">
          <span>Tổng thanh toán</span>
          <span>{Helper.formatPrice(String(finalTotal))}</span>
        </p>
      </div>

      {/* ── Địa chỉ giao hàng ── */}
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

      {/* ── Voucher ── */}
      <section className="space-y-3 border-t border-gray-200 pt-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Tag className="size-4 text-red-500" />
          Voucher giảm giá
        </h3>

        {/* Voucher đã chọn */}
        {selectedVoucher ? (
          <div className="flex items-center justify-between border border-green-500 bg-green-50 px-3 py-2 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-green-800">
                {selectedVoucher.description || `Voucher #${selectedVoucher.id}`}
              </span>
              <VoucherBadge voucher={selectedVoucher} />
            </div>
            <button
              type="button"
              onClick={() => onSelectVoucher(null)}
              className="ml-2 text-gray-400 hover:text-red-500"
              title="Bỏ chọn voucher"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        {/* Nút toggle danh sách */}
        {vouchers.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowVoucherList((prev) => !prev)}
            className="flex w-full items-center justify-between border border-dashed border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <span>{selectedVoucher ? "Đổi voucher khác" : "Chọn voucher"}</span>
            {showVoucherList ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
        ) : (
          <p className="text-xs text-gray-400 italic">
            Bạn không có voucher khả dụng cho đơn này.
          </p>
        )}

        {/* Danh sách voucher */}
        {showVoucherList && vouchers.length > 0 && (
          <div className="max-h-64 space-y-2 overflow-y-auto border border-gray-200 bg-white p-2">
            {vouchers.map((voucher) => {
              const isSelected = voucher.id === selectedVoucherId;
              return (
                <label
                  key={voucher.id}
                  className={`flex cursor-pointer items-start gap-3 border p-3 text-sm transition-colors ${
                    isSelected
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="voucher"
                    className="mt-0.5 shrink-0"
                    checked={isSelected}
                    onChange={() => {
                      onSelectVoucher(isSelected ? null : voucher.id);
                      setShowVoucherList(false);
                    }}
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-gray-900 truncate">
                      {voucher.description || `Voucher #${voucher.id}`}
                    </span>
                    <VoucherBadge voucher={voucher} />
                    {voucher.endDate && (
                      <span className="text-[11px] text-gray-400">
                        HSD: {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Hình thức chi trả ── */}
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
