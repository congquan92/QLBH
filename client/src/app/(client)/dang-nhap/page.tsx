"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserAuthUtil } from "@/lib/UserAuth-util";
import { OtpApi } from "@/api/otp.api";
import { UserApi } from "@/api/user.api";
import type { UserEmailAccount } from "@/types/user";
import { Helper } from "@/lib/helper";

import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { UserAuthStore } from "@/hooks/useClientAuth";

const loginSchema = z.object({
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function StoreLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "/tai-khoan";
    const session = UserAuthStore.useStore((state) => state.session);
    const isLoading = UserAuthStore.useStore((state) => state.isLoading);
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

    const isAuthenticated = UserAuthUtil.isSessionValid(session);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace(redirectPath);
        }
    }, [isAuthenticated, isLoading, redirectPath, router]);

    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);

        try {
            await UserAuthStore.actions.login(data.username, data.password);
            toast.success("Đăng nhập thành công.");
            router.replace(redirectPath);
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            const message = axiosError.response?.data?.message ?? (error instanceof Error ? error.message : "Đăng nhập thất bại.");
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
            const response = await UserApi.getUserByEmail(forgotEmail.trim(), { has_user_role: true });
            const items = Array.isArray(response.data) ? response.data : [];
            setAccounts(items);
            setSelectedUserId(items[0]?.id ?? null);

            if (items.length === 0) {
                toast.error("Không tìm thấy tài khoản người dùng với email này.");
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
        <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-6xl items-center px-4 py-10">
            <div className="grid w-full gap-8 lg:grid-cols-[1fr_450px]">
                <section className="relative hidden min-h-100 overflow-hidden rounded-none border border-gray-200 lg:block">
                    <Image src="/login_back.png" alt="Login Banner" fill className="object-cover object-left" />
                </section>

                <Card className="border-gray-200 rounded-none shadow-lg">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <UserRound className="h-7 w-7" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Đăng nhập khách hàng</CardTitle>
                            <CardDescription className="mt-1">Hãy đăng nhập để truy cập khu mua sắm cá nhân.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {mode === "login" ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Tên đăng nhập</Label>
                                    <Input id="username" type="text" autoComplete="username" placeholder="nhập username" {...register("username")} aria-invalid={errors.username ? "true" : "false"} />
                                    {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <div className="relative">
                                        <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" {...register("password")} aria-invalid={errors.password ? "true" : "false"} className="pr-10" />
                                        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-900">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                                </div>

                                <Button type="submit" className="h-11 w-full rounded-none bg-red-600 text-base hover:bg-red-700" disabled={isSubmitting || isLoading}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang đăng nhập...
                                        </>
                                    ) : (
                                        "Đăng nhập"
                                    )}
                                </Button>

                                <Button type="button" variant="link" className="h-auto w-full py-0 text-red-600" onClick={() => setMode("forgot")}>
                                    Quên mật khẩu?
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Email tài khoản</Label>
                                    <Input type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="user@example.com" />
                                    <Button type="button" variant="outline" className="w-full" onClick={() => void handleSearchAccounts()} disabled={isFindingAccounts}>
                                        {isFindingAccounts ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Tìm tài khoản người dùng theo email
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
                                                    className={`w-full rounded-md border p-2 text-left transition-colors ${selectedUserId === account.id ? "border-red-500 bg-red-50" : "hover:bg-muted/40"}`}
                                                    onClick={() => setSelectedUserId(account.id)}
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">{account.full_name || account.username || `User #${account.id}`}</p>
                                                        <p className="text-xs text-muted-foreground">@{account.username || "-"} - {account.email || "-"}</p>
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
                                        <Button type="button" className="w-full rounded-none bg-red-600 hover:bg-red-700" onClick={() => void handleResetPassword()} disabled={isResettingPassword}>
                                            {isResettingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Đặt lại mật khẩu
                                        </Button>
                                    </div>
                                ) : null}

                                <Button type="button" variant="link" className="w-full" onClick={() => setMode("login")}>Quay lại đăng nhập</Button>
                            </div>
                        )}

                        <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600">
                            Chưa có tài khoản?{" "}
                            <Link href="/dang-ky" className="font-semibold text-red-600 hover:text-red-700">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
