"use client";

import { OrderApi } from "@/api/order.api";
import { UserApi } from "@/api/user.api";
import { UserRouteGate } from "@/components/feature/RouteUserGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAuthStore } from "@/hooks/useClientAuth";
import { Helper } from "@/lib/helper";

import { OrderSummary } from "@/types/order";
import { UserAddress, UserProfile } from "@/types/user";
import { Loader2, LogOut, MapPinHouse, PackageSearch, Save, ShieldCheck, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type AccountSection = "profile" | "orders" | "addresses" | "security";

type ProfileFormState = {
    fullName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    avatar: string;
};

type AddressFormState = {
    customer_name: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    province_id: string;
    district_id: string;
    ward_id: string;
    address: string;
    address_type: string;
};

type PasswordFormState = {
    oldPassword: string;
    password: string;
    confirmPassword: string;
};

const EMPTY_ADDRESS_FORM: AddressFormState = {
    customer_name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    province_id: "",
    district_id: "",
    ward_id: "",
    address: "",
    address_type: "HOME",
};

function toIsoDate(value: unknown) {
    if (!value) return "2000-01-01";
    const text = String(value);
    return text.includes("T") ? text.slice(0, 10) : text;
}

function buildAvatar(fullName?: string, avatar?: string) {
    if (avatar) return avatar;
    const seed = encodeURIComponent(fullName || "ARES User");
    return `https://ui-avatars.com/api/?name=${seed}&background=f5f5f5&color=111827`;
}

function AccountPageContent() {
    const session = UserAuthStore.useStore((state) => state.session);
    const [activeSection, setActiveSection] = useState<AccountSection>("profile");
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [orderDetails, setOrderDetails] = useState<Record<number, OrderSummary>>({});
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [profileForm, setProfileForm] = useState<ProfileFormState>({
        fullName: "",
        gender: "OTHER",
        dateOfBirth: "2000-01-01",
        avatar: buildAvatar(),
    });
    const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
    const [passwordForm, setPasswordForm] = useState<PasswordFormState>({ oldPassword: "", password: "", confirmPassword: "" });

    const loadAccountData = useCallback(async () => {
        setIsLoading(true);
        const [profileResponse, ordersResponse, addressesResponse] = await Promise.all([UserApi.getMyInfo(), OrderApi.getMyOrders({ page: 1, size: 10, sort: "id:desc" }), UserApi.getMyAddresses({ page: 1, size: 20, sort: "id:desc" })]);

        const nextProfile = profileResponse.data ?? null;
        setProfile(nextProfile);
        setOrders(ordersResponse.data.data);
        setAddresses(addressesResponse.data.data);
        setProfileForm({
            fullName: String(nextProfile?.fullName ?? session?.fullName ?? ""),
            gender: String(nextProfile?.gender ?? "OTHER") as "MALE" | "FEMALE" | "OTHER",
            dateOfBirth: toIsoDate(nextProfile?.dateOfBirth),
            avatar: buildAvatar(String(nextProfile?.fullName ?? session?.fullName ?? ""), typeof nextProfile?.avatar === "string" ? nextProfile.avatar : undefined),
        });
        setAddressForm((current) => ({
            ...current,
            customer_name: current.customer_name || String(nextProfile?.fullName ?? session?.fullName ?? ""),
            phone: current.phone || String(nextProfile?.phone ?? session?.phone ?? ""),
        }));
        setIsLoading(false);
    }, [session?.fullName, session?.phone]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadAccountData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadAccountData]);

    const accountSections = useMemo(
        () => [
            { id: "profile" as const, label: "Thông tin cá nhân", icon: UserRound },
            { id: "orders" as const, label: "Đơn hàng", icon: PackageSearch },
            { id: "addresses" as const, label: "Địa chỉ", icon: MapPinHouse },
            { id: "security" as const, label: "Bảo mật", icon: ShieldCheck },
        ],
        [],
    );

    const handleProfileSave = async () => {
        setIsSavingProfile(true);
        const response = await UserApi.updateProfile(profileForm);
        setIsSavingProfile(false);

        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể cập nhật thông tin cá nhân.");
            return;
        }

        await UserAuthStore.actions.refreshProfile();
        await loadAccountData();
        toast.success("Đã cập nhật thông tin cá nhân.");
    };

    const handleAddAddress = async () => {
        setIsSavingAddress(true);
        const response = await UserApi.addAddress({
            ...addressForm,
            province_id: Number(addressForm.province_id),
            district_id: Number(addressForm.district_id),
            ward_id: Number(addressForm.ward_id),
        });
        setIsSavingAddress(false);

        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể thêm địa chỉ.");
            return;
        }

        setAddressForm(EMPTY_ADDRESS_FORM);
        await loadAccountData();
        toast.success("Đã thêm địa chỉ mới.");
    };

    const handleSetDefault = async (addressId: number) => {
        const response = await UserApi.setDefaultAddress(addressId);
        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể đặt địa chỉ mặc định.");
            return;
        }
        await loadAccountData();
        toast.success("Đã cập nhật địa chỉ mặc định.");
    };

    const handleDeleteAddress = async (addressId: number) => {
        const response = await UserApi.deleteAddress(addressId);
        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể xóa địa chỉ.");
            return;
        }
        await loadAccountData();
        toast.success("Đã xóa địa chỉ.");
    };

    const handleChangePassword = async () => {
        setIsSavingPassword(true);
        const response = await UserApi.changePassword(passwordForm);
        setIsSavingPassword(false);

        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể đổi mật khẩu.");
            return;
        }

        setPasswordForm({ oldPassword: "", password: "", confirmPassword: "" });
        toast.success("Đổi mật khẩu thành công.");
    };

    const handleLogout = async () => {
        await UserAuthStore.actions.logout();
        toast.success("Đã đăng xuất khỏi khu khách hàng.");
    };

    const handleToggleOrderDetail = async (orderId: number) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            return;
        }

        setExpandedOrderId(orderId);

        if (orderDetails[orderId]) {
            return;
        }

        setLoadingOrderId(orderId);
        try {
            const detailResponse = await OrderApi.getMyOrderDetail(orderId);
            setOrderDetails((current) => ({
                ...current,
                [orderId]: (detailResponse.data ?? {}) as OrderSummary,
            }));
        } catch {
            toast.error("Không thể tải chi tiết đơn hàng.");
        } finally {
            setLoadingOrderId(null);
        }
    };

    if (isLoading) {
        return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-gray-500">Đang tải dữ liệu tài khoản...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Tài khoản khách hàng</p>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">{profile?.fullName || session?.fullName || session?.email || "Khách hàng ARES CLUB"}</h1>
                    <p className="mt-2 text-sm text-gray-600">Quản lý hồ sơ, địa chỉ giao nhận và các đơn hàng đã tạo từ storefront.</p>
                </div>
                <Button variant="outline" className="rounded-none" onClick={() => void handleLogout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
                <aside className="h-fit border border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-2">
                        {accountSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex w-full items-center gap-3 border px-4 py-3 text-left text-sm font-medium transition-colors ${activeSection === section.id ? "border-red-600 bg-red-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900"}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {section.label}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <section className="space-y-8">
                    {activeSection === "profile" && (
                        <div className="border border-gray-200 bg-white p-6">
                            <h2 className="text-2xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Họ tên</Label>
                                    <Input value={profileForm.fullName} onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ảnh đại diện</Label>
                                    <Input value={profileForm.avatar} onChange={(event) => setProfileForm((current) => ({ ...current, avatar: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Giới tính</Label>
                                    <select
                                        value={profileForm.gender}
                                        onChange={(event) => setProfileForm((current) => ({ ...current, gender: event.target.value as ProfileFormState["gender"] }))}
                                        className="h-10 w-full rounded-none border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày sinh</Label>
                                    <Input type="date" value={profileForm.dateOfBirth} onChange={(event) => setProfileForm((current) => ({ ...current, dateOfBirth: event.target.value }))} />
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 rounded-none border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 md:grid-cols-2">
                                <div>
                                    <p className="font-semibold text-gray-900">Email</p>
                                    <p className="mt-1">{profile?.email || session?.email || "Chưa có email"}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Số điện thoại</p>
                                    <p className="mt-1">{profile?.phone || session?.phone || "Chưa có số điện thoại"}</p>
                                </div>
                            </div>

                            <Button className="mt-6 rounded-none bg-red-600 hover:bg-red-700" onClick={() => void handleProfileSave()} disabled={isSavingProfile}>
                                {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Lưu thông tin
                            </Button>
                        </div>
                    )}

                    {activeSection === "orders" && (
                        <div className="border border-gray-200 bg-white p-6">
                            <h2 className="text-2xl font-semibold text-gray-900">Đơn hàng gần đây</h2>
                            <div className="mt-6 space-y-4">
                                {orders.length === 0 ? (
                                    <div className="border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">Bạn chưa có đơn hàng nào.</div>
                                ) : (
                                    orders.map((order) => (
                                        <article key={order.id} className="border border-gray-200 p-5">
                                            {(() => {
                                                const detail = orderDetails[order.id];
                                                const mergedOrder = detail ? { ...order, ...detail } : order;
                                                const statusText = mergedOrder.deliveryStatus || mergedOrder.orderStatus || "Đang xử lý";
                                                const lineItems = mergedOrder.orderItemResponses ?? mergedOrder.orderItem ?? [];

                                                return (
                                                    <>
                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Đơn #{order.id}</p>
                                                                <h3 className="mt-2 text-lg font-semibold text-gray-900">Trạng thái: {statusText}</h3>
                                                                <p className="mt-1 text-sm text-gray-600">Thanh toán: {mergedOrder.paymentStatus || "Chưa cập nhật"}</p>
                                                            </div>
                                                            <p className="text-lg font-bold text-gray-900">{Helper.formatPrice(String(mergedOrder.totalAmount ?? 0))}</p>
                                                        </div>
                                                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                                                            {lineItems.map((item, index) => (
                                                                <div key={`${order.id}-${item.id ?? index}`} className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2 first:border-t-0 first:pt-0">
                                                                    <span>{item.nameProductSnapshot || `Sản phẩm #${item.productId ?? item.productVariantId ?? index + 1}`}</span>
                                                                    <span>x{item.quantity}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="mt-4">
                                                            <Button variant="outline" className="rounded-none" onClick={() => void handleToggleOrderDetail(order.id)}>
                                                                {expandedOrderId === order.id ? "Ẩn chi tiết" : "Xem chi tiết"}
                                                            </Button>
                                                        </div>

                                                        {expandedOrderId === order.id && (
                                                            <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-700">
                                                                {loadingOrderId === order.id ? (
                                                                    <p>Đang tải chi tiết đơn hàng...</p>
                                                                ) : (
                                                                    <>
                                                                        <p>
                                                                            <span className="font-semibold text-gray-900">Người nhận:</span> {mergedOrder.customerName || "-"} - {mergedOrder.customerPhone || "-"}
                                                                        </p>
                                                                        <p className="mt-1">
                                                                            <span className="font-semibold text-gray-900">Địa chỉ giao:</span>{" "}
                                                                            {[mergedOrder.deliveryAddress, mergedOrder.deliveryWardName, mergedOrder.deliveryDistrictName, mergedOrder.deliveryProvinceName].filter(Boolean).join(", ") || "-"}
                                                                        </p>
                                                                        <p className="mt-1">
                                                                            <span className="font-semibold text-gray-900">Phương thức thanh toán:</span> {mergedOrder.paymentType || "-"}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === "addresses" && (
                        <div className="space-y-6">
                            <div className="border border-gray-200 bg-white p-6">
                                <h2 className="text-2xl font-semibold text-gray-900">Thêm địa chỉ mới</h2>
                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Người nhận</Label>
                                        <Input value={addressForm.customer_name} onChange={(event) => setAddressForm((current) => ({ ...current, customer_name: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Số điện thoại</Label>
                                        <Input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tỉnh/Thành</Label>
                                        <Input value={addressForm.province} onChange={(event) => setAddressForm((current) => ({ ...current, province: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mã tỉnh</Label>
                                        <Input value={addressForm.province_id} onChange={(event) => setAddressForm((current) => ({ ...current, province_id: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quận/Huyện</Label>
                                        <Input value={addressForm.district} onChange={(event) => setAddressForm((current) => ({ ...current, district: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mã quận</Label>
                                        <Input value={addressForm.district_id} onChange={(event) => setAddressForm((current) => ({ ...current, district_id: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phường/Xã</Label>
                                        <Input value={addressForm.ward} onChange={(event) => setAddressForm((current) => ({ ...current, ward: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mã phường</Label>
                                        <Input value={addressForm.ward_id} onChange={(event) => setAddressForm((current) => ({ ...current, ward_id: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Địa chỉ chi tiết</Label>
                                        <Input value={addressForm.address} onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Loại địa chỉ</Label>
                                        <Input value={addressForm.address_type} onChange={(event) => setAddressForm((current) => ({ ...current, address_type: event.target.value }))} placeholder="HOME / WORK" />
                                    </div>
                                </div>
                                <Button className="mt-6 rounded-none bg-red-600 hover:bg-red-700" onClick={() => void handleAddAddress()} disabled={isSavingAddress}>
                                    {isSavingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Lưu địa chỉ
                                </Button>
                            </div>

                            <div className="border border-gray-200 bg-white p-6">
                                <h2 className="text-2xl font-semibold text-gray-900">Danh sách địa chỉ</h2>
                                <div className="mt-6 space-y-4">
                                    {addresses.length === 0 ? (
                                        <div className="border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">Bạn chưa có địa chỉ giao hàng nào.</div>
                                    ) : (
                                        addresses.map((address) => (
                                            <article key={address.id} className="border border-gray-200 p-5">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{address.fullName || "Địa chỉ giao hàng"}</h3>
                                                        <p className="mt-1 text-sm text-gray-600">{address.phone}</p>
                                                        <p className="mt-3 text-sm text-gray-600">{[address.detail, address.wardName, address.districtName, address.provinceName].filter(Boolean).join(", ")}</p>
                                                    </div>
                                                    {address.isDefault && <span className="border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Mặc định</span>}
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-3">
                                                    {!address.isDefault && (
                                                        <Button variant="outline" className="rounded-none" onClick={() => void handleSetDefault(address.id)}>
                                                            Đặt mặc định
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" className="rounded-none text-red-600 hover:text-red-700" onClick={() => void handleDeleteAddress(address.id)}>
                                                        Xóa địa chỉ
                                                    </Button>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "security" && (
                        <div className="border border-gray-200 bg-white p-6">
                            <h2 className="text-2xl font-semibold text-gray-900">Đổi mật khẩu</h2>
                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Mật khẩu cũ</Label>
                                    <Input type="password" value={passwordForm.oldPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, oldPassword: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mật khẩu mới</Label>
                                    <Input type="password" value={passwordForm.password} onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Xác nhận mật khẩu</Label>
                                    <Input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} />
                                </div>
                            </div>

                            <Button className="mt-6 rounded-none bg-red-600 hover:bg-red-700" onClick={() => void handleChangePassword()} disabled={isSavingPassword}>
                                {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                Cập nhật mật khẩu
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default function AccountPage() {
    return (
        <UserRouteGate>
            <AccountPageContent />
        </UserRouteGate>
    );
}
