"use client";

import { VoucherApi } from "@/api/voucher.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";
import type { Voucher } from "@/types/voucher";

export default function VouchersPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchVouchers() {
            setIsLoading(true);
            const response = await VoucherApi.getAdminVouchers({ page: 1, size: 30, sort: "id:desc" });
            if (!mounted) return;
            setVouchers(response.data.data);
            setIsLoading(false);
        }

        void fetchVouchers();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <AdminPageShell title="Voucher" description="Quản lý toàn bộ chiến dịch khuyến mãi và mã giảm giá" requiredPermissions={["VIEW_ALL_VOUCHER"]}>
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách voucher</CardTitle>
                    <CardDescription>{vouchers.length} voucher gần nhất</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải dữ liệu voucher...
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {vouchers.map((voucher) => (
                                <div key={voucher.id} className="rounded-md border p-3">
                                    <div className="flex items-center gap-2 font-medium">
                                        <TicketPercent className="h-4 w-4" />
                                        {String(voucher.name ?? voucher.code ?? `Voucher #${voucher.id}`)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Mã: {String(voucher.code ?? "-")} | Trạng thái: {String(voucher.status ?? "-")}
                                    </p>
                                </div>
                            ))}
                            {vouchers.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu voucher.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
