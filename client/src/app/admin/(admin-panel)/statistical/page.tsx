"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatisticsApi } from "@/api/admin/statistics.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { ActiveUserStats, CategoryStats, MonthlyRevenue, OrderStats, TopCustomerStats, TopProduct } from "@/types/statistics";
import { Activity, Boxes, ChartColumnIncreasing, CircleDollarSign, PackageSearch, RefreshCw, ShoppingBag, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Helper } from "@/lib/helper";
import { TopCustomersCard } from "./_components/top-customers-card";

type PeriodValue = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";

const PERIOD_OPTIONS: Array<{ value: PeriodValue; label: string; subtitle: string }> = [
    { value: "1", label: "1 tháng", subtitle: "Tháng gần nhất" },
    { value: "2", label: "2 tháng", subtitle: "2 tháng gần nhất" },
    { value: "3", label: "3 tháng", subtitle: "3 tháng gần nhất" },
    { value: "4", label: "4 tháng", subtitle: "4 tháng gần nhất" },
    { value: "5", label: "5 tháng", subtitle: "5 tháng gần nhất" },
    { value: "6", label: "6 tháng", subtitle: "Nửa năm" },
    { value: "7", label: "7 tháng", subtitle: "7 tháng gần nhất" },
    { value: "8", label: "8 tháng", subtitle: "8 tháng gần nhất" },
    { value: "9", label: "9 tháng", subtitle: "9 tháng gần nhất" },
    { value: "10", label: "10 tháng", subtitle: "10 tháng gần nhất" },
    { value: "11", label: "11 tháng", subtitle: "11 tháng gần nhất" },
    { value: "12", label: "12 tháng", subtitle: "Cả năm" },
];

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
    const [period, setPeriod] = useState<PeriodValue>("1");
    const [customerSort, setCustomerSort] = useState<"desc" | "asc">("desc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeUsers, setActiveUsers] = useState<ActiveUserStats | null>(null);
    const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
    const [revenue12Months, setRevenue12Months] = useState<MonthlyRevenue[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [categories, setCategories] = useState<CategoryStats[]>([]);
    const [topCustomers, setTopCustomers] = useState<TopCustomerStats[]>([]);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const periodNumber = Number(period);
            const [usersRes, ordersRes, revenueRes, productsRes, categoriesRes, customersRes] = await Promise.all([
                StatisticsApi.getActiveUsers(periodNumber),
                StatisticsApi.getOrders(periodNumber),
                StatisticsApi.getRevenue12Months(),
                StatisticsApi.getTopProducts(periodNumber, 5),
                StatisticsApi.getCategories(periodNumber),
                StatisticsApi.getTopCustomers(periodNumber, 5),
            ]);

            setActiveUsers(usersRes.data ?? null);
            setOrderStats(ordersRes.data ?? null);
            setRevenue12Months(Array.isArray(revenueRes.data) ? revenueRes.data : []);
            setTopProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
            setTopCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Không thể tải dữ liệu thống kê.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        loadDashboard();
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
                            title="Doanh thu (12 tháng)"
                            value={Helper.formatNumber(revenueSummary.revenue)}
                            caption={`Lợi nhuận: ${Helper.formatCurrency(revenueSummary.profit)}`}
                            icon={<CircleDollarSign className="h-4 w-4" />}
                            tone="emerald"
                        />
                        <MetricCard
                            title="Đơn hàng trong kỳ"
                            value={Helper.formatNumber(orderStats?.current ?? 0)}
                            caption={`Tăng trưởng: ${Helper.formatPercent(orderStats?.percentChange ?? 0)}`}
                            icon={<ShoppingBag className="h-4 w-4" />}
                            tone="blue"
                        />
                        <MetricCard
                            title="Khách hàng hoạt động"
                            value={Helper.formatNumber(activeUsers?.current ?? 0)}
                            caption={`Tăng trưởng: ${Helper.formatPercent(activeUsers?.percentChange ?? 0)}`}
                            icon={<Users className="h-4 w-4" />}
                            tone="violet"
                        />
                        <MetricCard
                            title="Người dùng mới"
                            value={Helper.formatNumber(Math.max(0, (activeUsers?.current ?? 0) - (activeUsers?.previous ?? 0)))}
                            caption={`Kỳ trước: ${Helper.formatNumber(activeUsers?.previous ?? 0)} người dùng`}
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
                                        <p className="mt-1 text-base font-semibold">{Helper.formatCurrency(revenueSummary.revenue)}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Tổng chi phí</p>
                                        <p className="mt-1 text-base font-semibold">{Helper.formatCurrency(revenueSummary.cost)}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Lợi nhuận</p>
                                        <p className="mt-1 text-base font-semibold">{Helper.formatCurrency(revenueSummary.profit)}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Biên lợi nhuận</p>
                                        <p className="mt-1 text-base font-semibold">{Helper.formatPercent(revenueSummary.margin)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-cyan-500" />
                                        Doanh thu
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-400" />
                                        Chi phí
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                        Lợi nhuận
                                    </span>
                                </div>

                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart
                                        data={revenue12Months.map((item) => ({ label: Helper.formatMonth(item.month), revenue: Number(item.revenue || 0), cost: Number(item.cost || 0), profit: Number(item.profit || 0) }))}
                                        barCategoryGap="25%"
                                        barGap={2}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tickFormatter={(v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : `${(v / 1_000).toFixed(0)}K`)} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
                                        <Tooltip
                                            formatter={(value) => [Helper.formatCurrency(Number(value ?? 0)), ""]}
                                            labelClassName="font-medium"
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload?.length) return null;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 text-xs shadow-md">
                                                        <p className="mb-1 font-medium">{label}</p>
                                                        {payload.map((entry) => (
                                                            <p key={entry.dataKey as string} style={{ color: entry.color }}>
                                                                {entry.dataKey === "revenue" ? "Doanh thu" : entry.dataKey === "cost" ? "Chi phí" : "Lợi nhuận"}: {Helper.formatCurrency(Number(entry.value ?? 0))}
                                                            </p>
                                                        ))}
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Bar dataKey="revenue" fill="#06b6d4" radius={[3, 3, 0, 0]} maxBarSize={18} />
                                        <Bar dataKey="cost" fill="#fb7185" radius={[3, 3, 0, 0]} maxBarSize={18} />
                                        <Bar dataKey="profit" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={18} />
                                    </BarChart>
                                </ResponsiveContainer>
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
                                <div key={product.productId} className="rounded-lg border p-3">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
                                        <Badge variant="outline">#{index + 1}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Đã bán: {Helper.formatNumber(product.soldQuantity)}</span>
                                        <span className="font-medium text-foreground">{Helper.formatCurrency(product.soldQuantity * Number(product.salePrice || 0))}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <div className="col-span-2">
                    <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Boxes className="h-5 w-5 text-primary" />
                            Danh mục hiệu suất cao
                        </CardTitle>
                        <CardDescription>Xếp hạng danh mục theo số lượng bán trong kỳ {periodMeta.label.toLowerCase()}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-72 w-full" />
                        ) : categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu danh mục.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[...categories]
                                            .sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0))
                                            .slice(0, 6)
                                            .map((cat) => ({ name: cat.categoryName, value: cat.quantity }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                                        labelLine={false}
                                    >
                                        {[...categories]
                                            .sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0))
                                            .slice(0, 6)
                                            .map((_, i) => {
                                                const colors = ["#6366f1", "#f59e0b", "#10b981", "#fb7185", "#06b6d4", "#8b5cf6"];
                                                return <Cell key={i} fill={colors[i] ?? "#6366f1"} />;
                                            })}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload?.length) return null;
                                            return (
                                                <div className="rounded-lg border bg-background p-2 text-xs shadow-md">
                                                    <p className="mb-1 font-medium">{payload[0]?.name}</p>
                                                    <p>Đã bán: {Helper.formatNumber(Number(payload[0]?.value ?? 0))}</p>
                                                    <p>Tăng trưởng: {Helper.formatPercent([...categories].find((c) => c.categoryName === payload[0]?.name)?.percentChange ?? 0)}</p>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Legend iconType="circle" iconSize={10} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                </div>

                <div className="col-span-1">
                    <TopCustomersCard customers={topCustomers} loading={loading} sort={customerSort} onSortChange={setCustomerSort} />
                </div>
            </div>
        </AdminPageShell>
    );
}
