"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserAuthUtil } from "@/lib/user-auth";
import { UserAuthStore } from "@/stores/user-auth.store";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AxiosError } from "axios";

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

    return (
        <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-6xl items-center px-4 py-10">
            <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px]">
                <section className="rounded-none border border-gray-200 bg-[linear-gradient(135deg,#111827_0%,#1f2937_45%,#7f1d1d_100%)] p-8 text-white lg:p-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-200">Khách hàng</p>
                    <h1 className="mt-4 text-4xl font-bold leading-tight">Đăng nhập để quản lý giỏ hàng, đơn mua và thông tin cá nhân.</h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-gray-200">
                        Backend đã có đầy đủ API cho tài khoản người dùng. Sau khi đăng nhập, bạn có thể xem hồ sơ, danh sách đơn hàng, địa chỉ giao nhận và sử dụng giỏ hàng xuyên suốt trong storefront.
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="border border-white/10 bg-white/10 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-red-200">Giỏ hàng</p>
                            <p className="mt-2 text-sm text-white/90">Thêm, sửa và theo dõi sản phẩm đã chọn.</p>
                        </div>
                        <div className="border border-white/10 bg-white/10 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-red-200">Đơn hàng</p>
                            <p className="mt-2 text-sm text-white/90">Xem tình trạng và chi tiết các đơn đã tạo.</p>
                        </div>
                        <div className="border border-white/10 bg-white/10 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-red-200">Tài khoản</p>
                            <p className="mt-2 text-sm text-white/90">Cập nhật thông tin, đổi mật khẩu và quản lý địa chỉ.</p>
                        </div>
                    </div>
                </section>

                <Card className="border-gray-200 shadow-lg">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <UserRound className="h-7 w-7" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Đăng nhập khách hàng</CardTitle>
                            <CardDescription className="mt-1">Sử dụng tài khoản USER để truy cập khu mua sắm cá nhân.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
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
                        </form>

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
