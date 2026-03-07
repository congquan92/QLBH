"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
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

const loginSchema = z.object({
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading, session } = useAdminAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        const firstAllowedPath = session?.allowedUrls?.[0];
        const nextPath = firstAllowedPath?.startsWith("/admin") ? firstAllowedPath : firstAllowedPath ? `/admin${firstAllowedPath.startsWith("/") ? "" : "/"}${firstAllowedPath}` : "/admin/dashboard";

        router.replace(nextPath);
    }, [isAuthenticated, isLoading, router, session?.allowedUrls]);

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

    return (
        <Card className="w-full max-w-md shadow-xl border-0 shadow-slate-200/50 dark:shadow-slate-900/50">
            <CardHeader className="space-y-4 text-center pb-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                    <LayoutDashboard className="h-7 w-7" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold">AresClub Admin</CardTitle>
                    <CardDescription className="mt-1">Đăng nhập để quản lý cửa hàng</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
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
                </form>
            </CardContent>
        </Card>
    );
}
