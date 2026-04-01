"use client";

import { JobHistoryApi } from "@/api/admin/job-history.api";
import { SalaryApi } from "@/api/admin/salary.api";
import { OtpApi } from "@/api/otp.api";
import { UserApi } from "@/api/user.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useGhnAddressOptions } from "@/hooks/useGhnAddressOptions";
import type { CareerPath } from "@/types/job-history";
import type { SalaryCalculation } from "@/types/salary";
import type { UserAddress, UserProfile } from "@/types/user";
import { BriefcaseBusiness, CheckCircle2, Coins, History, Loader2, RefreshCcw, Save, ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Helper } from "@/lib/helper";

type ProfileFormState = {
    fullName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    phone: string;
    avatar: string;
};

type PasswordFormState = {
    oldPassword: string;
    password: string;
    confirmPassword: string;
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
    if (matchedDate) return matchedDate[0];

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return "2000-01-01";

    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatGender(value: unknown) {
    const gender = String(value ?? "").toUpperCase();
    if (gender === "MALE") return "Nam";
    if (gender === "FEMALE") return "Nữ";
    if (gender === "OTHER") return "Khác";
    return "-";
}

function getAvatar(fullName?: string, avatar?: string | null) {
    if (avatar) return avatar;
    const seed = encodeURIComponent(fullName || "Admin");
    return `https://ui-avatars.com/api/?name=${seed}&background=e2e8f0&color=0f172a`;
}

function normalizeAddressText(address: UserAddress) {
    return [address.address, address.ward, address.district, address.province].filter(Boolean).join(", ") || "-";
}

export default function AdminProfilePage() {
    const { session } = useAdminAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [career, setCareer] = useState<CareerPath | null>(null);
    const [currentMonthSalary, setCurrentMonthSalary] = useState<SalaryCalculation | null>(null);
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [isSendingVerifyOtp, setIsSendingVerifyOtp] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

    const [profileForm, setProfileForm] = useState<ProfileFormState>({
        fullName: "",
        gender: "OTHER",
        dateOfBirth: "2000-01-01",
        phone: "",
        avatar: "",
    });
    const [emailForm, setEmailForm] = useState({ newEmail: "", otp: "" });
    const [verifyEmailOtp, setVerifyEmailOtp] = useState("");
    const [passwordForm, setPasswordForm] = useState<PasswordFormState>({ oldPassword: "", password: "", confirmPassword: "" });
    const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"profile" | "verification" | "security" | "address" | "career">("profile");

    const now = useMemo(() => new Date(), []);
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const { provinces, districts, wards, isLoadingProvinces, isLoadingDistricts, isLoadingWards } = useGhnAddressOptions(addressForm.province_id, addressForm.district_id);

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const [profileRes, careerRes, addressRes, salaryRes] = await Promise.all([
                UserApi.getMyInfo(),
                JobHistoryApi.getMyCareer(),
                UserApi.getMyAddresses({ page: 1, size: 30, sort: "id:desc" }),
                SalaryApi.calculateMySalary(currentMonth, currentYear).catch(() => null),
            ]);

            const nextProfile = profileRes.data ?? null;
            setProfile(nextProfile);
            setCareer(careerRes.data ?? null);
            setCurrentMonthSalary(salaryRes?.data ?? null);
            setAddresses(addressRes.data.data ?? nextProfile?.addressResponses ?? []);
            setProfileForm({
                fullName: String(nextProfile?.fullName ?? ""),
                gender: String(nextProfile?.gender ?? "OTHER") as "MALE" | "FEMALE" | "OTHER",
                dateOfBirth: toIsoDate(nextProfile?.dateOfBirth),
                phone: String(nextProfile?.phone ?? ""),
                avatar: String(nextProfile?.avatar ?? ""),
            });
            setEmailForm({ newEmail: String(nextProfile?.email ?? session?.email ?? ""), otp: "" });
            setAddressForm((current) => ({
                ...current,
                customer_name: current.customer_name || String(nextProfile?.fullName ?? ""),
                phone: current.phone || String(nextProfile?.phone ?? ""),
            }));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải thông tin cá nhân.");
        } finally {
            setIsLoading(false);
        }
    }, [currentMonth, currentYear, session?.email]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    const displayName = useMemo(() => String(profile?.fullName ?? session?.email?.split("@")[0] ?? "Admin"), [profile?.fullName, session?.email]);
    const isEmailVerified = Boolean(profile?.verifiedEmail ?? (profile as { email_verified?: boolean } | null)?.email_verified);

    async function handleSaveProfile() {
        setIsSavingProfile(true);
        try {
            await UserApi.updateProfile(profileForm);
            toast.success("Cập nhật hồ sơ thành công.");
            await loadProfile();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSavingProfile(false);
        }
    }

    async function handleSendVerifyEmailOtp() {
        if (!profile?.id) {
            toast.error("Không tìm thấy tài khoản hiện tại.");
            return;
        }

        setIsSendingVerifyOtp(true);
        try {
            await OtpApi.send({ userId: profile.id, otpType: "VERIFICATION", isEmail: true });
            toast.success("Đã gửi OTP xác thực email.");
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSendingVerifyOtp(false);
        }
    }

    async function handleVerifyEmailNow() {
        if (!profile?.id) {
            toast.error("Không tìm thấy tài khoản hiện tại.");
            return;
        }
        if (!verifyEmailOtp.trim()) {
            toast.error("Vui lòng nhập mã OTP để xác thực email.");
            return;
        }

        setIsVerifyingEmail(true);
        try {
            await UserApi.verifyAccount(profile.id, { otp: verifyEmailOtp.trim(), isEmail: true, email: String(profile.email ?? "") });
            setVerifyEmailOtp("");
            toast.success("Xác thực email thành công.");
            await loadProfile();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsVerifyingEmail(false);
        }
    }

    async function handleSendEmailOtp() {
        if (!profile?.id) {
            toast.error("Không tìm thấy tài khoản hiện tại.");
            return;
        }
        if (!emailForm.newEmail.trim()) {
            toast.error("Vui lòng nhập email mới.");
            return;
        }

        setIsSendingEmailOtp(true);
        try {
            await OtpApi.send({ userId: profile.id, otpType: "EMAIL_RESET", isEmail: true });
            toast.success("OTP đã được gửi đến email hiện tại của tài khoản.");
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSendingEmailOtp(false);
        }
    }

    async function handleChangeEmail() {
        if (!emailForm.newEmail.trim() || !emailForm.otp.trim()) {
            toast.error("Vui lòng nhập email mới và mã OTP.");
            return;
        }

        setIsChangingEmail(true);
        try {
            await UserApi.changeEmail({ newEmail: emailForm.newEmail.trim(), otp: emailForm.otp.trim() });
            toast.success("Đổi email thành công.");
            setEmailForm((current) => ({ ...current, otp: "" }));
            await loadProfile();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsChangingEmail(false);
        }
    }

    async function handleChangePassword() {
        setIsChangingPassword(true);
        try {
            await UserApi.changePassword(passwordForm);
            toast.success("Đổi mật khẩu thành công.");
            setPasswordForm({ oldPassword: "", password: "", confirmPassword: "" });
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleSaveAddress() {
        if (!addressForm.customer_name.trim() || !addressForm.phone.trim() || !addressForm.province.trim() || !addressForm.district.trim() || !addressForm.ward.trim() || !addressForm.address.trim()) {
            toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ.");
            return;
        }

        const provinceId = Number(addressForm.province_id);
        const districtId = Number(addressForm.district_id);
        const wardId = Number(addressForm.ward_id);
        if (!Number.isFinite(provinceId) || !Number.isFinite(districtId) || !Number.isFinite(wardId) || provinceId <= 0 || districtId <= 0 || wardId <= 0) {
            toast.error("Mã Tỉnh/Quận/Phường không hợp lệ.");
            return;
        }

        setIsSavingAddress(true);
        const payload = {
            ...addressForm,
            province_id: provinceId,
            district_id: districtId,
            ward_id: wardId,
        };

        try {
            if (editingAddressId) {
                await UserApi.updateAddress(editingAddressId, payload);
                toast.success("Cập nhật địa chỉ thành công.");
            } else {
                await UserApi.addAddress(payload);
                toast.success("Thêm địa chỉ thành công.");
            }
            setEditingAddressId(null);
            setAddressForm(EMPTY_ADDRESS_FORM);
            await loadProfile();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSavingAddress(false);
        }
    }

    async function handleDeleteAddress(addressId: number) {
        try {
            await UserApi.deleteAddress(addressId);
            toast.success("Đã xóa địa chỉ.");
            await loadProfile();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        }
    }

    async function handleSetDefaultAddress(addressId: number) {
        try {
            await UserApi.setDefaultAddress(addressId);
            toast.success("Đã đặt làm địa chỉ mặc định.");
            await loadProfile();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        }
    }

    function fillAddressToForm(address: UserAddress) {
        setEditingAddressId(address.id);
        setAddressForm({
            customer_name: String(address.customer_name ?? address.customerName ?? ""),
            phone: String(address.phone_number ?? address.phoneNumber ?? ""),
            province: String(address.province ?? address.provinceName ?? ""),
            district: String(address.district ?? address.districtName ?? ""),
            ward: String(address.ward ?? address.wardName ?? ""),
            province_id: String(address.province_id ?? address.provinceId ?? ""),
            district_id: String(address.district_id ?? address.districtId ?? ""),
            ward_id: String(address.ward_id ?? address.wardId ?? ""),
            address: String(address.address ?? address.detail ?? ""),
            address_type: String(address.address_type ?? address.addressType ?? "HOME"),
        });
    }

    const positionSalaryType = String((profile?.positionResponse as { salary_type?: string; salaryType?: string } | undefined)?.salaryType ?? (profile?.positionResponse as { salary_type?: string; salaryType?: string } | undefined)?.salary_type ?? "-");
    const currentSalary = Number(currentMonthSalary?.base_salary ?? career?.current_position?.salary ?? 0);
    const thisMonthFinalSalary = Number(currentMonthSalary?.final_salary ?? 0);
    const thisMonthHolidayBonus = Number(currentMonthSalary?.total_holiday_bonus ?? 0);
    const thisMonthManualBonus = Number(currentMonthSalary?.total_manual_bonus ?? 0);
    const thisMonthTenureBonus = Number(currentMonthSalary?.tenure_bonus_amount ?? 0);

    function formatMoney(value: number) {
        return `${value.toLocaleString("vi-VN")} VND`;
    }

    return (
        <AdminPageShell title="Thông tin cá nhân" description="Quản lý hồ sơ, bảo mật và địa chỉ bằng API user/me">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle>Hồ sơ của bạn</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => void loadProfile()} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}Làm mới
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-10 flex items-center justify-center text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tải thông tin cá nhân...
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-2xl border bg-linear-to-r from-slate-50 via-sky-50 to-indigo-50 p-4 shadow-xs">
                                <div className="flex flex-wrap items-center gap-4">
                                <Avatar className="h-16 w-16 rounded-xl">
                                    <AvatarImage src={getAvatar(displayName, typeof profile?.avatar === "string" ? profile.avatar : null)} alt={displayName} />
                                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-xl font-semibold flex items-center gap-2">{displayName}<Sparkles className="h-4 w-4 text-amber-500" /></h2>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">{String(profile?.status ?? "UNKNOWN")}</Badge>
                                        <Badge>{positionSalaryType}</Badge>
                                        {isEmailVerified ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />Email đã xác thực
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-amber-300 text-amber-700">Email chưa xác thực</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-xl border bg-linear-to-br from-amber-50 to-orange-50 p-4">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3.5 w-3.5" />Mức lương hiện tại</p>
                                    <p className="mt-2 text-2xl font-bold text-amber-700">{currentSalary.toLocaleString("vi-VN")} VND</p>
                                    <p className="text-xs text-muted-foreground mt-1">{String(career?.current_position?.salary_type ?? "-")}</p>
                                </div>
                                <div className="rounded-xl border bg-linear-to-br from-indigo-50 to-blue-50 p-4">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><BriefcaseBusiness className="h-3.5 w-3.5" />Chức vụ hiện tại</p>
                                    <p className="mt-2 text-xl font-bold text-indigo-700">{String(career?.current_position?.name ?? profile?.positionResponse?.name ?? "-")}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Giới tính: {formatGender(profile?.gender)}</p>
                                </div>
                                <div className="rounded-xl border bg-linear-to-br from-emerald-50 to-teal-50 p-4">
                                    <p className="text-xs text-muted-foreground">Lương tháng {currentMonth}/{currentYear}</p>
                                    <p className="mt-2 text-2xl font-bold text-emerald-700">{formatMoney(thisMonthFinalSalary)}</p>
                                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                        <p>Bonus lễ: {formatMoney(thisMonthHolidayBonus)}</p>
                                        <p>Bonus thêm: {formatMoney(thisMonthManualBonus)}</p>
                                        <p>Thâm niên: +{formatMoney(thisMonthTenureBonus)}</p>
                                    </div>
                                </div>
                            </div>

                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "profile" | "verification" | "security" | "address" | "career")}>
                                <TabsList className="h-auto w-full flex flex-wrap items-center justify-start gap-2 rounded-xl bg-muted/40 p-2">
                                    <TabsTrigger value="profile" className="rounded-lg px-4">Hồ sơ</TabsTrigger>
                                    <TabsTrigger value="verification" className="rounded-lg px-4">Xác thực</TabsTrigger>
                                    <TabsTrigger value="security" className="rounded-lg px-4">Bảo mật</TabsTrigger>
                                    <TabsTrigger value="address" className="rounded-lg px-4">Địa chỉ</TabsTrigger>
                                    <TabsTrigger value="career" className="rounded-lg px-4">Lịch sử lương</TabsTrigger>
                                </TabsList>

                                <TabsContent value="profile" className="mt-4 rounded-xl border p-4 space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2"><Save className="h-4 w-4" />Cập nhật hồ sơ</h3>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Họ và tên</Label>
                                            <Input value={profileForm.fullName} onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Số điện thoại</Label>
                                            <Input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ngày sinh</Label>
                                            <Input type="date" value={profileForm.dateOfBirth} onChange={(event) => setProfileForm((current) => ({ ...current, dateOfBirth: event.target.value }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Giới tính</Label>
                                            <Select value={profileForm.gender} onValueChange={(value) => setProfileForm((current) => ({ ...current, gender: value as "MALE" | "FEMALE" | "OTHER" }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Nam</SelectItem>
                                                    <SelectItem value="FEMALE">Nữ</SelectItem>
                                                    <SelectItem value="OTHER">Khác</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button onClick={() => void handleSaveProfile()} disabled={isSavingProfile}>{isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Lưu hồ sơ</Button>
                                </TabsContent>

                                <TabsContent value="verification" className="mt-4 rounded-xl border p-4 space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Đổi email qua OTP</h3>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Email mới</Label>
                                                <Input type="email" value={emailForm.newEmail} onChange={(event) => setEmailForm((current) => ({ ...current, newEmail: event.target.value }))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Mã OTP</Label>
                                                <Input value={emailForm.otp} onChange={(event) => setEmailForm((current) => ({ ...current, otp: event.target.value }))} placeholder="Nhập 6 số OTP" />
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <Button variant="outline" onClick={() => void handleSendEmailOtp()} disabled={isSendingEmailOtp}>{isSendingEmailOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Gửi OTP</Button>
                                                <Button onClick={() => void handleChangeEmail()} disabled={isChangingEmail}>{isChangingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Xác nhận đổi email</Button>
                                            </div>
                                        </div>
                                    </div>

                                    {!isEmailVerified ? (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                                            <p className="text-sm font-medium text-amber-800">Email chưa xác thực, vui lòng xác thực để tăng bảo mật.</p>
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" className="border-amber-300 bg-white" onClick={() => void handleSendVerifyEmailOtp()} disabled={isSendingVerifyOtp}>
                                                    {isSendingVerifyOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Yêu cầu OTP xác thực
                                                </Button>
                                                <Input className="max-w-52 bg-white" value={verifyEmailOtp} onChange={(event) => setVerifyEmailOtp(event.target.value)} placeholder="Nhập OTP" />
                                                <Button onClick={() => void handleVerifyEmailNow()} disabled={isVerifyingEmail}>
                                                    {isVerifyingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Xác thực email
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 text-sm font-medium">
                                            Email của bạn đã được xác thực.
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="security" className="mt-4 rounded-xl border p-4 space-y-3">
                                    <h3 className="font-semibold">Đổi mật khẩu</h3>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Mật khẩu cũ</Label>
                                            <Input type="password" value={passwordForm.oldPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, oldPassword: event.target.value }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mật khẩu mới</Label>
                                            <Input type="password" value={passwordForm.password} onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nhập lại mật khẩu</Label>
                                            <Input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} />
                                        </div>
                                    </div>
                                    <Button onClick={() => void handleChangePassword()} disabled={isChangingPassword}>{isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Đổi mật khẩu</Button>
                                </TabsContent>

                                <TabsContent value="address" className="mt-4 rounded-xl border p-4 space-y-3">
                                    <h3 className="font-semibold">Địa chỉ</h3>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-2"><Label>Người nhận</Label><Input value={addressForm.customer_name} onChange={(event) => setAddressForm((current) => ({ ...current, customer_name: event.target.value }))} /></div>
                                        <div className="space-y-2"><Label>Điện thoại</Label><Input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} /></div>
                                        <div className="space-y-2">
                                            <Label>Tỉnh/Thành</Label>
                                            <Select
                                                value={addressForm.province_id || undefined}
                                                onValueChange={(value) => {
                                                    const selected = provinces.find((item) => String(item.ProvinceID) === value);
                                                    setAddressForm((current) => ({ ...current, province_id: value, province: selected?.ProvinceName ?? "", district_id: "", district: "", ward_id: "", ward: "" }));
                                                }}
                                            >
                                                <SelectTrigger><SelectValue placeholder={isLoadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành"} /></SelectTrigger>
                                                <SelectContent>
                                                    {provinces.map((province) => <SelectItem key={province.ProvinceID} value={String(province.ProvinceID)}>{province.ProvinceName}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Quận/Huyện</Label>
                                            <Select
                                                value={addressForm.district_id || undefined}
                                                onValueChange={(value) => {
                                                    const selected = districts.find((item) => String(item.DistrictID) === value);
                                                    setAddressForm((current) => ({ ...current, district_id: value, district: selected?.DistrictName ?? "", ward_id: "", ward: "" }));
                                                }}
                                                disabled={!addressForm.province_id}
                                            >
                                                <SelectTrigger><SelectValue placeholder={isLoadingDistricts ? "Đang tải..." : "Chọn quận/huyện"} /></SelectTrigger>
                                                <SelectContent>
                                                    {districts.map((district) => <SelectItem key={district.DistrictID} value={String(district.DistrictID)}>{district.DistrictName}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phường/Xã</Label>
                                            <Select
                                                value={addressForm.ward_id || undefined}
                                                onValueChange={(value) => {
                                                    const selected = wards.find((item) => String(item.WardCode) === value);
                                                    setAddressForm((current) => ({ ...current, ward_id: value, ward: selected?.WardName ?? "" }));
                                                }}
                                                disabled={!addressForm.district_id}
                                            >
                                                <SelectTrigger><SelectValue placeholder={isLoadingWards ? "Đang tải..." : "Chọn phường/xã"} /></SelectTrigger>
                                                <SelectContent>
                                                    {wards.map((ward) => <SelectItem key={ward.WardCode} value={String(ward.WardCode)}>{ward.WardName}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Loại địa chỉ</Label>
                                            <Select value={addressForm.address_type} onValueChange={(value) => setAddressForm((current) => ({ ...current, address_type: value }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="HOME">Nhà riêng</SelectItem>
                                                    <SelectItem value="OFFICE">Văn phòng</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2"><Label>Địa chỉ chi tiết</Label><Input value={addressForm.address} onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))} /></div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={() => void handleSaveAddress()} disabled={isSavingAddress}>{isSavingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{editingAddressId ? "Lưu cập nhật địa chỉ" : "Thêm địa chỉ"}</Button>
                                        {editingAddressId ? <Button variant="outline" onClick={() => { setEditingAddressId(null); setAddressForm(EMPTY_ADDRESS_FORM); }}>Hủy sửa</Button> : null}
                                    </div>

                                    <div className="space-y-2">
                                        {addresses.length > 0 ? (
                                            addresses.map((address) => {
                                                const isDefault = Boolean(address.is_default ?? address.isDefault);
                                                return (
                                                    <div key={address.id} className="rounded-lg border p-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <div>
                                                                <p className="text-sm font-medium">{String(address.customer_name ?? address.customerName ?? "-")} - {String(address.phone_number ?? address.phoneNumber ?? "-")}</p>
                                                                <p className="text-xs text-muted-foreground">{normalizeAddressText(address)}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {isDefault ? <Badge variant="outline">Mặc định</Badge> : <Button size="sm" variant="outline" onClick={() => void handleSetDefaultAddress(address.id)}>Đặt mặc định</Button>}
                                                                <Button size="sm" variant="outline" onClick={() => fillAddressToForm(address)}>Sửa</Button>
                                                                <Button size="sm" variant="destructive" onClick={() => void handleDeleteAddress(address.id)}>Xóa</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Chưa có địa chỉ nào.</p>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="career" className="mt-4 rounded-xl border p-4">
                                    <h3 className="font-semibold flex items-center gap-2"><History className="h-4 w-4" />Lịch sử chức vụ và lương</h3>
                                    <div className="mt-3 rounded-lg border bg-emerald-50/70 p-3">
                                        <p className="text-sm font-semibold">Chi tiết lương tháng {currentMonth}/{currentYear}</p>
                                        {currentMonthSalary ? (
                                            <div className="mt-2 space-y-1 text-sm">
                                                <p>Lương cơ bản trước thâm niên: {formatMoney(Number(currentMonthSalary.base_salary_before_tenure ?? currentMonthSalary.base_salary ?? 0))}</p>
                                                <p>Hệ số thâm niên: x{Number(currentMonthSalary.tenure_coefficient ?? 1).toFixed(2)} ({Number(currentMonthSalary.tenure_years ?? 0)} năm)</p>
                                                <p>Phần tăng do thâm niên: {formatMoney(thisMonthTenureBonus)}</p>
                                                <p>Bonus lễ: {formatMoney(thisMonthHolidayBonus)}</p>
                                                <p>Bonus thủ công: {formatMoney(thisMonthManualBonus)}</p>
                                                <p className="font-semibold">Thực nhận tháng: {formatMoney(thisMonthFinalSalary)}</p>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm text-muted-foreground">Chưa lấy được dữ liệu lương tháng hiện tại.</p>
                                        )}

                                        {Array.isArray(currentMonthSalary?.bonus_details) && currentMonthSalary.bonus_details.length > 0 ? (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs font-semibold text-muted-foreground">Chi tiết tiền lễ theo ngày</p>
                                                {currentMonthSalary.bonus_details.map((item, index) => (
                                                    <div key={`${item.date ?? "unknown"}-${index}`} className="flex flex-wrap items-center justify-between rounded-md border bg-background p-2 text-xs">
                                                        <span>Ngày: {String(item.date ?? "-")}</span>
                                                        <span>Giờ: {Number(item.hours ?? 0).toFixed(2)}</span>
                                                        <span>Tiền: {formatMoney(Number(item.bonus ?? 0))}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        {Array.isArray(career?.career_history) && career.career_history.length > 0 ? (
                                            career.career_history.map((item) => (
                                                <div key={item.id} className="rounded-lg border bg-muted/20 p-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <p className="font-medium">{String(item.position_name ?? "-")}</p>
                                                        <Badge variant={String(item.status).includes("Đang") ? "default" : "outline"}>{String(item.status ?? "-")}</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">{String(item.effective_date ?? "-")} - {String(item.end_date ?? "-")}</p>
                                                    <p className="text-sm mt-1">Lương: {Number(item.salary ?? 0).toLocaleString("vi-VN")} VND - {String(item.employment_type ?? "-")}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu lịch sử chức vụ.</p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
