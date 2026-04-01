"use client";

import { AdminAuthUtil, useAdminAuth } from "@/hooks/useAdminAuth";
import { OtpApi } from "@/api/otp.api";
import { UserApi } from "@/api/user.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { UserEmailAccount } from "@/types/user";
import { Helper } from "@/lib/helper";

const loginSchema = z.object({
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading, session } = useAdminAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mode, setMode] = useState<"login" | "forgot">("login");
    const [forgotEmail, setForgotEmail] = useState("");
    const [accounts, setAccounts] = useState<UserEmailAccount[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isFindingAccounts, setIsFindingAccounts] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        router.replace(AdminAuthUtil.resolveDefaultAdminPath(session));
    }, [isAuthenticated, isLoading, router, session]);

    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);

        try {
            await login(data.username, data.password);
            toast.success("Đăng nhập thành công.");
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            const message = axiosError.response?.data?.message ?? "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản hoặc mật khẩu.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedAccount = accounts.find((account) => account.id === selectedUserId) ?? null;

    async function handleSearchAccounts() {
        if (!forgotEmail.trim()) {
            toast.error("Vui lòng nhập email.");
            return;
        }

        setIsFindingAccounts(true);
        try {
            const response = await UserApi.getUserByEmail(forgotEmail.trim(), { has_user_role: false });
            const items = Array.isArray(response.data) ? response.data : [];
            setAccounts(items);
            setSelectedUserId(items[0]?.id ?? null);

            if (items.length === 0) {
                toast.error("Không tìm thấy tài khoản quản trị với email này.");
                return;
            }

            toast.success(`Đã tìm thấy ${items.length} tài khoản.`);
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsFindingAccounts(false);
        }
    }

    async function handleSendOtp() {
        if (!selectedUserId) {
            toast.error("Vui lòng chọn tài khoản.");
            return;
        }

        setIsSendingOtp(true);
        try {
            await OtpApi.send({ userId: selectedUserId, otpType: "PASSWORD_RESET", isEmail: true });
            toast.success("OTP đã được gửi đến email của tài khoản.");
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSendingOtp(false);
        }
    }

    async function handleResetPassword() {
        if (!selectedUserId) {
            toast.error("Vui lòng chọn tài khoản.");
            return;
        }

        if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            toast.error("Vui lòng nhập đầy đủ OTP và mật khẩu mới.");
            return;
        }

        setIsResettingPassword(true);
        try {
            await UserApi.forgotPassword({
                userId: selectedUserId,
                sendEmail: true,
                otp: otp.trim(),
                password: newPassword,
                confirmPassword,
            });

            toast.success("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.");
            setMode("login");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsResettingPassword(false);
        }
    }

    return (
        <Card className="w-full max-w-md shadow-xl border-0 shadow-slate-200/50 dark:shadow-slate-900/50">
            <CardHeader className="space-y-4 text-center pb-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                    <LayoutDashboard className="h-7 w-7" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold">AresClub Admin</CardTitle>
                    <CardDescription className="mt-1">{mode === "login" ? "Đăng nhập để quản lý cửa hàng" : "Khôi phục mật khẩu quản trị"}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {mode === "login" ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username">Tên đăng nhập</Label>
                            <Input id="username" type="text" placeholder="admin" autoComplete="username" {...register("username")} aria-invalid={errors.username ? "true" : "false"} />
                            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" {...register("password")} aria-invalid={errors.password ? "true" : "false"} className="pr-10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isSubmitting || isLoading}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>

                        <Button type="button" variant="link" className="w-full" onClick={() => setMode("forgot")}>
                            Quên mật khẩu?
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email tài khoản</Label>
                            <Input type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="admin@example.com" />
                            <Button type="button" variant="outline" className="w-full" onClick={() => void handleSearchAccounts()} disabled={isFindingAccounts}>
                                {isFindingAccounts ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Tìm tài khoản quản trị theo email
                            </Button>
                        </div>

                        {accounts.length > 0 ? (
                            <div className="space-y-2">
                                <Label>Chọn tài khoản</Label>
                                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
                                    {accounts.map((account) => (
                                        <button
                                            key={account.id}
                                            type="button"
                                            className={`w-full rounded-md border p-2 text-left transition-colors ${selectedUserId === account.id ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
                                            onClick={() => setSelectedUserId(account.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={String(account.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.full_name || account.username || `U${account.id}`)}&background=e2e8f0&color=0f172a`)}
                                                    alt={String(account.full_name || account.username || `User #${account.id}`)}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{account.full_name || account.username || `User #${account.id}`}</p>
                                                    <p className="text-xs text-muted-foreground">@{account.username || "-"} - {account.email || "-"}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {selectedAccount ? (
                            <div className="space-y-2 rounded-md border p-3 bg-muted/20">
                                <p className="text-sm font-medium">Tài khoản đã chọn: {selectedAccount.full_name || selectedAccount.username || `#${selectedAccount.id}`}</p>
                                <Button type="button" variant="outline" onClick={() => void handleSendOtp()} disabled={isSendingOtp}>
                                    {isSendingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Gửi OTP qua email
                                </Button>
                                <Input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Nhập OTP" />
                                <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Mật khẩu mới" />
                                <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu mới" />
                                <Button type="button" className="w-full" onClick={() => void handleResetPassword()} disabled={isResettingPassword}>
                                    {isResettingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Đặt lại mật khẩu
                                </Button>
                            </div>
                        ) : null}

                        <Button type="button" variant="link" className="w-full" onClick={() => setMode("login")}>Quay lại đăng nhập</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
