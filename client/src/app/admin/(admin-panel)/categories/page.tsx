"use client";

import { CategoryApi } from "@/api/category.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category } from "@/types/navbar";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            setIsLoading(true);
            const response = await CategoryApi.getAdminCategories({ page: 1, size: 50, sort: "id:desc" });
            if (!mounted) return;
            setCategories(response.data.data);
            setIsLoading(false);
        }

        void fetchData();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <AdminPageShell title="Danh mục" description="Quản lý cấu trúc danh mục và phân cấp sản phẩm">
            <Card>
                <CardHeader>
                    <CardTitle>Tất cả danh mục</CardTitle>
                    <CardDescription>{categories.length} danh mục</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải danh mục...
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category.id} className="rounded-md border p-3 flex items-center gap-2">
                                    <FolderTree className="h-4 w-4" />
                                    <span className="font-medium">{category.name}</span>
                                    <span className="text-xs text-muted-foreground">({category.childCategory?.length ?? 0} danh mục con)</span>
                                </div>
                            ))}
                            {categories.length === 0 && <p className="text-sm text-muted-foreground">Không có danh mục.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
