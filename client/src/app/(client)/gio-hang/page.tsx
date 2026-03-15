"use client";

import { CartCheckoutSummary } from "@/app/(client)/gio-hang/_components/cart-checkout-summary";
import { CartEmptyState } from "@/app/(client)/gio-hang/_components/cart-empty-state";
import { CartInvoice } from "@/app/(client)/gio-hang/_components/cart-invoice";
import { CartItemList } from "@/app/(client)/gio-hang/_components/cart-item-list";
import { NewAddressForm, extractOrderId, getAddressValue, getCartItemPrice, getCartItemStock, getOrderItemsFromCart, isCartItemAvailable } from "@/app/(client)/gio-hang/_components/cart-utils";
import { CartApi } from "@/api/cart.api";
import { OrderApi } from "@/api/order.api";
import { PaymentApi } from "@/api/payment.api";
import { UserApi } from "@/api/user.api";
import { UserAuthStore } from "@/hooks/useClientAuth";
import { UserAuthUtil } from "@/lib/user-auth";

import { CartItem } from "@/types/cart";
import { OrderSummary } from "@/types/order";
import { UserAddress } from "@/types/user";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
    const session = UserAuthStore.useStore((state) => state.session);
    const isAuthLoading = UserAuthStore.useStore((state) => state.isLoading);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [lastLoadedToken, setLastLoadedToken] = useState<string | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [paymentType, setPaymentType] = useState<"COD" | "BANK_TRANSFER">("COD");
    const [note, setNote] = useState("");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [invoice, setInvoice] = useState<OrderSummary | null>(null);
    const [lastCheckoutAmount, setLastCheckoutAmount] = useState(0);

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

            setCartItems(cartResponse.data);
            setSelectedItemIds(cartResponse.data.filter((item) => isCartItemAvailable(item)).map((item) => item.id));
            const nextAddresses = addressResponse.data.data;
            setAddresses(nextAddresses);
            const preferredAddress = nextAddresses.find((address) => address.is_default === 1 || address.is_default === true || address.isDefault) ?? nextAddresses[0] ?? null;
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

        if (!isCartItemAvailable(item)) {
            toast.error("Sản phẩm này hiện không khả dụng để cập nhật số lượng.");
            return;
        }

        const maxStock = getCartItemStock(item);
        if (maxStock !== undefined && nextQuantity > maxStock) {
            toast.error(`Số lượng vượt tồn kho. Tối đa còn ${maxStock} sản phẩm.`);
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
        setSelectedItemIds((current) => current.filter((id) => id !== itemId));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
    };

    const handleToggleSelectItem = (itemId: number) => {
        setSelectedItemIds((current) => {
            if (current.includes(itemId)) {
                return current.filter((id) => id !== itemId);
            }
            return [...current, itemId];
        });
    };

    const handleToggleSelectAll = () => {
        const selectableIds = cartItems.filter((item) => isCartItemAvailable(item)).map((item) => item.id);
        const isAllSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedItemIds.includes(id));

        if (isAllSelected) {
            setSelectedItemIds([]);
            return;
        }

        setSelectedItemIds(selectableIds);
    };

    useEffect(() => {
        setSelectedItemIds((current) => current.filter((id) => cartItems.some((item) => item.id === id && isCartItemAvailable(item))));
    }, [cartItems]);

    const totalAmount = cartItems.reduce((sum, item) => {
        const price = getCartItemPrice(item);
        return sum + price * item.quantity;
    }, 0);

    const selectedItems = cartItems.filter((item) => selectedItemIds.includes(item.id));
    const selectedTotalAmount = selectedItems.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0);

    const clearCartAfterOrder = async (items: CartItem[]) => {
        const tasks = items.map((item) => CartApi.deleteItem(item.id));
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

        if (selectedItems.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
            return;
        }

        const orderItems = getOrderItemsFromCart(selectedItems.filter((item) => isCartItemAvailable(item)));
        if (orderItems.length !== selectedItems.length) {
            toast.error("Có sản phẩm đã chọn thiếu biến thể hoặc không còn khả dụng. Vui lòng kiểm tra lại sản phẩm.");
            return;
        }

        setLastCheckoutAmount(selectedTotalAmount);

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

            const selectedIdsSnapshot = selectedItems.map((item) => item.id);

            if (paymentType === "BANK_TRANSFER") {
                const returnUrl = `${window.location.origin}/thanh-toan/ket-qua`;
                const paymentResponse = await PaymentApi.addPayment(createdOrderId, { paymentType: "BANK_TRANSFER", returnUrl });
                const paymentData = paymentResponse.data;
                const paymentUrl = typeof paymentData === "string" ? paymentData : typeof paymentData?.paymentUrl === "string" ? paymentData.paymentUrl : "";

                // Chỉ xóa giỏ sau khi callback VNPay xác nhận thành công.
                sessionStorage.setItem(`pending_vnpay_cart_${createdOrderId}`, JSON.stringify(selectedIdsSnapshot));

                if (paymentUrl) {
                    window.location.assign(paymentUrl);
                    return;
                }

                toast.success("Đơn hàng đã tạo. Không lấy được liên kết thanh toán online, vui lòng kiểm tra trong lịch sử đơn hàng.");
            }

            const detailResponse = await OrderApi.getMyOrderDetail(createdOrderId);
            setInvoice((detailResponse.data ?? null) as OrderSummary | null);

            await clearCartAfterOrder(selectedItems);
            setCartItems((current) => current.filter((item) => !selectedIdsSnapshot.includes(item.id)));
            setSelectedItemIds([]);
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
                <CartEmptyState />
            ) : (
                <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
                    <CartItemList
                        cartItems={cartItems}
                        selectedItemIds={selectedItemIds}
                        onToggleSelectItem={handleToggleSelectItem}
                        onToggleSelectAll={handleToggleSelectAll}
                        onQuantityChange={(item, nextQuantity) => void handleQuantityChange(item, nextQuantity)}
                        onDelete={(itemId) => void handleDelete(itemId)}
                    />

                    <CartCheckoutSummary
                        cartItems={cartItems}
                        totalAmount={totalAmount}
                        selectedItemCount={selectedItems.length}
                        selectedTotalAmount={selectedTotalAmount}
                        hasSelectedItems={selectedItems.length > 0}
                        addresses={addresses}
                        selectedAddressId={selectedAddressId}
                        useNewAddress={useNewAddress}
                        newAddress={newAddress}
                        paymentType={paymentType}
                        note={note}
                        isPlacingOrder={isPlacingOrder}
                        onSelectAddress={setSelectedAddressId}
                        onUseNewAddressChange={setUseNewAddress}
                        onNewAddressChange={(updater) => setNewAddress((current) => updater(current))}
                        onPaymentTypeChange={setPaymentType}
                        onNoteChange={setNote}
                        onCheckout={() => void handleCheckout()}
                    />
                </div>
            )}

            {invoice ? <CartInvoice invoice={invoice} fallbackTotalAmount={lastCheckoutAmount || totalAmount} /> : null}
        </div>
    );
}
