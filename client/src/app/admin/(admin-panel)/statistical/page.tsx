"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { StatisticsApi } from "@/api/admin/statistics.api";
import { ExportApi } from "@/api/admin/export.api";
import { OrderApi } from "@/api/order.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { OverviewStats, ProductExportStats, SalaryStats, StatsFilterParams, StatsPeriodType, WorkforceStats } from "@/types/statistics";
import { Activity, BarChart3, BriefcaseBusiness, Download, FileText, RefreshCw, TrendingUp, Users, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Helper } from "@/lib/helper";
import type { OrderSummary } from "@/types/order";
import { OrderDetailDialog } from "../orders/_components/order-detail-dialog";

type SectionKey = "overview" | "workforce" | "salary" | "product-export";

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
    { key: "overview", label: "Tổng quan" },
    { key: "workforce", label: "Nhân sự" },
    { key: "salary", label: "Lương" },
    { key: "product-export", label: "Sản phẩm xuất" },
];

function yearsFrom(start = 2023) {
    const now = new Date().getFullYear();
    return Array.from({ length: now - start + 1 }, (_, i) => now - i);
}

export default function StatisticalPage() {
    const [section, setSection] = useState<SectionKey>("overview");
    const [periodType, setPeriodType] = useState<StatsPeriodType>("month");
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [quarter, setQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));

    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [workforce, setWorkforce] = useState<WorkforceStats | null>(null);
    const [salaryStats, setSalaryStats] = useState<SalaryStats | null>(null);
    const [productExport, setProductExport] = useState<ProductExportStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
    const [isLoadingOrderDetail, setIsLoadingOrderDetail] = useState(false);

    const years = useMemo(() => yearsFrom(), []);

    const filterParams = useMemo<StatsFilterParams>(() => {
        return {
            period_type: periodType,
            year,
            month: periodType === "month" ? month : undefined,
            quarter: periodType === "quarter" ? quarter : undefined,
        };
    }, [month, periodType, quarter, year]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (section === "overview") {
                const res = await StatisticsApi.getOverview(filterParams);
                setOverview(res.data);
            } else if (section === "workforce") {
                const res = await StatisticsApi.getWorkforce(filterParams);
                setWorkforce(res.data);
            } else if (section === "salary") {
                const res = await StatisticsApi.getSalaryStats(filterParams);
                setSalaryStats(res.data);
            } else {
                const res = await StatisticsApi.getProductExportStats(filterParams);
                setProductExport(res.data);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu thống kê");
        } finally {
            setLoading(false);
        }
    }, [filterParams, section]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    async function handleExport(type: "excel" | "pdf") {
        setExporting(type);
        try {
            const blob = await StatisticsApi.exportReport({
                ...filterParams,
                section,
                type,
            });
            const fileName = `thong-ke-${section}-${periodType}-${year}.${type === "excel" ? "xlsx" : "pdf"}`;
            ExportApi.downloadBlob(blob, fileName);
            toast.success(`Đã xuất báo cáo ${type.toUpperCase()}.`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể xuất báo cáo.");
        } finally {
            setExporting(null);
        }
    }

    async function handleOpenOrderDetail(orderId: number) {
        setIsLoadingOrderDetail(true);
        try {
            const res = await OrderApi.getAdminOrderDetail(orderId);
            setSelectedOrder(res.data ?? null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết đơn hàng.");
        } finally {
            setIsLoadingOrderDetail(false);
        }
    }

    return (
        <AdminPageShell title="Thống kê" description="Thống kê theo mục: tổng quan, nhân sự, lương và sản phẩm xuất kho">
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {SECTIONS.map((item) => (
                            <Button
                                key={item.key}
                                variant={section === item.key ? "default" : "outline"}
                                onClick={() => setSection(item.key)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>

                    <div className="grid gap-3 md:grid-cols-5">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Loại kỳ</p>
                            <Select value={periodType} onValueChange={(value) => setPeriodType(value as StatsPeriodType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="month">Tháng</SelectItem>
                                    <SelectItem value="quarter">Quý</SelectItem>
                                    <SelectItem value="year">Năm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Năm</p>
                            <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((item) => (
                                        <SelectItem key={item} value={String(item)}>{item}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {periodType === "month" ? (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Tháng</p>
                                <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1)}>Tháng {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}

                        {periodType === "quarter" ? (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Quý</p>
                                <Select value={String(quarter)} onValueChange={(value) => setQuarter(Number(value))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Quý 1</SelectItem>
                                        <SelectItem value="2">Quý 2</SelectItem>
                                        <SelectItem value="3">Quý 3</SelectItem>
                                        <SelectItem value="4">Quý 4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}

                        <div className="md:col-span-2 flex flex-wrap items-end gap-2">
                            <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Làm mới
                            </Button>
                            <Button variant="outline" onClick={() => void handleExport("pdf")} disabled={Boolean(exporting)}>
                                <FileText className="mr-2 h-4 w-4" />
                                {exporting === "pdf" ? "Đang xuất..." : "Xuất PDF"}
                            </Button>
                            <Button onClick={() => void handleExport("excel")} disabled={Boolean(exporting)}>
                                <Download className="mr-2 h-4 w-4" />
                                {exporting === "excel" ? "Đang xuất..." : "Xuất Excel"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {section === "overview" ? (
                <OverviewContent loading={loading} data={overview} onOpenOrderDetail={handleOpenOrderDetail} isLoadingOrderDetail={isLoadingOrderDetail} />
            ) : null}

            {section === "workforce" ? (
                <WorkforceContent loading={loading} data={workforce} />
            ) : null}

            {section === "salary" ? (
                <SalaryContent loading={loading} data={salaryStats} />
            ) : null}

            {section === "product-export" ? (
                <ProductExportContent loading={loading} data={productExport} />
            ) : null}

            <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </AdminPageShell>
    );
}

function OverviewContent({
    loading,
    data,
    onOpenOrderDetail,
    isLoadingOrderDetail,
}: {
    loading: boolean;
    data: OverviewStats | null;
    onOpenOrderDetail: (orderId: number) => Promise<void>;
    isLoadingOrderDetail: boolean;
}) {
    if (loading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (!data) {
        return <Card><CardContent className="p-6 text-sm text-muted-foreground">Không có dữ liệu tổng quan.</CardContent></Card>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{data.period_label}</Badge>
                <span>{data.start_date} - {data.end_date}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Doanh thu" value={Helper.formatCurrency(data.revenue)} icon={<TrendingUp className="h-4 w-4" />} />
                <MetricCard title="Chi phí" value={Helper.formatCurrency(data.cost)} icon={<Wallet className="h-4 w-4" />} />
                <MetricCard title="Lợi nhuận" value={Helper.formatCurrency(data.profit)} icon={<BarChart3 className="h-4 w-4" />} />
                <MetricCard title="Đơn hàng" value={Helper.formatNumber(data.orders)} icon={<Activity className="h-4 w-4" />} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top sản phẩm trong kỳ</CardTitle>
                    <CardDescription>Thống kê sản phẩm theo số lượng và doanh thu.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {data.top_products.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.top_products.map((item) => ({
                                label: item.product_name.length > 24 ? `${item.product_name.slice(0, 24)}...` : item.product_name,
                                quantity: item.quantity,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
                                <Tooltip formatter={(value) => [Helper.formatNumber(Number(value || 0)), "Số lượng"]} />
                                <Bar dataKey="quantity" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : null}
                    {data.top_products.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu sản phẩm.</p>
                    ) : (
                        data.top_products.map((item, index) => (
                            <div key={`${item.product_id}-${index}`} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium text-sm">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground">Số lượng: {Helper.formatNumber(item.quantity)}</p>
                                </div>
                                <p className="text-sm font-semibold">{Helper.formatCurrency(item.total_revenue)}</p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Tỷ trọng danh mục bán</CardTitle>
                        <CardDescription>Biểu đồ tròn: danh mục nào bán chiếm bao nhiêu phần trăm.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!data.category_breakdown || data.category_breakdown.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu danh mục.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.category_breakdown.map((item) => ({
                                            name: item.category_name,
                                            value: item.percentage,
                                            sold: item.sold_quantity,
                                        }))}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        labelLine={false}
                                        label={({ value }: { value?: number }) => `${Number(value ?? 0).toFixed(1)}%`}
                                    >
                                        {data.category_breakdown.map((_, index) => (
                                            <Cell key={index} fill={["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f97316"][index % 7]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, _name, payload) => {
                                            const sold = Number((payload?.payload as { sold?: number })?.sold ?? 0);
                                            return [`${Number(value ?? 0).toFixed(2)}% | SL: ${Helper.formatNumber(sold)}`, "Tỷ trọng"];
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <SimpleListCard
                    title="Danh mục theo tỷ trọng"
                    rows={
                        data.category_breakdown?.map((item) => ({
                            label: `${item.category_name} (${Helper.formatNumber(item.sold_quantity)})`,
                            value: `${item.percentage.toFixed(2)}%`,
                        })) ?? []
                    }
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top khách hàng chi tiêu nhiều</CardTitle>
                    <CardDescription>Xem khách hàng chi tiêu cao và lịch sử đơn hàng chi tiết.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {!data.top_customers || data.top_customers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu khách hàng.</p>
                    ) : (
                        data.top_customers.map((customer, index) => (
                            <div key={`${customer.userId ?? `guest-${index}`}`} className="rounded-lg border p-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-sm">#{index + 1} {customer.customerName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {customer.customerPhone || "-"} {customer.customerEmail ? `| ${customer.customerEmail}` : ""}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">{Helper.formatCurrency(customer.totalPurchase)}</p>
                                        <p className="text-xs text-muted-foreground">{customer.orderCount} đơn</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Lịch sử đơn hàng</p>
                                    {customer.orders.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">Không có đơn hàng.</p>
                                    ) : (
                                        customer.orders.map((order) => (
                                            <div key={order.orderId} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-xs">
                                                <div>
                                                    <p>Đơn #{order.orderId} • {order.orderStatus}</p>
                                                    <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{Helper.formatCurrency(order.totalAmount)}</span>
                                                    <Button size="sm" variant="outline" disabled={isLoadingOrderDetail} onClick={() => void onOpenOrderDetail(order.orderId)}>
                                                        Xem chi tiết
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function WorkforceContent({ loading, data }: { loading: boolean; data: WorkforceStats | null }) {
    if (loading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (!data) {
        return <Card><CardContent className="p-6 text-sm text-muted-foreground">Không có dữ liệu nhân sự.</CardContent></Card>;
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard title="Tổng nhân sự" value={Helper.formatNumber(data.summary.total_employees)} icon={<Users className="h-4 w-4" />} />
                <MetricCard title="Đang hoạt động" value={Helper.formatNumber(data.summary.active_employees)} icon={<Activity className="h-4 w-4" />} />
                <MetricCard title="Tạm nghỉ" value={Helper.formatNumber(data.summary.inactive_employees)} icon={<BriefcaseBusiness className="h-4 w-4" />} />
                <MetricCard title="Nhân sự mới" value={Helper.formatNumber(data.summary.new_employees)} icon={<TrendingUp className="h-4 w-4" />} />
                <MetricCard title="Ngày nghỉ phép" value={Helper.formatNumber(data.summary.approved_leave_days)} icon={<FileText className="h-4 w-4" />} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Biểu đồ theo chức vụ</CardTitle>
                        <CardDescription>Tỷ trọng nhân sự theo từng chức vụ.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.position_breakdown.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu chức vụ.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={data.position_breakdown.map((item) => ({ name: item.position_name, value: item.total }))}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        labelLine={false}
                                        label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                                    >
                                        {data.position_breakdown.map((_, index) => (
                                            <Cell key={index} fill={["#0ea5e9", "#f59e0b", "#10b981", "#6366f1", "#ef4444", "#14b8a6"][index % 6]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [Helper.formatNumber(Number(value || 0)), "Nhân sự"]} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <SimpleListCard
                    title="Phân bổ theo chức vụ"
                    rows={data.position_breakdown.map((item) => ({ label: item.position_name, value: Helper.formatNumber(item.total) }))}
                />
                <SimpleListCard
                    title="Phân bổ theo loại nhân sự"
                    rows={data.employment_breakdown.map((item) => ({ label: item.employment_type, value: Helper.formatNumber(item.total) }))}
                />
            </div>
        </div>
    );
}

function SalaryContent({ loading, data }: { loading: boolean; data: SalaryStats | null }) {
    if (loading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (!data) {
        return <Card><CardContent className="p-6 text-sm text-muted-foreground">Không có dữ liệu lương.</CardContent></Card>;
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Tổng lương thực nhận" value={Helper.formatCurrency(data.summary.total_final_salary)} icon={<Wallet className="h-4 w-4" />} />
                <MetricCard title="Tổng thưởng lễ" value={Helper.formatCurrency(data.summary.total_holiday_bonus)} icon={<TrendingUp className="h-4 w-4" />} />
                <MetricCard title="Tổng thưởng thêm" value={Helper.formatCurrency(data.summary.total_manual_bonus)} icon={<Activity className="h-4 w-4" />} />
                <MetricCard title="Lương TB / bản ghi" value={Helper.formatCurrency(data.summary.average_salary)} icon={<BarChart3 className="h-4 w-4" />} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Biểu đồ top nhân sự theo lương</CardTitle>
                        <CardDescription>Tổng thực nhận theo nhân sự trong kỳ.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.top_employees.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu top lương.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={data.top_employees.slice(0, 7).map((item) => ({
                                    label: item.employee_name.length > 16 ? `${item.employee_name.slice(0, 16)}...` : item.employee_name,
                                    total_salary: item.total_salary,
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={64} />
                                    <Tooltip formatter={(value) => [Helper.formatCurrency(Number(value || 0)), "Thực nhận"]} />
                                    <Bar dataKey="total_salary" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Biểu đồ thưởng theo loại</CardTitle>
                        <CardDescription>Tổng tiền thưởng theo từng loại thưởng.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.bonus_by_type.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu thưởng.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={data.bonus_by_type.map((item) => ({
                                    label: item.type || "Khác",
                                    total_amount: item.total_amount,
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={64} />
                                    <Tooltip formatter={(value) => [Helper.formatCurrency(Number(value || 0)), "Tổng thưởng"]} />
                                    <Bar dataKey="total_amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <SimpleListCard
                title="Top nhân sự theo tổng lương"
                rows={data.top_employees.map((item) => ({ label: item.employee_name, value: Helper.formatCurrency(item.total_salary) }))}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Tổng thưởng theo loại (chi tiết người nhận)</CardTitle>
                    <CardDescription>Thể hiện thưởng cho ai trong từng loại thưởng.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.bonus_by_type.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu thưởng.</p>
                    ) : (
                        data.bonus_by_type.map((bonusType, index) => (
                            <div key={`${bonusType.type}-${index}`} className="rounded-lg border p-3 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-medium">{bonusType.type || "Khác"}</p>
                                    <Badge variant="outline">{Helper.formatCurrency(bonusType.total_amount)}</Badge>
                                </div>
                                {bonusType.recipients.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">Không có người nhận.</p>
                                ) : (
                                    bonusType.recipients.map((recipient) => (
                                        <div key={`${bonusType.type}-${recipient.user_id}`} className="rounded-md border p-2 text-sm space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{recipient.employee_name}</span>
                                                <span>{Helper.formatCurrency(recipient.total_amount)}</span>
                                            </div>
                                            {recipient.bonus_items.length > 0 ? (
                                                <div className="space-y-1">
                                                    {recipient.bonus_items.map((item) => (
                                                        <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded border bg-muted/20 px-2 py-1 text-xs">
                                                            <span>
                                                                {item.reason || "Không có lý do"} | Loại: {item.bonus_type || "-"} | {item.month}/{item.year}
                                                            </span>
                                                            <span className="font-medium">{Helper.formatCurrency(item.amount)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ProductExportContent({ loading, data }: { loading: boolean; data: ProductExportStats | null }) {
    if (loading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (!data) {
        return <Card><CardContent className="p-6 text-sm text-muted-foreground">Không có dữ liệu sản phẩm xuất.</CardContent></Card>;
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard title="Tổng số lượng đã xuất" value={Helper.formatNumber(data.summary.total_export_quantity)} icon={<BarChart3 className="h-4 w-4" />} />
                <MetricCard title="Doanh thu xuất" value={Helper.formatCurrency(data.summary.total_export_revenue)} icon={<Wallet className="h-4 w-4" />} />
                <MetricCard title="Sản phẩm có dữ liệu" value={Helper.formatNumber(data.summary.product_count)} icon={<Activity className="h-4 w-4" />} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Xu hướng số lượng xuất</CardTitle>
                    <CardDescription>Biểu đồ sản phẩm xuất theo kỳ hiện tại.</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.trend.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu xu hướng.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                                <Tooltip formatter={(value) => [Helper.formatNumber(Number(value || 0)), "Số lượng"]} />
                                <Bar dataKey="quantity" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <SimpleListCard
                title="Top sản phẩm xuất"
                rows={data.top_products.map((item) => ({ label: item.product_name, value: `${Helper.formatNumber(item.quantity)} | ${Helper.formatCurrency(item.revenue)}` }))}
            />
        </div>
    );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-muted-foreground">{icon}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
            </CardContent>
        </Card>
    );
}

function SimpleListCard({ title, rows }: { title: string; rows: Array<{ label: string; value: string }> }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
                ) : (
                    rows.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                            <p className="text-sm">{item.label}</p>
                            <p className="text-sm font-semibold">{item.value}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
