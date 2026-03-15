import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helper } from "@/lib/helper";
import { UserProfile } from "@/types/user";
import { Loader2, Save } from "lucide-react";
import { formatDate } from "./account-utils";

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
}

export function ProfileSection({ profile, sessionName, sessionEmail, sessionPhone, form, onFormChange, isSaving, onSave }: ProfileSectionProps) {
    const emailVerified = profile?.verifiedEmail;
    const phoneVerified = profile?.verifiedPhone;

    return (
        <div className="space-y-6">
            <section className="border border-gray-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Hồ sơ Shopee-style</p>
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
                        <p>
                            Điểm tích lũy: <span className="font-semibold text-gray-900">{profile?.point ?? 0}</span>
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
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Họ tên</Label>
                        <Input value={form.fullName} onChange={(event) => onFormChange((current) => ({ ...current, fullName: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Ảnh đại diện</Label>
                        <Input value={form.avatar} onChange={(event) => onFormChange((current) => ({ ...current, avatar: event.target.value }))} />
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
        </div>
    );
}
