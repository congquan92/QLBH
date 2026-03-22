"use client";

import { AuthApi } from "@/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AxiosError } from "axios";

const registerSchema = z
    .object({
        fullName: z.string().min(2, "Vui lòng nhập họ tên"),
        username: z.string().min(3, "Tên đăng nhập phải từ 3 ký tự"),
        email: z.email("Email không hợp lệ"),
        phone: z.string().regex(/^(0[0-9]{9}|\+84[0-9]{9})$/, "Số điện thoại không hợp lệ"),
        gender: z.enum(["MALE", "FEMALE", "OTHER"]),
        dateOfBirth: z.string().min(1, "Vui lòng chọn ngày sinh"),
        password: z.string().min(8, "Mật khẩu phải ít nhất 8 ký tự"),
        confirmPassword: z.string().min(8, "Mật khẩu xác nhận phải ít nhất 8 ký tự"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function StoreRegisterPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            gender: "OTHER",
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);

        try {
            await AuthApi.register({
                username: data.username,
                email: data.email,
                password: data.password,
                fullName: data.fullName,
                phone: data.phone,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
            });
            toast.success("Đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.");
            router.push("/dang-nhap");
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            toast.error(axiosError.response?.data?.message ?? "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-6xl items-center px-4 py-10">
            <div className="grid w-full gap-8 lg:grid-cols-[420px_1fr]">
                <Card className="border-gray-200 rounded-none shadow-lg">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <UserPlus className="h-7 w-7" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Tạo tài khoản mua sắm</CardTitle>
                            <CardDescription className="mt-1">Điền thông tin cơ bản để sử dụng giỏ hàng và khu tài khoản cá nhân.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Họ tên</Label>
                                <Input id="fullName" {...register("fullName")} />
                                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Tên đăng nhập</Label>
                                    <Input id="username" {...register("username")} />
                                    {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input id="phone" {...register("phone")} />
                                    {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register("email")} />
                                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Giới tính</Label>
                                    <select id="gender" {...register("gender")} className="h-10 w-full rounded-none border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-red-500">
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                    {errors.gender && <p className="text-sm text-red-600">{errors.gender.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                    <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                                    {errors.dateOfBirth && <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input id="password" type="password" {...register("password")} />
                                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                    <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                                    {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            <Button type="submit" className="h-11 w-full rounded-none bg-red-600 text-base hover:bg-red-700" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tạo tài khoản...
                                    </>
                                ) : (
                                    "Đăng ký"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600">
                            Đã có tài khoản?{" "}
                            <Link href="/dang-nhap" className="font-semibold text-red-600 hover:text-red-700">
                                Đăng nhập
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <section className="relative hidden min-h-100 overflow-hidden rounded-none border border-gray-200 lg:block">
                    <Image src="/reg_back.png" alt="Register Banner" fill className="object-cover object-center" />
                </section>
            </div>
        </div>
    );
}
