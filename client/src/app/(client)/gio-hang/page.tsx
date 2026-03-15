"use client";

import { CartApi } from "@/api/cart.api";
import { OrderApi } from "@/api/order.api";
import { PaymentApi } from "@/api/payment.api";
import { UserApi } from "@/api/user.api";
import { Button } from "@/components/ui/button";
import { UserAuthStore } from "@/hooks/useClientAuth";
import { Helper } from "@/lib/helper";
import { UserAuthUtil } from "@/lib/user-auth";

import { CartItem } from "@/types/cart";
import { OrderSummary } from "@/types/order";
import { UserAddress } from "@/types/user";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type NewAddressForm = {
    customer_name: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    province_id: string;
    district_id: string;
    ward_id: string;
    address: string;
};

function getAddressValue(address: UserAddress) {
    return {
        customerName: String(address.customerName ?? address.fullName ?? "").trim(),
        phone: String(address.phoneNumber ?? address.phone ?? "").trim(),
        province: String(address.province ?? address.provinceName ?? "").trim(),
        district: String(address.district ?? address.districtName ?? "").trim(),
        ward: String(address.ward ?? address.wardName ?? "").trim(),
        provinceId: Number(address.provinceId ?? 0),
        districtId: Number(address.districtId ?? 0),
        wardId: Number(address.wardId ?? 0),
        detail: String(address.address ?? address.detail ?? "").trim(),
    };
}

function getOrderItemsFromCart(cartItems: CartItem[]) {
    return cartItems
        .filter((item) => typeof item.productVariantId === "number" && item.productVariantId > 0)
        .map((item) => ({
            productVariantId: Number(item.productVariantId),
            quantity: item.quantity,
        }));
}

function extractOrderId(value: unknown): number | null {
    if (!value || typeof value !== "object") {
        return null;
    }

    const record = value as Record<string, unknown>;
    const candidates = [record.id, record.orderId, record.order_id];
    for (const candidate of candidates) {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }

    return null;
}

export default function CartPage() {
    const session = UserAuthStore.useStore((state) => state.session);
    const isAuthLoading = UserAuthStore.useStore((state) => state.isLoading);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [lastLoadedToken, setLastLoadedToken] = useState<string | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [paymentType, setPaymentType] = useState<"COD" | "BANK_TRANSFER">("COD");
    const [note, setNote] = useState("");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [invoice, setInvoice] = useState<OrderSummary | null>(null);

    const [newAddress, setNewAddress] = useState<NewAddressForm>({
        customer_name: String(session?.fullName ?? ""),
        phone: String(session?.phone ?? ""),
        province: "",
        district: "",
        ward: "",
        province_id: "",
        district_id: "",
        ward_id: "",
        address: "",
    });

    const sessionToken = session?.token ?? null;
    const isAuthenticated = UserAuthUtil.isSessionValid(session);
    const isLoading = isAuthLoading || (isAuthenticated && lastLoadedToken !== sessionToken);

    useEffect(() => {
        if (isAuthLoading || !isAuthenticated || !sessionToken) return;

        let isCancelled = false;

        const fetchCart = async () => {
            const [cartResponse, addressResponse] = await Promise.all([CartApi.getMyCart({ page: 1, size: 50, sort: "id:desc" }), UserApi.getMyAddresses({ page: 1, size: 30, sort: "id:desc" })]);

            if (isCancelled) {
                return;
            }

            setCartItems(cartResponse.data.data);
            const nextAddresses = addressResponse.data.data;
            setAddresses(nextAddresses);
            const preferredAddress = nextAddresses.find((address) => address.isDefault) ?? nextAddresses[0] ?? null;
            setSelectedAddressId(preferredAddress?.id ?? null);
            setLastLoadedToken(sessionToken);
        };

        void fetchCart();

        return () => {
            isCancelled = true;
        };
    }, [isAuthenticated, isAuthLoading, sessionToken]);

    const handleQuantityChange = async (item: CartItem, nextQuantity: number) => {
        if (nextQuantity < 1) {
            return;
        }

        const response = await CartApi.updateItem(item.id, { quantity: nextQuantity });
        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể cập nhật giỏ hàng.");
            return;
        }

        setCartItems((current) => current.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: nextQuantity } : cartItem)));
        toast.success("Đã cập nhật số lượng.");
    };

    const handleDelete = async (itemId: number) => {
        const response = await CartApi.deleteItem(itemId);
        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể xóa sản phẩm khỏi giỏ hàng.");
            return;
        }

        setCartItems((current) => current.filter((item) => item.id !== itemId));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
    };

    const totalAmount = cartItems.reduce((sum, item) => {
        const price = Number(item.listPriceSnapshot ?? 0);
        return sum + price * item.quantity;
    }, 0);

    const clearCartAfterOrder = async () => {
        const tasks = cartItems.map((item) => CartApi.deleteItem(item.id));
        await Promise.allSettled(tasks);
    };

    const resolveSelectedAddress = () => {
        if (useNewAddress) {
            const provinceId = Number(newAddress.province_id);
            const districtId = Number(newAddress.district_id);
            const wardId = Number(newAddress.ward_id);

            if (!newAddress.customer_name.trim() || !newAddress.phone.trim() || !newAddress.province.trim() || !newAddress.district.trim() || !newAddress.ward.trim() || !newAddress.address.trim()) {
                throw new Error("Vui lòng nhập đầy đủ thông tin địa chỉ mới.");
            }

            if (!Number.isFinite(provinceId) || !Number.isFinite(districtId) || !Number.isFinite(wardId) || provinceId <= 0 || districtId <= 0 || wardId <= 0) {
                throw new Error("Mã tỉnh/quận/phường của địa chỉ mới không hợp lệ.");
            }

            return {
                customerName: newAddress.customer_name.trim(),
                customerPhone: newAddress.phone.trim(),
                deliveryProvinceName: newAddress.province.trim(),
                deliveryDistrictName: newAddress.district.trim(),
                deliveryWardName: newAddress.ward.trim(),
                deliveryProvinceId: provinceId,
                deliveryDistrictId: districtId,
                deliveryWardCode: String(wardId),
                deliveryAddress: newAddress.address.trim(),
            };
        }

        if (!selectedAddressId) {
            throw new Error("Vui lòng chọn địa chỉ giao hàng.");
        }

        const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
        if (!selectedAddress) {
            throw new Error("Không tìm thấy địa chỉ đã chọn.");
        }

        const mapped = getAddressValue(selectedAddress);
        if (!mapped.customerName || !mapped.phone || !mapped.province || !mapped.district || !mapped.ward || !mapped.detail || mapped.provinceId <= 0 || mapped.districtId <= 0 || mapped.wardId <= 0) {
            throw new Error("Địa chỉ đã chọn đang thiếu dữ liệu, vui lòng cập nhật trong trang tài khoản hoặc nhập địa chỉ mới.");
        }

        return {
            customerName: mapped.customerName,
            customerPhone: mapped.phone,
            deliveryProvinceName: mapped.province,
            deliveryDistrictName: mapped.district,
            deliveryWardName: mapped.ward,
            deliveryProvinceId: mapped.provinceId,
            deliveryDistrictId: mapped.districtId,
            deliveryWardCode: String(mapped.wardId),
            deliveryAddress: mapped.detail,
        };
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast.error("Giỏ hàng đang trống.");
            return;
        }

        const orderItems = getOrderItemsFromCart(cartItems);
        if (orderItems.length !== cartItems.length) {
            toast.error("Có sản phẩm trong giỏ thiếu biến thể. Vui lòng kiểm tra lại sản phẩm.");
            return;
        }

        setIsPlacingOrder(true);
        setInvoice(null);

        try {
            const addressPayload = resolveSelectedAddress();

            const createResponse = await OrderApi.create({
                ...addressPayload,
                paymentType,
                note: note.trim() || undefined,
                order_items: orderItems,
            });

            let createdOrderId = extractOrderId(createResponse.data);
            if (!createdOrderId) {
                const latestOrderResponse = await OrderApi.getMyOrders({ page: 1, size: 1, sort: "id:desc" });
                const latestList = (latestOrderResponse.data as { data?: Array<{ id?: number }> })?.data ?? [];
                createdOrderId = Number(latestList[0]?.id ?? 0) || null;
            }

            if (!createdOrderId) {
                throw new Error("Không thể xác định mã đơn hàng vừa tạo.");
            }

            if (paymentType === "BANK_TRANSFER") {
                const returnUrl = `${window.location.origin}/thanh-toan/ket-qua`;
                const paymentResponse = await PaymentApi.addPayment(createdOrderId, { paymentType: "BANK_TRANSFER", returnUrl });
                const paymentData = paymentResponse.data;
                const paymentUrl = typeof paymentData === "string" ? paymentData : typeof paymentData?.paymentUrl === "string" ? paymentData.paymentUrl : "";

                await clearCartAfterOrder();
                setCartItems([]);

                if (paymentUrl) {
                    window.location.assign(paymentUrl);
                    return;
                }

                toast.success("Đơn hàng đã tạo. Không lấy được liên kết thanh toán online, vui lòng kiểm tra trong lịch sử đơn hàng.");
            }

            const detailResponse = await OrderApi.getMyOrderDetail(createdOrderId);
            setInvoice((detailResponse.data ?? null) as OrderSummary | null);

            await clearCartAfterOrder();
            setCartItems([]);
            setNote("");
            toast.success("Đặt hàng thành công. Hóa đơn đã được lưu.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể đặt hàng. Vui lòng thử lại.";
            toast.error(message);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (isLoading || isAuthLoading) {
        return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-gray-500">Đang tải giỏ hàng...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-16">
                <div className="border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                    <p className="mt-3 text-sm leading-6 text-gray-600">Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình. Đừng lo, chỉ mất vài giây!</p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link href="/dang-nhap?redirect=%2Fgio-hang" className="bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                            Đăng nhập để xem giỏ hàng
                        </Link>
                        <Link href="/san-pham" className="border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900">
                            Tiếp tục xem sản phẩm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Mua sắm</p>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                </div>
                <Link href="/san-pham" className="text-sm font-semibold text-gray-700 transition-colors hover:text-red-600">
                    Thêm sản phẩm
                </Link>
            </div>

            {cartItems.length === 0 ? (
                <div className="border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-600">
                    <ShoppingBag className="mx-auto size-10 text-gray-400" />
                    <p className="mt-4 text-lg font-medium text-gray-900">Giỏ hàng đang trống</p>
                    <p className="mt-2 text-sm">Hãy quay lại khu sản phẩm để chọn biến thể và thêm vào giỏ.</p>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <article key={item.id} className="grid gap-4 border border-gray-200 bg-white p-4 sm:grid-cols-[120px_1fr]">
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    {item.urlImageSnapshot ? (
                                        <Image src={item.urlImageSnapshot} alt={item.nameProductSnapshot || "Cart item"} fill className="object-cover" sizes="120px" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
                                    )}
                                </div>

                                <div className="flex flex-col justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{item.nameProductSnapshot || "Sản phẩm trong giỏ hàng"}</h2>
                                        <p className="mt-2 text-sm text-gray-600">Đơn giá: {Helper.formatPrice(String(item.listPriceSnapshot ?? 0))}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center border border-gray-300">
                                            <button onClick={() => void handleQuantityChange(item, item.quantity - 1)} className="p-2 transition-colors hover:bg-gray-100" disabled={item.quantity <= 1}>
                                                <Minus className="size-4" />
                                            </button>
                                            <span className="min-w-12 border-x border-gray-300 px-4 py-2 text-center text-sm font-medium">{item.quantity}</span>
                                            <button onClick={() => void handleQuantityChange(item, item.quantity + 1)} className="p-2 transition-colors hover:bg-gray-100">
                                                <Plus className="size-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <p className="text-base font-bold text-red-600">{Helper.formatPrice(String(Number(item.listPriceSnapshot ?? 0) * item.quantity))}</p>
                                            <Button variant="ghost" className="text-gray-500 hover:text-red-600" onClick={() => void handleDelete(item.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <aside className="h-fit border border-gray-200 bg-gray-50 p-6 space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
                        <div className="mt-6 space-y-3 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span>Số dòng sản phẩm</span>
                                <span className="font-medium text-gray-900">{cartItems.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Tổng tạm tính</span>
                                <span className="font-medium text-gray-900">{Helper.formatPrice(String(totalAmount))}</span>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <p className="flex items-center justify-between text-lg font-bold text-gray-900">
                                <span>Tổng cộng</span>
                                <span>{Helper.formatPrice(String(totalAmount))}</span>
                            </p>
                        </div>

                        <section className="space-y-3 border-t border-gray-200 pt-4">
                            <h3 className="text-base font-semibold text-gray-900">Địa chỉ giao hàng</h3>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setUseNewAddress(false)} className={`border px-3 py-2 text-xs font-semibold ${!useNewAddress ? "border-red-600 bg-red-600 text-white" : "border-gray-300 bg-white text-gray-700"}`}>
                                    Chọn từ tài khoản
                                </button>
                                <button type="button" onClick={() => setUseNewAddress(true)} className={`border px-3 py-2 text-xs font-semibold ${useNewAddress ? "border-red-600 bg-red-600 text-white" : "border-gray-300 bg-white text-gray-700"}`}>
                                    Nhập địa chỉ mới
                                </button>
                            </div>

                            {!useNewAddress ? (
                                <div className="max-h-56 space-y-2 overflow-y-auto">
                                    {addresses.length === 0 ? (
                                        <p className="text-sm text-gray-500">Bạn chưa có địa chỉ trong tài khoản. Hãy chuyển sang tab "Nhập địa chỉ mới".</p>
                                    ) : (
                                        addresses.map((address) => {
                                            const mapped = getAddressValue(address);
                                            return (
                                                <label key={address.id} className={`block cursor-pointer border p-3 text-sm ${selectedAddressId === address.id ? "border-red-600 bg-red-50" : "border-gray-200 bg-white"}`}>
                                                    <input type="radio" name="shipping-address" className="mr-2" checked={selectedAddressId === address.id} onChange={() => setSelectedAddressId(address.id)} />
                                                    <span className="font-semibold text-gray-900">{mapped.customerName || "Địa chỉ"}</span>
                                                    {address.isDefault ? <span className="ml-2 border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-700">Mặc định</span> : null}
                                                    <p className="mt-1 text-xs text-gray-600">{mapped.phone}</p>
                                                    <p className="mt-1 text-xs text-gray-600">{[mapped.detail, mapped.ward, mapped.district, mapped.province].filter(Boolean).join(", ")}</p>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-2 text-sm">
                                    <input value={newAddress.customer_name} onChange={(event) => setNewAddress((current) => ({ ...current, customer_name: event.target.value }))} placeholder="Người nhận" className="h-9 border border-gray-300 px-3" />
                                    <input value={newAddress.phone} onChange={(event) => setNewAddress((current) => ({ ...current, phone: event.target.value }))} placeholder="Số điện thoại" className="h-9 border border-gray-300 px-3" />
                                    <input value={newAddress.province} onChange={(event) => setNewAddress((current) => ({ ...current, province: event.target.value }))} placeholder="Tỉnh/Thành" className="h-9 border border-gray-300 px-3" />
                                    <input value={newAddress.province_id} onChange={(event) => setNewAddress((current) => ({ ...current, province_id: event.target.value }))} placeholder="Mã tỉnh" className="h-9 border border-gray-300 px-3" />
                                    <input value={newAddress.district} onChange={(event) => setNewAddress((current) => ({ ...current, district: event.target.value }))} placeholder="Quận/Huyện" className="h-9 border border-gray-300 px-3" />
                                    <input value={newAddress.district_id} onChange={(event) => setNewAddress((current) => ({ ...current, district_id: event.target.value }))} placeholder="Mã quận" className="h-9 border border-gray-300 px-3" />
                                    <input value={newAddress.ward} onChange={(event) => setNewAddress((current) => ({ ...current, ward: event.target.value }))} placeholder="Phường/Xã" className="h-9 border border-gray-300 px-3" />
                                    <input value={newAddress.ward_id} onChange={(event) => setNewAddress((current) => ({ ...current, ward_id: event.target.value }))} placeholder="Mã phường" className="h-9 border border-gray-300 px-3" />
                                    <input value={newAddress.address} onChange={(event) => setNewAddress((current) => ({ ...current, address: event.target.value }))} placeholder="Địa chỉ chi tiết" className="h-9 border border-gray-300 px-3" />
                                </div>
                            )}
                        </section>

                        <section className="space-y-3 border-t border-gray-200 pt-4">
                            <h3 className="text-base font-semibold text-gray-900">Hình thức chi trả</h3>
                            <label className={`flex cursor-pointer items-center gap-2 border p-3 text-sm ${paymentType === "COD" ? "border-red-600 bg-red-50" : "border-gray-200 bg-white"}`}>
                                <input type="radio" name="payment-type" checked={paymentType === "COD"} onChange={() => setPaymentType("COD")} />
                                Tiền mặt (COD)
                            </label>
                            <label className={`flex cursor-pointer items-center gap-2 border p-3 text-sm ${paymentType === "BANK_TRANSFER" ? "border-red-600 bg-red-50" : "border-gray-200 bg-white"}`}>
                                <input type="radio" name="payment-type" checked={paymentType === "BANK_TRANSFER"} onChange={() => setPaymentType("BANK_TRANSFER")} />
                                Trực tuyến (VNPay)
                            </label>

                            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú đơn hàng (tuỳ chọn)" rows={3} className="w-full border border-gray-300 p-3 text-sm" />

                            <Button className="w-full rounded-none bg-red-600 hover:bg-red-700" onClick={() => void handleCheckout()} disabled={isPlacingOrder || cartItems.length === 0}>
                                {isPlacingOrder ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                                {paymentType === "BANK_TRANSFER" ? "Đặt hàng và chuyển tới cổng thanh toán" : "Đặt hàng (COD)"}
                            </Button>
                        </section>
                    </aside>
                </div>
            )}

            {invoice && (
                <section className="mt-10 border border-gray-200 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Hóa đơn giao dịch</p>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">Đơn hàng #{invoice.id}</h2>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                            <p>
                                Trạng thái đơn: <span className="font-semibold text-gray-900">{invoice.deliveryStatus || invoice.orderStatus || "PENDING"}</span>
                            </p>
                            <p>
                                Thanh toán: <span className="font-semibold text-gray-900">{invoice.paymentStatus || "UNPAID"}</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                        <p>
                            <span className="font-semibold text-gray-900">Người nhận:</span> {invoice.customerName || "-"}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-900">Số điện thoại:</span> {invoice.customerPhone || "-"}
                        </p>
                        <p className="md:col-span-2">
                            <span className="font-semibold text-gray-900">Địa chỉ:</span> {[invoice.deliveryAddress, invoice.deliveryWardName, invoice.deliveryDistrictName, invoice.deliveryProvinceName].filter(Boolean).join(", ") || "-"}
                        </p>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
                        {(invoice.orderItemResponses ?? invoice.orderItem ?? []).map((item, index) => (
                            <div key={`${item.id ?? index}`} className="flex items-center justify-between gap-3">
                                <span className="text-gray-700">
                                    {item.nameProductSnapshot || `Sản phẩm #${index + 1}`} x{item.quantity}
                                </span>
                                <span className="font-semibold text-gray-900">{Helper.formatPrice(String((Number(item.finalPrice ?? item.listPriceSnapShot ?? 0) || 0) * Number(item.quantity || 0)))}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-700">
                        <p className="flex items-center justify-between">
                            <span>Tạm tính</span>
                            <span>{Helper.formatPrice(String(invoice.originalOrderAmount ?? totalAmount))}</span>
                        </p>
                        <p className="mt-1 flex items-center justify-between">
                            <span>Phí vận chuyển</span>
                            <span>{Helper.formatPrice(String(invoice.totalFeeShip ?? 0))}</span>
                        </p>
                        <p className="mt-1 flex items-center justify-between">
                            <span>Giảm giá</span>
                            <span>- {Helper.formatPrice(String(invoice.discountValue ?? 0))}</span>
                        </p>
                        <p className="mt-2 flex items-center justify-between text-lg font-bold text-gray-900">
                            <span>Thành tiền</span>
                            <span>{Helper.formatPrice(String(invoice.totalAmount ?? 0))}</span>
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link href="/tai-khoan" className="bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black">
                            Xem lịch sử mua hàng
                        </Link>
                        <Link href="/san-pham" className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}
