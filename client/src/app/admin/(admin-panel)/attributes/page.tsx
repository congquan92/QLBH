"use client";

import { ProductApi } from "@/api/product.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ProductDetail } from "@/types/product";

function parseIds(value: string): number[] {
    return value
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isFinite(v) && v > 0);
}

export default function AttributesPage() {
    const [productId, setProductId] = useState("");
    const [attributeIds, setAttributeIds] = useState("");
    const [attributeValueIds, setAttributeValueIds] = useState("");
    const [addVariantJson, setAddVariantJson] = useState("[]");
    const [updateVariantJson, setUpdateVariantJson] = useState("{}");
    const [isLoading, setIsLoading] = useState(false);
    const [detail, setDetail] = useState<ProductDetail | null>(null);

    async function loadDetail() {
        const id = Number(productId);
        if (!id) {
            toast.error("Vui lòng nhập Product ID hợp lệ");
            return;
        }
        setIsLoading(true);
        try {
            const res = await ProductApi.getAdminProductDetail(id);
            setDetail(res.data);
            toast.success("Đã tải thông tin sản phẩm");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải sản phẩm");
            setDetail(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteAttributes() {
        const id = Number(productId);
        const ids = parseIds(attributeIds);
        if (!id || ids.length === 0) {
            toast.error("Vui lòng nhập Product ID và danh sách Attribute ID");
            return;
        }
        setIsLoading(true);
        try {
            await ProductApi.deleteAttribute(id, { attributeIds: ids });
            toast.success("Đã xóa thuộc tính");
            await loadDetail();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Xóa thuộc tính thất bại");
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteAttributeValues() {
        const id = Number(productId);
        const ids = parseIds(attributeValueIds);
        if (!id || ids.length === 0) {
            toast.error("Vui lòng nhập Product ID và danh sách Attribute Value ID");
            return;
        }
        setIsLoading(true);
        try {
            await ProductApi.deleteAttributeValue(id, { attributeValueIds: ids });
            toast.success("Đã xóa giá trị thuộc tính");
            await loadDetail();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Xóa giá trị thuộc tính thất bại");
        } finally {
            setIsLoading(false);
        }
    }

    async function addVariants() {
        const id = Number(productId);
        if (!id) {
            toast.error("Vui lòng nhập Product ID");
            return;
        }

        setIsLoading(true);
        try {
            const payload = JSON.parse(addVariantJson) as Record<string, unknown>;
            await ProductApi.addVariants(id, payload);
            toast.success("Đã thêm variants");
            await loadDetail();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Thêm variants thất bại");
        } finally {
            setIsLoading(false);
        }
    }

    async function updateVariant() {
        const id = Number(productId);
        if (!id) {
            toast.error("Vui lòng nhập Product ID");
            return;
        }

        setIsLoading(true);
        try {
            const payload = JSON.parse(updateVariantJson) as Record<string, unknown>;
            await ProductApi.updateVariants(id, payload);
            toast.success("Đã cập nhật variant");
            await loadDetail();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Cập nhật variant thất bại");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Thuộc tính</h1>
                <p className="text-muted-foreground">Công cụ thao tác nhanh thuộc tính và biến thể theo Product ID</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Product Context
                    </CardTitle>
                    <CardDescription>Tải chi tiết sản phẩm để tham chiếu ID thuộc tính/giá trị</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input placeholder="Nhập Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
                        <Button onClick={() => void loadDetail()} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tải"}
                        </Button>
                    </div>
                    {detail && (
                        <div className="text-sm rounded border p-3 bg-muted/30">
                            <div className="font-medium">{detail.name}</div>
                            <div className="text-muted-foreground">ID: {detail.id}</div>
                            <div className="mt-2">Attributes: {(detail.attributes ?? []).map((a) => `${a.id}:${a.name}`).join(" | ") || "Khong co"}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Xóa thuộc tính</CardTitle>
                    <CardDescription>Nhập danh sách ID, cách nhau bằng dấu phẩy. Ví dụ: 1,2,3</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label>Attribute IDs</Label>
                    <Input value={attributeIds} onChange={(e) => setAttributeIds(e.target.value)} placeholder="1,2,3" />
                    <Button variant="destructive" onClick={() => void deleteAttributes()} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Xóa thuộc tính
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Xóa giá trị thuộc tính</CardTitle>
                    <CardDescription>Nhập danh sách Attribute Value ID, ví dụ: 10,11,12</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label>Attribute Value IDs</Label>
                    <Input value={attributeValueIds} onChange={(e) => setAttributeValueIds(e.target.value)} placeholder="10,11,12" />
                    <Button variant="destructive" onClick={() => void deleteAttributeValues()} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Xóa giá trị thuộc tính
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Thêm variants</CardTitle>
                    <CardDescription>Dán JSON payload theo backend `/product/{id}/variants/add`</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <textarea className="w-full min-h-40 rounded-md border bg-background p-3 text-sm" value={addVariantJson} onChange={(e) => setAddVariantJson(e.target.value)} />
                    <Button onClick={() => void addVariants()} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Thêm variants
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cập nhật variant</CardTitle>
                    <CardDescription>Dán JSON payload theo backend `/product/{id}/variants/update`</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <textarea className="w-full min-h-40 rounded-md border bg-background p-3 text-sm" value={updateVariantJson} onChange={(e) => setUpdateVariantJson(e.target.value)} />
                    <Button onClick={() => void updateVariant()} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Cập nhật variant
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
