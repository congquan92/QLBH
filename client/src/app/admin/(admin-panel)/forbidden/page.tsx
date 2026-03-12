"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert className="h-5 w-5" />
                        Không có quyền truy cập
                    </CardTitle>
                    <CardDescription>Bạn không có quyền truy cập trang này.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Vui lòng liên hệ quản trị viên để được cấp quyền phù hợp.</p>
                    <Button asChild>
                        <Link href="/admin">Quay lại trang quản trị</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
