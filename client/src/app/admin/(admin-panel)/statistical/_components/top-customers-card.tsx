import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Helper } from "@/lib/helper";
import type { TopCustomerStats } from "@/types/statistics";
import { Users } from "lucide-react";
import { CustomerOrdersDialog } from "./customer-orders-dialog";

type TopCustomersCardProps = {
    customers: TopCustomerStats[];
    loading: boolean;

    sort: "desc" | "asc";
    onSortChange: (value: "desc" | "asc") => void;
};

export function TopCustomersCard({ customers, loading, sort, onSortChange }: TopCustomersCardProps) {
    const [selectedCustomer, setSelectedCustomer] = useState<TopCustomerStats | null>(null);

    const sortedCustomers = useMemo(() => {
        const sorted = [...customers].sort((a, b) => Number(a.totalPurchase || 0) - Number(b.totalPurchase || 0));
        return sort === "desc" ? sorted.reverse() : sorted;
    }, [customers, sort]);

    return (
        <>
            <Card>
                <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Top 5 khách hàng theo tổng mua
                        </CardTitle>
                       
                    </div>
                    <div className="w-full md:w-52">
                        <Select value={sort} onValueChange={(value) => onSortChange(value as "desc" | "asc")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Tổng mua giảm dần</SelectItem>
                                <SelectItem value="asc">Tổng mua tăng dần</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : sortedCustomers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu khách hàng trong khoảng thời gian đã chọn.</p>
                    ) : (
                        <div className="space-y-3">
                            {sortedCustomers.map((customer, index) => (
                                <div key={`${customer.userId ?? "guest"}-${customer.customerPhone ?? customer.customerName}-${index}`} className="flex flex-col gap-3 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">#{index + 1}</Badge>
                                            <p className="text-sm font-semibold">{customer.customerName}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{customer.customerPhone ? `SĐT: ${customer.customerPhone}` : "Không có SĐT"}</p>
                                        <p className="break-all text-xs text-muted-foreground">{customer.customerEmail ? `Email: ${customer.customerEmail}` : "Không có Email"}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 lg:w-auto lg:flex-nowrap lg:justify-end lg:gap-8">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Tổng mua</p>
                                            <p className="text-base font-semibold text-emerald-600">{Helper.formatCurrency(Number(customer.totalPurchase || 0))}</p>
                                            <p className="text-xs text-muted-foreground">{Helper.formatNumber(customer.orderCount || 0)} đơn hàng</p>
                                        </div>
                                        <Button className="w-full sm:w-auto" onClick={() => setSelectedCustomer(customer)}>Xem đơn hàng</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CustomerOrdersDialog customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
        </>
    );
}
