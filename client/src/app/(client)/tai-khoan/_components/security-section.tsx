import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";

type PasswordFormState = {
    oldPassword: string;
    password: string;
    confirmPassword: string;
};

interface SecuritySectionProps {
    form: PasswordFormState;
    isSavingPassword: boolean;
    onFormChange: (updater: (current: PasswordFormState) => PasswordFormState) => void;
    onChangePassword: () => void;
}

export function SecuritySection({ form, isSavingPassword, onFormChange, onChangePassword }: SecuritySectionProps) {
    return (
        <div className="border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-gray-900">Đổi mật khẩu</h2>
            <p className="mt-2 text-sm text-gray-600">Giữ an toàn tài khoản bằng cách thay đổi mật khẩu định kỳ.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label>Mật khẩu cũ</Label>
                    <Input type="password" value={form.oldPassword} onChange={(event) => onFormChange((current) => ({ ...current, oldPassword: event.target.value }))} />
                </div>
                <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <Input type="password" value={form.password} onChange={(event) => onFormChange((current) => ({ ...current, password: event.target.value }))} />
                </div>
                <div className="space-y-2">
                    <Label>Xác nhận mật khẩu</Label>
                    <Input type="password" value={form.confirmPassword} onChange={(event) => onFormChange((current) => ({ ...current, confirmPassword: event.target.value }))} />
                </div>
            </div>

            <Button className="mt-6 rounded-none bg-red-600 hover:bg-red-700" onClick={onChangePassword} disabled={isSavingPassword}>
                {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Cập nhật mật khẩu
            </Button>
        </div>
    );
}
