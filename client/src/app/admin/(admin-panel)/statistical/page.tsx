"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatisticsApi } from "@/api/statistics.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActiveUserStats, CategoryStats, MonthlyRevenue, OrderStats, TopProduct } from "@/types/statistics";
import { Activity, Boxes, ChartColumnIncreasing, CircleDollarSign, PackageSearch, Percent, RefreshCw, ShoppingBag, Users } from "lucide-react";

type PeriodValue = "1" | "2" | "3";

const PERIOD_OPTIONS: Array<{ value: PeriodValue; label: string; subtitle: string }> = [
    { value: "1", label: "7 ngày", subtitle: "Theo dõi ngắn hạn" },
    { value: "2", label: "30 ngày", subtitle: "Xu hướng tháng" },
    { value: "3", label: "90 ngày", subtitle: "Toàn cảnh quý" },
];

function formatNumber(value: number) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, value || 0));
}

function formatMoney(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function formatMonth(value: string) {
    const input = String(value || "").trim();
    if (!input) return "--";

    const [year, month] = input.split("-");
    if (!year || !month) return input;
    return `${month}/${year.slice(-2)}`;
}

function formatPercent(value: number) {
    return `${(value || 0).toFixed(1)}%`;
}

interface MetricCardProps {
    title: string;
    value: string;
    caption: string;
    icon: React.ReactNode;
    tone?: "emerald" | "blue" | "amber" | "violet";
}

function MetricCard({ title, value, caption, icon, tone = "blue" }: MetricCardProps) {
    const toneClass: Record<NonNullable<MetricCardProps["tone"]>, string> = {
        emerald: "from-emerald-500/10 to-emerald-500/0 border-emerald-500/20",
        blue: "from-sky-500/10 to-sky-500/0 border-sky-500/20",
        amber: "from-amber-500/10 to-amber-500/0 border-amber-500/20",
        violet: "from-fuchsia-500/10 to-fuchsia-500/0 border-fuchsia-500/20",
    };

    return (
        <Card className={`bg-linear-to-br ${toneClass[tone]}`}>
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between gap-2">
                    <span>{title}</span>
                    <span className="text-muted-foreground">{icon}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className="text-2xl font-semibold tracking-tight">{value}</div>
                <p className="text-xs text-muted-foreground">{caption}</p>
            </CardContent>
        </Card>
    );
}

export default function StatisticalPage() {
    const [period, setPeriod] = useState<PeriodValue>("2");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeUsers, setActiveUsers] = useState<ActiveUserStats | null>(null);
    const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
    const [revenue12Months, setRevenue12Months] = useState<MonthlyRevenue[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [categories, setCategories] = useState<CategoryStats[]>([]);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const periodNumber = Number(period);
            const [usersRes, ordersRes, revenueRes, productsRes, categoriesRes] = await Promise.all([
                StatisticsApi.getActiveUsers(periodNumber),
                StatisticsApi.getOrders(periodNumber),
                StatisticsApi.getRevenue12Months(),
                StatisticsApi.getTopProducts(periodNumber, 5),
                StatisticsApi.getCategories(periodNumber),
            ]);

            setActiveUsers(usersRes.data ?? null);
            setOrderStats(ordersRes.data ?? null);
            setRevenue12Months(Array.isArray(revenueRes.data) ? revenueRes.data : []);
            setTopProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Không thể tải dữ liệu thống kê.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const periodMeta = PERIOD_OPTIONS.find((item) => item.value === period) ?? PERIOD_OPTIONS[1];

    const revenueSummary = useMemo(() => {
        const totals = revenue12Months.reduce(
            (acc, item) => {
                acc.revenue += Number(item.revenue || 0);
                acc.cost += Number(item.cost || 0);
                acc.profit += Number(item.profit || 0);
                return acc;
            },
            { revenue: 0, cost: 0, profit: 0 },
        );

        const maxRevenue = Math.max(...revenue12Months.map((item) => Number(item.revenue || 0)), 0);

        return {
            ...totals,
            margin: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0,
            maxRevenue,
        };
    }, [revenue12Months]);

    return (
        <AdminPageShell title="Thống kê" description="Dashboard vận hành: doanh thu, đơn hàng, người dùng và sản phẩm nổi bật">
            <Card className="overflow-hidden border-dashed">
                <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium">Bộ lọc dữ liệu</p>
                        <p className="text-xs text-muted-foreground">{periodMeta.subtitle}. Dữ liệu tự đồng bộ từ API thống kê.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={period} onValueChange={(value) => setPeriod(value as PeriodValue)}>
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Chọn khoảng thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                {PERIOD_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {error ? (
                <Card className="border-destructive/30">
                    <CardHeader>
                        <CardTitle className="text-destructive">Không thể tải dashboard</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)
                ) : (
                    <>
                        <MetricCard
                            title="Tổng doanh thu"
                            value={formatMoney(orderStats?.total_revenue ?? 0)}
                            caption={`${formatNumber(orderStats?.total_orders ?? 0)} đơn trong ${periodMeta.label}`}
                            icon={<CircleDollarSign className="h-4 w-4" />}
                            tone="emerald"
                        />
                        <MetricCard title="Đơn hoàn tất" value={formatNumber(orderStats?.completed_orders ?? 0)} caption={`Đơn hủy: ${formatNumber(orderStats?.cancelled_orders ?? 0)}`} icon={<ShoppingBag className="h-4 w-4" />} tone="blue" />
                        <MetricCard title="Khách hàng hoạt động" value={formatNumber(activeUsers?.active_users ?? 0)} caption={`Tăng trưởng: ${formatPercent(activeUsers?.growth_rate ?? 0)}`} icon={<Users className="h-4 w-4" />} tone="violet" />
                        <MetricCard
                            title="Giá trị đơn trung bình"
                            value={formatMoney(orderStats?.average_order_value ?? 0)}
                            caption={`Người dùng mới: ${formatNumber(activeUsers?.new_users ?? 0)}`}
                            icon={<Activity className="h-4 w-4" />}
                            tone="amber"
                        />
                    </>
                )}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ChartColumnIncreasing className="h-5 w-5 text-primary" />
                            Doanh thu 12 tháng
                        </CardTitle>
                        <CardDescription>Tổng quan doanh thu, chi phí và lợi nhuận theo từng tháng.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <Skeleton className="h-72 w-full" />
                        ) : revenue12Months.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu để hiển thị.</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Doanh thu lũy kế</p>
                                        <p className="mt-1 text-base font-semibold">{formatMoney(revenueSummary.revenue)}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Tổng chi phí</p>
                                        <p className="mt-1 text-base font-semibold">{formatMoney(revenueSummary.cost)}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Lợi nhuận</p>
                                        <p className="mt-1 text-base font-semibold">{formatMoney(revenueSummary.profit)}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Biên lợi nhuận</p>
                                        <p className="mt-1 text-base font-semibold">{formatPercent(revenueSummary.margin)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {revenue12Months.map((item) => {
                                        const revenue = Number(item.revenue || 0);
                                        const width = revenueSummary.maxRevenue > 0 ? (revenue / revenueSummary.maxRevenue) * 100 : 0;

                                        return (
                                            <div key={`${item.month}-${item.revenue}`} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium">{formatMonth(item.month)}</span>
                                                    <span className="text-muted-foreground">{formatMoney(revenue)}</span>
                                                </div>
                                                <div className="h-2.5 rounded-full bg-muted">
                                                    <div className="h-2.5 rounded-full bg-linear-to-r from-cyan-500 to-indigo-500" style={{ width: `${Math.max(width, 6)}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PackageSearch className="h-5 w-5 text-primary" />
                            Top sản phẩm
                        </CardTitle>
                        <CardDescription>5 sản phẩm tạo doanh thu tốt nhất trong kỳ chọn.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)
                        ) : topProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu sản phẩm.</p>
                        ) : (
                            topProducts.map((product, index) => (
                                <div key={product.product_id} className="rounded-lg border p-3">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <p className="line-clamp-2 text-sm font-medium">{product.product_name}</p>
                                        <Badge variant="outline">#{index + 1}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Đã bán: {formatNumber(product.total_sold)}</span>
                                        <span className="font-medium text-foreground">{formatMoney(product.total_revenue)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Boxes className="h-5 w-5 text-primary" />
                        Danh mục hiệu suất cao
                    </CardTitle>
                    <CardDescription>Xếp hạng danh mục theo doanh thu trong kỳ {periodMeta.label.toLowerCase()}.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-52 w-full" />
                    ) : categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu danh mục.</p>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {categories
                                .sort((a, b) => Number(b.total_revenue || 0) - Number(a.total_revenue || 0))
                                .slice(0, 6)
                                .map((category) => (
                                    <div key={category.category_id} className="rounded-xl border bg-card p-4">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <p className="line-clamp-1 font-medium">{category.category_name}</p>
                                            <Badge variant="secondary" className="gap-1">
                                                <Percent className="h-3 w-3" />
                                                Top
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p>Sản phẩm: {formatNumber(category.total_products)}</p>
                                            <p>Đã bán: {formatNumber(category.total_sold)}</p>
                                            <p className="font-medium text-foreground">{formatMoney(category.total_revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
