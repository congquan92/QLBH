"use client";

import { OrderApi } from "@/api/order.api";
import { OtpApi } from "@/api/otp.api";
import { PaymentApi } from "@/api/payment.api";
import { UserApi } from "@/api/user.api";
import { CartApi } from "@/api/cart.api";
import { FileUploadApi } from "@/api/admin/file-upload.api";
import { AccountSection } from "@/app/(client)/tai-khoan/_components/account-sidebar";
import { AddressesSection } from "@/app/(client)/tai-khoan/_components/addresses-section";
import { OrdersSection } from "@/app/(client)/tai-khoan/_components/orders-section";
import { OrderHistorySection } from "@/app/(client)/tai-khoan/_components/order-history-section";
import { ReviewCreateModal } from "@/app/(client)/tai-khoan/_components/review-create-modal";
import { SecuritySection } from "@/app/(client)/tai-khoan/_components/security-section";
import { UserRouteGate } from "@/components/feature/RouteUserGate";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAuthStore } from "@/hooks/useClientAuth";
import { useGhnAddressOptions } from "@/hooks/useGhnAddressOptions";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProfileSection } from "./_components/profile-section";

import { ApiResponse, PageResponse } from "@/types/api";
import { OrderItem, OrderSummary } from "@/types/order";
import { UserAddress, UserProfile } from "@/types/user";
import {
  ClipboardCheck,
  LogOut,
  MapPinHouse,
  PackageSearch,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const ORDER_UPDATE_STORAGE_KEY = "qlbh:orders-updated-at";

type FirebaseOrderSnapshot = Record<
  string,
  {
    order_id?: number;
    status?: string;
    payment_status?: string;
  }
>;

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
  const matchedDate = text.match(/\d{4}-\d{2}-\d{2}/);
  if (matchedDate) {
    return matchedDate[0];
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "2000-01-01";
}

function buildAvatar(fullName?: string, avatar?: string) {
  if (avatar) return avatar;
  const seed = encodeURIComponent(fullName || "ARES User");
  return `https://ui-avatars.com/api/?name=${seed}&background=f5f5f5&color=111827`;
}

function normalizeAddressList(
  profile: UserProfile | null,
  addresses: UserAddress[],
) {
  if (addresses.length > 0) {
    return addresses;
  }

  return profile?.addressResponses ?? [];
}

function isAccountSection(value: string): value is AccountSection {
  return (
    value === "profile" ||
    value === "orders" ||
    value === "order-history" ||
    value === "addresses" ||
    value === "security"
  );
}

function AccountPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = UserAuthStore.useStore((state) => state.session);
  const [activeSection, setActiveSection] = useState<AccountSection>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderSummary[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [orderDetails, setOrderDetails] = useState<
    Record<number, OrderSummary>
  >({});
  const [historyDetails, setHistoryDetails] = useState<
    Record<number, OrderSummary>
  >({});
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [loadingHistoryId, setLoadingHistoryId] = useState<number | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<number | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [reorderingOrderId, setReorderingOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<OrderItem | null>(null);
  const [verifyEmailOtp, setVerifyEmailOtp] = useState("");
  const [isSendingVerifyOtp, setIsSendingVerifyOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changeEmailOtp, setChangeEmailOtp] = useState("");
  const [isSendingChangeEmailOtp, setIsSendingChangeEmailOtp] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: "",
    gender: "OTHER",
    dateOfBirth: "2000-01-01",
    avatar: buildAvatar(),
  });
  const [addressForm, setAddressForm] =
    useState<AddressFormState>(EMPTY_ADDRESS_FORM);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });
  const ordersRefreshTimeoutRef = useRef<number | null>(null);
  const {
    provinces,
    districts,
    wards,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
  } = useGhnAddressOptions(addressForm.province_id, addressForm.district_id);

  const loadAccountData = useCallback(async () => {
    setIsLoading(true);
    const [profileResponse, ordersResponse, addressesResponse]: [
      ApiResponse<UserProfile>,
      ApiResponse<PageResponse<OrderSummary>>,
      ApiResponse<PageResponse<UserAddress>>,
    ] = await Promise.all([
      UserApi.getMyInfo(),
      OrderApi.getMyOrders({ page: 1, size: 50, sort: "id:desc", deliveryStatus: "PENDING,CONFIRMED,PACKED,SHIPPED,CANCELLED,INACTIVE" }),
      UserApi.getMyAddresses({ page: 1, size: 20, sort: "id:desc" }),
    ]);

    const nextProfile = profileResponse.data ?? null;
    setProfile(nextProfile);
    setOrders(ordersResponse.data.data);
    setAddresses(
      normalizeAddressList(nextProfile, addressesResponse.data.data),
    );
    setProfileForm({
      fullName: String(nextProfile?.fullName ?? session?.fullName ?? ""),
      gender: String(nextProfile?.gender ?? "OTHER") as
        | "MALE"
        | "FEMALE"
        | "OTHER",
      dateOfBirth: toIsoDate(nextProfile?.dateOfBirth),
      avatar: buildAvatar(
        String(nextProfile?.fullName ?? session?.fullName ?? ""),
        typeof nextProfile?.avatar === "string"
          ? nextProfile.avatar
          : undefined,
      ),
    });
    setAddressForm((current) => ({
      ...current,
      customer_name:
        current.customer_name ||
        String(nextProfile?.fullName ?? session?.fullName ?? ""),
      phone:
        current.phone || String(nextProfile?.phone ?? session?.phone ?? ""),
    }));
    setIsLoading(false);
  }, [session?.fullName, session?.phone]);

  const loadAddresses = useCallback(async () => {
    const addressesResponse = await UserApi.getMyAddresses({
      page: 1,
      size: 20,
      sort: "id:desc",
    });
    setAddresses(addressesResponse.data.data);
  }, []);

  const loadOrderHistory = useCallback(async () => {
    const res = await OrderApi.getMyOrders({
      page: 1,
      size: 50,
      sort: "id:desc",
      deliveryStatus: "DELIVERED,COMPLETED",
    });
    setOrderHistory(res.data.data);
  }, []);

  const refreshOrderLists = useCallback(async () => {
    const [ordersResponse, historyResponse] = await Promise.all([
      OrderApi.getMyOrders({ page: 1, size: 50, sort: "id:desc", deliveryStatus: "PENDING,CONFIRMED,PACKED,SHIPPED,CANCELLED,INACTIVE" }),
      OrderApi.getMyOrders({ page: 1, size: 50, sort: "id:desc", deliveryStatus: "DELIVERED,COMPLETED" }),
    ]);

    setOrders(ordersResponse.data.data);
    setOrderHistory(historyResponse.data.data);
  }, []);

  const scheduleRefreshOrderLists = useCallback(() => {
    if (ordersRefreshTimeoutRef.current !== null) {
      window.clearTimeout(ordersRefreshTimeoutRef.current);
    }

    ordersRefreshTimeoutRef.current = window.setTimeout(() => {
      void refreshOrderLists();
    }, 250);
  }, [refreshOrderLists]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAccountData();
      void loadOrderHistory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAccountData, loadOrderHistory]);

  useEffect(() => {
    const onOrderCreated = () => {
      scheduleRefreshOrderLists();
    };

    const onStorageUpdated = (event: StorageEvent) => {
      if (event.key === ORDER_UPDATE_STORAGE_KEY && event.newValue) {
        scheduleRefreshOrderLists();
      }
    };

    window.addEventListener("qlbh:order-created", onOrderCreated);
    window.addEventListener("storage", onStorageUpdated);

    return () => {
      window.removeEventListener("qlbh:order-created", onOrderCreated);
      window.removeEventListener("storage", onStorageUpdated);
      if (ordersRefreshTimeoutRef.current !== null) {
        window.clearTimeout(ordersRefreshTimeoutRef.current);
      }
    };
  }, [scheduleRefreshOrderLists]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && isAccountSection(tab)) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  const accountSections = useMemo(
    () => [
      { id: "profile" as const, label: "Thông tin cá nhân", icon: UserRound },
      { id: "orders" as const, label: "Đơn hàng", icon: PackageSearch },
      { id: "order-history" as const, label: "Lịch sử đơn hàng", icon: ClipboardCheck },
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
    toast.success(response.message || "Cập nhật thông tin cá nhân thành công.");
  };

  const handleAvatarFileUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const uploadRes = await FileUploadApi.upload(file);
      const avatarUrl = String(uploadRes.url || "");
      if (!avatarUrl) {
        toast.error("Upload ảnh thất bại.");
        return;
      }

      await UserApi.updateProfile({ avatar: avatarUrl });
      setProfileForm((current) => ({ ...current, avatar: avatarUrl }));
      await loadAccountData();
      toast.success("Đã cập nhật ảnh đại diện.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể upload ảnh đại diện.";
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSendVerifyEmailOtp = useCallback(async () => {
    if (!profile?.id) {
      toast.error("Không tìm thấy tài khoản hiện tại.");
      return;
    }

    setIsSendingVerifyOtp(true);
    try {
      await OtpApi.send({ userId: profile.id, otpType: "VERIFICATION", isEmail: true });
      toast.success("Đã gửi OTP xác thực email.");
    } catch {
      toast.error("Không thể gửi OTP xác thực email.");
    } finally {
      setIsSendingVerifyOtp(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_FIREBASE_DB_URL ?? "");
    if (!base || orders.length === 0) {
      return;
    }

    const streamUrl = `${base}/orders.json`;
    const source = new EventSource(streamUrl);

    const mergeRealtimeStatus = (snapshot: FirebaseOrderSnapshot | null | undefined) => {
      if (!snapshot || typeof snapshot !== "object") return;

      const statusByOrderId = new Map<number, { status?: string; paymentStatus?: string }>();
      for (const raw of Object.values(snapshot)) {
        const orderId = Number(raw?.order_id ?? 0);
        if (!orderId) continue;
        statusByOrderId.set(orderId, {
          status: typeof raw?.status === "string" ? raw.status : undefined,
          paymentStatus: typeof raw?.payment_status === "string" ? raw.payment_status : undefined,
        });
      }

      if (statusByOrderId.size === 0) return;

      const applyStatus = (item: OrderSummary): OrderSummary => {
        const realtime = statusByOrderId.get(item.id);
        if (!realtime) return item;
        return {
          ...item,
          orderStatus: realtime.status ?? item.orderStatus,
          deliveryStatus: realtime.status ?? item.deliveryStatus,
          paymentStatus: realtime.paymentStatus ?? item.paymentStatus,
        };
      };

      setOrders((current) => current.map(applyStatus));
      setOrderHistory((current) => current.map(applyStatus));
      setOrderDetails((current) => {
        const next = { ...current };
        for (const [orderId, detail] of Object.entries(next)) {
          next[Number(orderId)] = applyStatus(detail);
        }
        return next;
      });
      setHistoryDetails((current) => {
        const next = { ...current };
        for (const [orderId, detail] of Object.entries(next)) {
          next[Number(orderId)] = applyStatus(detail);
        }
        return next;
      });
    };

    source.addEventListener("put", (event) => {
      try {
        const payload = JSON.parse(event.data) as { path?: string; data?: unknown };
        if (!payload || typeof payload !== "object") return;

        if (payload.path === "/") {
          mergeRealtimeStatus((payload.data ?? null) as FirebaseOrderSnapshot | null);
          return;
        }

        const path = String(payload.path ?? "");
        const match = path.match(/^\/order_(\d+)$/);
        if (!match || !payload.data || typeof payload.data !== "object") return;

        const orderId = Number(match[1]);
        if (!orderId) return;

        scheduleRefreshOrderLists();

        mergeRealtimeStatus({
          [`order_${orderId}`]: {
            ...(payload.data as Record<string, unknown>),
            order_id: orderId,
          },
        });
      } catch {
        // Ignore malformed stream payload.
      }
    });

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [orders.length, scheduleRefreshOrderLists]);

  const handleVerifyEmail = async () => {
    if (!profile?.id) {
      toast.error("Không tìm thấy tài khoản hiện tại.");
      return;
    }

    if (!verifyEmailOtp.trim()) {
      toast.error("Vui lòng nhập OTP xác thực email.");
      return;
    }

    setIsVerifyingEmail(true);
    try {
      await UserApi.verifyAccount(profile.id, {
        otp: verifyEmailOtp.trim(),
        isEmail: true,
      });
      setVerifyEmailOtp("");
      await loadAccountData();
      toast.success("Xác thực email thành công.");
    } catch {
      toast.error("Xác thực email thất bại.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSendChangeEmailOtp = async () => {
    if (!profile?.id) {
      toast.error("Không tìm thấy tài khoản hiện tại.");
      return;
    }

    if (!newEmail.trim()) {
      toast.error("Vui lòng nhập email mới trước khi gửi OTP.");
      return;
    }

    setIsSendingChangeEmailOtp(true);
    try {
      await OtpApi.send({ userId: profile.id, otpType: "EMAIL_RESET", isEmail: true });
      toast.success("Đã gửi OTP đổi email vào email hiện tại.");
    } catch {
      toast.error("Không thể gửi OTP đổi email.");
    } finally {
      setIsSendingChangeEmailOtp(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !changeEmailOtp.trim()) {
      toast.error("Vui lòng nhập email mới và OTP đổi email.");
      return;
    }

    setIsChangingEmail(true);
    try {
      await UserApi.changeEmail({
        newEmail: newEmail.trim(),
        otp: changeEmailOtp.trim(),
      });

      setChangeEmailOtp("");
      setVerifyEmailOtp("");
      await loadAccountData();
      toast.success("Đã đổi email. Vui lòng nhập OTP xác thực gửi tới email mới.");
    } catch {
      toast.error("Đổi email thất bại.");
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleAddAddress = async () => {
    if (
      !addressForm.customer_name.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.province.trim() ||
      !addressForm.district.trim() ||
      !addressForm.ward.trim() ||
      !addressForm.address.trim()
    ) {
      toast.error(
        "Vui lòng chọn đầy đủ Tỉnh/Quận/Phường và nhập địa chỉ chi tiết.",
      );
      return;
    }

    const provinceId = Number(addressForm.province_id);
    const districtId = Number(addressForm.district_id);
    const wardId = Number(addressForm.ward_id);
    if (
      !Number.isFinite(provinceId) ||
      !Number.isFinite(districtId) ||
      !Number.isFinite(wardId) ||
      provinceId <= 0 ||
      districtId <= 0 ||
      wardId <= 0
    ) {
      toast.error("Mã Tỉnh/Quận/Phường không hợp lệ.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const response = await UserApi.addAddress({
        ...addressForm,
        province_id: provinceId,
        district_id: districtId,
        ward_id: wardId,
      });

      if (!response || response.status >= 400) {
        toast.error(response?.message || "Không thể thêm địa chỉ.");
        return;
      }

      setAddressForm(EMPTY_ADDRESS_FORM);
      await loadAddresses();
      toast.success("Đã thêm địa chỉ mới.");
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string; details?: string[] } } };
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.details?.[0] ||
        "Không thể thêm địa chỉ.";
      toast.error(msg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      const response = await UserApi.setDefaultAddress(addressId);
      if (!response || response.status >= 400) {
        toast.error(response?.message || "Không thể đặt địa chỉ mặc định.");
        return;
      }
      await loadAddresses();
      toast.success("Đã cập nhật địa chỉ mặc định.");
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string; details?: string[] } } };
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.details?.[0] ||
        "Không thể đặt địa chỉ mặc định.";
      toast.error(msg);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      const response = await UserApi.deleteAddress(addressId);
      if (!response || response.status >= 400) {
        toast.error(response?.message || "Không thể xóa địa chỉ.");
        return;
      }
      await loadAddresses();
      toast.success("Đã xóa địa chỉ.");
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string; details?: string[] } } };
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.details?.[0] ||
        "Không thể xóa địa chỉ.";
      toast.error(msg);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword.trim() || !passwordForm.password.trim() || !passwordForm.confirmPassword.trim()) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.");
      return;
    }
    if (passwordForm.password.trim().length < 8 || passwordForm.confirmPassword.trim().length < 8) {
      toast.error("Mật khẩu phải ít nhất 8 ký tự.");
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

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

  const handleToggleHistoryDetail = async (orderId: number) => {
    if (expandedHistoryId === orderId) {
      setExpandedHistoryId(null);
      return;
    }

    setExpandedHistoryId(orderId);

    if (historyDetails[orderId]) {
      return;
    }

    setLoadingHistoryId(orderId);
    try {
      const detailResponse = await OrderApi.getMyOrderDetail(orderId);
      setHistoryDetails((current) => ({
        ...current,
        [orderId]: (detailResponse.data ?? {}) as OrderSummary,
      }));
    } catch {
      toast.error("Không thể tải chi tiết đơn hàng.");
    } finally {
      setLoadingHistoryId(null);
    }
  };

  const handleRetryPayment = async (orderId: number) => {
    setRetryingOrderId(orderId);
    try {
      const returnUrl = `${window.location.origin}/thanh-toan/ket-qua`;
      const response = await PaymentApi.addPayment(orderId, {
        paymentType: "BANK_TRANSFER",
        returnUrl,
      });

      const payload = response.data;
      const paymentUrl =
        typeof payload === "string"
          ? payload
          : typeof payload?.paymentUrl === "string"
            ? payload.paymentUrl
            : "";

      if (!paymentUrl) {
        toast.error("Không lấy được liên kết thanh toán. Vui lòng thử lại sau.");
        return;
      }

      window.location.assign(paymentUrl);
    } catch {
      toast.error("Không thể tạo lại liên kết thanh toán.");
    } finally {
      setRetryingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setCancellingOrderId(orderId);
    try {
      await OrderApi.cancel(orderId);
      toast.success("Đã hủy đơn hàng thành công.");
      await refreshOrderLists();
      setOrderDetails((current) => {
        const next = { ...current };
        if (next[orderId]) {
          next[orderId] = {
            ...next[orderId],
            orderStatus: "CANCELLED",
            deliveryStatus: "CANCELLED",
          };
        }
        return next;
      });
    } catch {
      toast.error("Không thể hủy đơn hàng. Bạn chỉ có thể hủy đơn ở trạng thái chờ xác nhận.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleReorderOrder = async (orderId: number) => {
    setReorderingOrderId(orderId);
    try {
      let detail = orderDetails[orderId];
      if (!detail) {
        const detailResponse = await OrderApi.getMyOrderDetail(orderId);
        detail = (detailResponse.data ?? {}) as OrderSummary;
        setOrderDetails((current) => ({
          ...current,
          [orderId]: detail as OrderSummary,
        }));
      }

      const lineItems = Array.isArray(detail?.orderItemResponses)
        ? detail.orderItemResponses
        : Array.isArray(detail?.orderItem)
          ? detail.orderItem
          : [];

      const payloads = lineItems
        .map((item) => ({
          productVariantId: Number(item.productVariantId ?? item.product_variant_id ?? 0),
          quantity: Number(item.quantity ?? 0),
        }))
        .filter((item) => item.productVariantId > 0 && item.quantity > 0);

      if (payloads.length === 0) {
        toast.error("Không tìm thấy sản phẩm hợp lệ để mua lại.");
        return;
      }

      const tasks = payloads.map((item) =>
        CartApi.addItem({
          product_variant_id: item.productVariantId,
          quantity: item.quantity,
        }),
      );

      const results = await Promise.allSettled(tasks);
      const successCount = results.filter((result) => result.status === "fulfilled").length;
      const failedCount = results.length - successCount;

      if (successCount === 0) {
        toast.error("Không thể mua lại đơn hàng này do tồn kho hoặc sản phẩm đã thay đổi.");
        return;
      }

      if (failedCount > 0) {
        toast.warning(`Đã thêm ${successCount}/${results.length} sản phẩm vào giỏ. Một số sản phẩm không còn đủ tồn kho.`);
      } else {
        toast.success("Đã thêm lại sản phẩm của đơn vào giỏ hàng.");
      }

      router.push("/gio-hang");
    } catch {
      toast.error("Không thể mua lại đơn hàng này.");
    } finally {
      setReorderingOrderId(null);
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    setConfirmingOrderId(orderId);
    try {
      await OrderApi.complete(orderId);
      toast.success("Đã xác nhận nhận hàng thành công.");
      await refreshOrderLists();
      setHistoryDetails((current) => {
        const next = { ...current };
        if (next[orderId]) {
          next[orderId] = { ...next[orderId], isConfirmed: true };
        }
        return next;
      });
    } catch {
      toast.error("Không thể xác nhận đơn hàng.");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleOpenReviewModal = (_order: OrderSummary, item: OrderItem) => {
    setSelectedReviewItem(item);
    setReviewModalOpen(true);
  };

  const handleReviewCreated = async () => {
    await refreshOrderLists();
    if (expandedHistoryId) {
      try {
        const detailResponse = await OrderApi.getMyOrderDetail(expandedHistoryId);
        setHistoryDetails((current) => ({
          ...current,
          [expandedHistoryId]: (detailResponse.data ?? {}) as OrderSummary,
        }));
      } catch {
        // Ignore detail refresh failure after successful review submission.
      }
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-gray-500">
        Đang tải dữ liệu tài khoản...
      </div>
    );
  }

  const displayName =
    profile?.fullName ||
    session?.fullName ||
    session?.email ||
    "Khách hàng ARES CLUB";
  const headerAvatar = buildAvatar(
    displayName,
    typeof profile?.avatar === "string" ? profile.avatar : undefined,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Image
            src={headerAvatar}
            alt={`Avatar ${displayName}`}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-gray-200 object-cover"
          />

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
              Tài khoản khách hàng
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {displayName}
            </h1>
            {/* <p className="mt-2 text-sm text-gray-600">Quản lý hồ sơ, địa chỉ giao nhận và các đơn hàng đã tạo từ storefront.</p> */}
          </div>
        </div>
        <Button
          variant="outline"
          className="rounded-none"
          onClick={() => void handleLogout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>

      <Tabs
        value={activeSection}
        onValueChange={(value) => {
          if (isAccountSection(value)) {
            setActiveSection(value);
            const nextQuery = new URLSearchParams(searchParams.toString());
            if (value === "profile") {
              nextQuery.delete("tab");
            } else {
              nextQuery.set("tab", value);
            }
            const nextSearch = nextQuery.toString();
            const nextUrl = nextSearch ? `${pathname}?${nextSearch}` : pathname;
            router.replace(nextUrl, { scroll: false });
          }
        }}
        orientation="vertical"
        className="flex-col gap-8 lg:flex-row"
      >
        <TabsList
          className="h-auto w-full shrink-0 flex-col items-stretch border border-gray-200 bg-[#fafafa] p-4 lg:w-65"
          variant="line"
        >
          {accountSections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="h-auto justify-start rounded-none border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 data-[state=active]:border-red-600 data-[state=active]:bg-red-600 data-[state=active]:text-white group-data-[variant=line]/tabs-list:data-[state=active]:border-red-600 group-data-[variant=line]/tabs-list:data-[state=active]:bg-red-600 group-data-[variant=line]/tabs-list:data-[state=active]:text-white after:hidden"
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="profile" className="w-full space-y-8">
          <ProfileSection
            profile={profile}
            sessionName={session?.fullName}
            sessionEmail={session?.email}
            sessionPhone={session?.phone}
            form={profileForm}
            onFormChange={(updater) =>
              setProfileForm((current) => updater(current))
            }
            isSaving={isSavingProfile}
            onSave={() => void handleProfileSave()}
            verifyEmailOtp={verifyEmailOtp}
            onVerifyEmailOtpChange={setVerifyEmailOtp}
            isSendingVerifyOtp={isSendingVerifyOtp}
            isVerifyingEmail={isVerifyingEmail}
            onSendVerifyEmailOtp={() => void handleSendVerifyEmailOtp()}
            onVerifyEmail={() => void handleVerifyEmail()}
            newEmail={newEmail}
            onNewEmailChange={setNewEmail}
            changeEmailOtp={changeEmailOtp}
            onChangeEmailOtpChange={setChangeEmailOtp}
            isSendingChangeEmailOtp={isSendingChangeEmailOtp}
            isChangingEmail={isChangingEmail}
            onSendChangeEmailOtp={() => void handleSendChangeEmailOtp()}
            onChangeEmail={() => void handleChangeEmail()}
            isUploadingAvatar={isUploadingAvatar}
            onAvatarFileSelected={(file) => void handleAvatarFileUpload(file)}
          />
        </TabsContent>

        <TabsContent value="orders" className="w-full space-y-8">
          <OrdersSection
            orders={orders}
            orderDetails={orderDetails}
            expandedOrderId={expandedOrderId}
            loadingOrderId={loadingOrderId}
            retryingOrderId={retryingOrderId}
            cancellingOrderId={cancellingOrderId}
            reorderingOrderId={reorderingOrderId}
            onToggleOrderDetail={(orderId) =>
              void handleToggleOrderDetail(orderId)
            }
            onRetryPayment={(orderId) => void handleRetryPayment(orderId)}
            onCancelOrder={(orderId) => void handleCancelOrder(orderId)}
            onReorderOrder={(orderId) => void handleReorderOrder(orderId)}
          />
        </TabsContent>

        <TabsContent value="order-history" className="w-full space-y-8">
          <OrderHistorySection
            orders={orderHistory}
            orderDetails={historyDetails}
            expandedOrderId={expandedHistoryId}
            loadingOrderId={loadingHistoryId}
            retryingOrderId={retryingOrderId}
            onToggleOrderDetail={(orderId) =>
              void handleToggleHistoryDetail(orderId)
            }
            onRetryPayment={(orderId) => void handleRetryPayment(orderId)}
            onConfirmOrder={(orderId) => void handleConfirmOrder(orderId)}
            onOpenReviewModal={handleOpenReviewModal}
            confirmingOrderId={confirmingOrderId}
          />
        </TabsContent>

        <TabsContent value="addresses" className="w-full space-y-8">
          <AddressesSection
            form={addressForm}
            addresses={addresses}
            provinceOptions={provinces}
            districtOptions={districts}
            wardOptions={wards}
            isLoadingProvinces={isLoadingProvinces}
            isLoadingDistricts={isLoadingDistricts}
            isLoadingWards={isLoadingWards}
            isSavingAddress={isSavingAddress}
            onFormChange={(updater) =>
              setAddressForm((current) => updater(current))
            }
            onAddAddress={() => void handleAddAddress()}
            onSetDefault={(addressId) => void handleSetDefault(addressId)}
            onDeleteAddress={(addressId) => void handleDeleteAddress(addressId)}
          />
        </TabsContent>

        <TabsContent value="security" className="w-full space-y-8">
          <SecuritySection
            form={passwordForm}
            isSavingPassword={isSavingPassword}
            onFormChange={(updater) =>
              setPasswordForm((current) => updater(current))
            }
            onChangePassword={() => void handleChangePassword()}
          />
        </TabsContent>
      </Tabs>

      <ReviewCreateModal
        open={reviewModalOpen}
        orderItem={selectedReviewItem}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedReviewItem(null);
        }}
        onSuccess={() => void handleReviewCreated()}
      />
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
