import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helper } from "@/lib/helper";
import { UserProfile } from "@/types/user";
import { Loader2, MailCheck, Save, Upload } from "lucide-react";

import { formatDate } from "./account-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileFormState = {
    fullName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    avatar: string;
};

interface ProfileSectionProps {
    profile: UserProfile | null;
    sessionName?: string;
    sessionEmail?: string;
    sessionPhone?: string;
    form: ProfileFormState;
    onFormChange: (updater: (current: ProfileFormState) => ProfileFormState) => void;
    isSaving: boolean;
    onSave: () => void;
    verifyEmailOtp: string;
    onVerifyEmailOtpChange: (value: string) => void;
    isSendingVerifyOtp: boolean;
    isVerifyingEmail: boolean;
    onSendVerifyEmailOtp: () => void;
    onVerifyEmail: () => void;
    newEmail: string;
    onNewEmailChange: (value: string) => void;
    changeEmailOtp: string;
    onChangeEmailOtpChange: (value: string) => void;
    isSendingChangeEmailOtp: boolean;
    isChangingEmail: boolean;
    onSendChangeEmailOtp: () => void;
    onChangeEmail: () => void;
    isUploadingAvatar: boolean;
    onAvatarFileSelected: (file: File) => void;
}

export function ProfileSection({
    profile,
    sessionName,
    sessionEmail,
    sessionPhone,
    form,
    onFormChange,
    isSaving,
    onSave,
    verifyEmailOtp,
    onVerifyEmailOtpChange,
    isSendingVerifyOtp,
    isVerifyingEmail,
    onSendVerifyEmailOtp,
    onVerifyEmail,
    newEmail,
    onNewEmailChange,
    changeEmailOtp,
    onChangeEmailOtpChange,
    isSendingChangeEmailOtp,
    isChangingEmail,
    onSendChangeEmailOtp,
    onChangeEmail,
    isUploadingAvatar,
    onAvatarFileSelected,
}: ProfileSectionProps) {
    const emailVerified = profile?.verifiedEmail;
    const phoneVerified = profile?.verifiedPhone;

    return (
        <div className="space-y-6">
            <section className="border border-gray-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Hồ sơ</p>
                        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Thông tin tài khoản</h2>
                        <p className="mt-2 text-sm text-gray-600">Quản lý hồ sơ cơ bản, trạng thái xác minh và quyền người dùng trong một nơi.</p>
                    </div>
                    <div className="grid gap-2 text-right text-sm text-gray-600 sm:text-left lg:text-right">
                        <p>
                            Hạng hiện tại: <span className="font-semibold text-gray-900">{profile?.userRankResponse?.name || "Chưa có"}</span>
                        </p>
                        <p>
                            Đã chi tiêu: <span className="font-semibold text-gray-900">{Helper.formatPrice(String(profile?.totalSpent ?? 0))}</span>
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Email</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">{profile?.email || sessionEmail || "Chưa có email"}</p>
                        <Badge className={`mt-3 rounded-md border px-2 py-1 text-xs ${emailVerified ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-700"}`} variant="outline">
                            {emailVerified ? "Email đã xác minh" : "Email chưa xác minh"}
                        </Badge>
                    </div>
                    <div className="border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Điện thoại</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">{profile?.phone || sessionPhone || "Chưa có số điện thoại"}</p>
                        <Badge className={`mt-3 rounded-md border px-2 py-1 text-xs ${phoneVerified ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-700"}`} variant="outline">
                            {phoneVerified ? "SĐT đã xác minh" : "SĐT chưa xác minh"}
                        </Badge>
                    </div>
                    <div className="border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Vai trò</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">{(profile?.role as { name?: string } | undefined)?.name || "USER"}</p>
                        <p className="mt-3 text-xs text-gray-500">Trạng thái: {profile?.status || "ACTIVE"}</p>
                    </div>
                    <div className="border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Ngày sinh</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(profile?.dateOfBirth)}</p>
                        <p className="mt-3 text-xs text-gray-500">Tên hiển thị: {profile?.fullName || sessionName || "Khách hàng"}</p>
                    </div>
                </div>
            </section>

            <section className="border border-gray-200 bg-white p-6">
                <h3 className="text-xl font-semibold text-gray-900">Cập nhật hồ sơ</h3>
                <div className="flex items-center justify-center gap-2 flex-col mt-3">
                    <Label>Ảnh đại diện</Label>
                    <div className="flex min-h-20 items-center justify-center">
                        <Avatar className="size-30 border-2 border-primary/20 p-0.5 transition-all hover:border-primary">
                            <AvatarImage src={form.avatar} alt={form.fullName} className="rounded-full object-cover" />
                            <AvatarFallback className="bg-muted-foreground/10">{form.fullName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    onAvatarFileSelected(file);
                                    event.currentTarget.value = "";
                                }
                            }}
                        />
                        <span className="inline-flex items-center rounded-none border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                            {isUploadingAvatar ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
                            {isUploadingAvatar ? "Đang tải ảnh..." : "Tải ảnh đại diện"}
                        </span>
                    </label>
                </div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Họ tên</Label>
                        <Input value={form.fullName} onChange={(event) => onFormChange((current) => ({ ...current, fullName: event.target.value }))} />
                    </div>

                    <div className="space-y-2">
                        <Label>Giới tính</Label>
                        <select
                            value={form.gender}
                            onChange={(event) => onFormChange((current) => ({ ...current, gender: event.target.value as ProfileFormState["gender"] }))}
                            className="h-10 w-full border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Ngày sinh</Label>
                        <Input type="date" value={form.dateOfBirth} onChange={(event) => onFormChange((current) => ({ ...current, dateOfBirth: event.target.value }))} />
                    </div>
                </div>

                <Button className="mt-6 rounded-none bg-red-600 hover:bg-red-700" onClick={onSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Lưu thông tin
                </Button>
            </section>

            <section className="border border-gray-200 bg-white p-6 space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Xác thực email</h3>
                    <p className="mt-2 text-sm text-gray-600">Nếu email chưa xác thực, gửi OTP và nhập mã để xác thực ngay.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                    <Input placeholder="Nhập OTP xác thực email" value={verifyEmailOtp} onChange={(event) => onVerifyEmailOtpChange(event.target.value)} />
                    <Button type="button" variant="outline" className="rounded-none" onClick={onSendVerifyEmailOtp} disabled={isSendingVerifyOtp}>
                        {isSendingVerifyOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailCheck className="mr-2 h-4 w-4" />}
                        Gửi OTP
                    </Button>
                    <Button type="button" className="rounded-none bg-green-600 hover:bg-green-700" onClick={onVerifyEmail} disabled={isVerifyingEmail || !verifyEmailOtp.trim()}>
                        {isVerifyingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Xác thực
                    </Button>
                </div>
            </section>

            <section className="border border-gray-200 bg-white p-6 space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Đổi email</h3>
                    <p className="mt-2 text-sm text-gray-600">Hệ thống sẽ gửi OTP xác nhận đổi email vào email hiện tại, sau đó gửi OTP xác thực vào email mới.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Email mới</Label>
                        <Input type="email" placeholder="emailmoi@example.com" value={newEmail} onChange={(event) => onNewEmailChange(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>OTP đổi email</Label>
                        <Input placeholder="Nhập OTP" value={changeEmailOtp} onChange={(event) => onChangeEmailOtpChange(event.target.value)} />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="outline" className="rounded-none" onClick={onSendChangeEmailOtp} disabled={isSendingChangeEmailOtp}>
                        {isSendingChangeEmailOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailCheck className="mr-2 h-4 w-4" />}
                        Gửi OTP đổi email
                    </Button>
                    <Button type="button" className="rounded-none bg-red-600 hover:bg-red-700" onClick={onChangeEmail} disabled={isChangingEmail || !newEmail.trim() || !changeEmailOtp.trim()}>
                        {isChangingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Xác nhận đổi email
                    </Button>
                </div>
            </section>
        </div>
    );
}
