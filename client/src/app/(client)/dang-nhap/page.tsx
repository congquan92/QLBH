"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserAuthUtil } from "@/lib/user-auth";

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
