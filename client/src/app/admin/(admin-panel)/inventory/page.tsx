"use client";

import Link from "next/link";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes, Building2 } from "lucide-react";

export default function InventoryPage() {
    return (
        <AdminPageShell title="Kho hàng" description="Quản lý nhập hàng và nhà cung cấp">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Boxes className="h-5 w-5" />
                            Phiếu nhập
                        </CardTitle>
                        <CardDescription>Quản lý tạo mới, xác nhận và cập nhật phiếu nhập.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/imports">Mở trang nhập hàng</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Nhà cung cấp
                        </CardTitle>
                        <CardDescription>Quản lý thông tin và trạng thái nhà cung cấp.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/suppliers">Mở trang nhà cung cấp</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
