"use client";

import { OrderApi } from "@/api/order.api";
import { UserApi } from "@/api/user.api";
import { AccountSidebar, AccountSection } from "@/app/(client)/tai-khoan/_components/account-sidebar";
import { AddressesSection } from "@/app/(client)/tai-khoan/_components/addresses-section";
import { OrdersSection } from "@/app/(client)/tai-khoan/_components/orders-section";
import { ProfileSection } from "@/app/(client)/tai-khoan/_components/profile-section";
import { SecuritySection } from "@/app/(client)/tai-khoan/_components/security-section";
import { UserRouteGate } from "@/components/feature/RouteUserGate";
import { Button } from "@/components/ui/button";
import { UserAuthStore } from "@/hooks/useClientAuth";

import { OrderSummary } from "@/types/order";
import { ApiResponse, PageResponse } from "@/types/api";
import { UserAddress, UserProfile } from "@/types/user";
import { LogOut, MapPinHouse, PackageSearch, ShieldCheck, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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

function normalizeAddressList(profile: UserProfile | null, addresses: UserAddress[]) {
    if (addresses.length > 0) {
        return addresses;
    }

    return profile?.addressResponses ?? [];
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
        const [profileResponse, ordersResponse, addressesResponse]: [ApiResponse<UserProfile>, ApiResponse<PageResponse<OrderSummary>>, ApiResponse<PageResponse<UserAddress>>] = await Promise.all([
            UserApi.getMyInfo(),
            OrderApi.getMyOrders({ page: 1, size: 10, sort: "id:desc" }),
            UserApi.getMyAddresses({ page: 1, size: 20, sort: "id:desc" }),
        ]);

        const nextProfile = profileResponse.data ?? null;
        setProfile(nextProfile);
        setOrders(ordersResponse.data.data);
        setAddresses(normalizeAddressList(nextProfile, addressesResponse.data.data));
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
                <AccountSidebar sections={accountSections} activeSection={activeSection} onSelect={setActiveSection} />

                <section className="space-y-8">
                    {activeSection === "profile" && (
                        <ProfileSection
                            profile={profile}
                            sessionName={session?.fullName}
                            sessionEmail={session?.email}
                            sessionPhone={session?.phone}
                            form={profileForm}
                            onFormChange={(updater) => setProfileForm((current) => updater(current))}
                            isSaving={isSavingProfile}
                            onSave={() => void handleProfileSave()}
                        />
                    )}

                    {activeSection === "orders" && (
                        <OrdersSection orders={orders} orderDetails={orderDetails} expandedOrderId={expandedOrderId} loadingOrderId={loadingOrderId} onToggleOrderDetail={(orderId) => void handleToggleOrderDetail(orderId)} />
                    )}

                    {activeSection === "addresses" && (
                        <AddressesSection
                            form={addressForm}
                            addresses={addresses}
                            isSavingAddress={isSavingAddress}
                            onFormChange={(updater) => setAddressForm((current) => updater(current))}
                            onAddAddress={() => void handleAddAddress()}
                            onSetDefault={(addressId) => void handleSetDefault(addressId)}
                            onDeleteAddress={(addressId) => void handleDeleteAddress(addressId)}
                        />
                    )}

                    {activeSection === "security" && (
                        <SecuritySection form={passwordForm} isSavingPassword={isSavingPassword} onFormChange={(updater) => setPasswordForm((current) => updater(current))} onChangePassword={() => void handleChangePassword()} />
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
