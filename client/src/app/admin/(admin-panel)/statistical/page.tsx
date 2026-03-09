"use client";

import Link from "next/link";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileDown, ShoppingCart } from "lucide-react";

export default function StatisticalPage() {
    return (
        <AdminPageShell title="Thống kê" description="Tổng hợp báo cáo và xuất dữ liệu" requiredPermissions={["VIEW_STATISTICAL", "VIEW_EXPORT"]}>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Báo cáo đơn hàng
                        </CardTitle>
                        <CardDescription>Theo dõi đơn hàng và doanh thu theo thời gian.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/orders">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Mở trang đơn hàng
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileDown className="h-5 w-5" />
                            Xuất dữ liệu
                        </CardTitle>
                        <CardDescription>Thao tác xuất file theo nghiệp vụ hiện có trên hệ thống.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href="/admin/orders">Đi đến nguồn dữ liệu</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
