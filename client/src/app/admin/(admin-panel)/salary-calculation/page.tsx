"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { SalaryApi } from "@/api/salary.api";
import { UserApi } from "@/api/user.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Loader2, Calculator, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Helper } from "@/lib/helper";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SalaryCalculation } from "@/types/salary";
import type { UserProfile } from "@/types/user";

export default function SalaryCalculationPage() {
    const { hasPermission } = useAdminAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [result, setResult] = useState<SalaryCalculation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const canCalculate = hasPermission("CALCULATE_SALARY");

    async function fetchUsers() {
        if (!canCalculate) return;

        setIsLoadingUsers(true);
        try {
            const res = await UserApi.getUsers({ page: 1, size: 100 });
            setUsers(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoadingUsers(false);
        }
    }

    useEffect(() => {
        if (canCalculate) {
            void fetchUsers();
        }
    }, [canCalculate]);

    async function handleCalculate() {
        if (!selectedUserId) {
            toast.error("Vui lòng chọn nhân viên");
            return;
        }

        if (!month || !year) {
            toast.error("Vui lòng chọn tháng và năm");
            return;
        }

        setIsLoading(true);
        try {
            const res = await SalaryApi.calculateSalary(Number(selectedUserId), Number(month), Number(year));
            setResult(res.data);
            toast.success("Tính lương thành công!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tính lương");
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    }

    if (!canCalculate) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Tính lương</h1>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center text-muted-foreground">
                            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                            <p>Bạn không có quyền CALCULATE_SALARY</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tính lương nhân viên</h1>
                    <p className="text-muted-foreground">Tính toán lương tháng cho nhân viên dựa trên giờ làm và chấm công</p>
                </div>
            </div>

            {/* Calculation Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Thông tin tính lương
                    </CardTitle>
                    <CardDescription>Chọn nhân viên, tháng và năm để tính lương</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="user">Nhân viên</Label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={isLoadingUsers}>
                                <SelectTrigger id="user">
                                    <SelectValue placeholder={isLoadingUsers ? "Đang tải..." : "Chọn nhân viên"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.full_name || user.email} - {user.position?.name || "N/A"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="month">Tháng</Label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger id="month">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <SelectItem key={m} value={String(m)}>
                                            Tháng {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Năm</Label>
                            <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} min="2020" max="2100" />
                        </div>
                    </div>
                    <Button onClick={handleCalculate} disabled={isLoading || !selectedUserId}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tính...
                            </>
                        ) : (
                            <>
                                <Calculator className="mr-2 h-4 w-4" />
                                Tính lương
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Result */}
            {result && (
                <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lương cơ bản</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{Helper.formatPrice(String(result.base_salary))}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng giờ làm</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.total_hours.toFixed(2)}h</div>
                                <p className="text-xs text-muted-foreground">{result.total_days_worked} ngày làm việc</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Thưởng & Phạt</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">+{Helper.formatPrice(String(result.bonus))}</div>
                                <p className="text-xs text-red-600">-{Helper.formatPrice(String(result.late_deductions))}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-primary">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng lương</CardTitle>
                                <DollarSign className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{Helper.formatPrice(String(result.total_salary))}</div>
                                <p className="text-xs text-muted-foreground">
                                    {result.full_name} - {result.position}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết theo ngày</CardTitle>
                            <CardDescription>
                                Bảng công tháng {result.month}/{result.year}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-muted">
                                        <tr>
                                            <th className="px-6 py-3">Ngày</th>
                                            <th className="px-6 py-3">Giờ làm</th>
                                            <th className="px-6 py-3">Trạng thái</th>
                                            <th className="px-6 py-3">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.details?.map((detail, idx) => (
                                            <tr key={idx} className="border-b hover:bg-muted/50">
                                                <td className="px-6 py-4 font-medium">{new Date(detail.date).toLocaleDateString("vi-VN")}</td>
                                                <td className="px-6 py-4">{detail.hours_worked.toFixed(2)}h</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            detail.status === "PRESENT" ? "bg-green-100 text-green-800" : detail.status === "LATE" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {detail.status === "PRESENT" ? "Đúng giờ" : detail.status === "LATE" ? "Muộn" : detail.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{Helper.formatPrice(String(detail.amount))}</td>
                                            </tr>
                                        ))}
                                        {(!result.details || result.details.length === 0) && (
                                            <tr>
                                                <td className="px-6 py-8 text-center text-muted-foreground" colSpan={4}>
                                                    Không có dữ liệu chi tiết
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
