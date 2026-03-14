"use client";

import { FileUploadApi } from "@/api/admin/file-upload.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type MediaItem = {
    url: string;
    createdAt: string;
};

function extractUrl(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") return null;
    const data = payload as Record<string, unknown>;
    if (typeof data.url === "string") return data.url;
    if (data.data && typeof data.data === "object" && typeof (data.data as Record<string, unknown>).url === "string") {
        return String((data.data as Record<string, unknown>).url);
    }
    return null;
}

export default function ImagesPage() {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
    const [manualUrl, setManualUrl] = useState("");

    const total = useMemo(() => items.length, [items.length]);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);

        try {
            const uploaded: MediaItem[] = [];
            for (const file of Array.from(files)) {
                const res = await FileUploadApi.upload(file);
                const url = extractUrl(res);
                if (url) {
                    uploaded.push({ url, createdAt: new Date().toISOString() });
                }
            }
            setItems((prev) => [...uploaded, ...prev]);
            toast.success(`Đã upload ${uploaded.length} file`);
            e.target.value = "";
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload thất bại");
        } finally {
            setIsUploading(false);
        }
    }

    function addManualUrl() {
        const trimmed = manualUrl.trim();
        if (!trimmed) return;
        if (items.some((item) => item.url === trimmed)) {
            toast.error("URL đã tồn tại trong danh sách");
            return;
        }
        setItems((prev) => [{ url: trimmed, createdAt: new Date().toISOString() }, ...prev]);
        setManualUrl("");
    }

    async function deleteImage(url: string) {
        if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
        setDeletingUrl(url);
        try {
            await FileUploadApi.deleteFile(url);
            setItems((prev) => prev.filter((item) => item.url !== url));
            toast.success("Đã xóa ảnh");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Xóa ảnh thất bại");
        } finally {
            setDeletingUrl(null);
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hình ảnh</h1>
                <p className="text-muted-foreground">Upload và xóa media qua API file hiện có</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImagePlus className="h-5 w-5" />
                        Upload ảnh
                    </CardTitle>
                    <CardDescription>Hỗ trợ upload từng file hoặc nhiều file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label>Chọn file</Label>
                        <Input type="file" multiple onChange={(e) => void handleFileUpload(e)} disabled={isUploading} />
                    </div>
                    <div className="flex gap-2">
                        <Input placeholder="Dán URL ảnh có sẵn để quản lý" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} />
                        <Button type="button" variant="outline" onClick={addManualUrl}>
                            Thêm URL
                        </Button>
                    </div>
                    {isUploading && (
                        <div className="text-sm text-muted-foreground flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang upload...
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Thư viện ảnh ({total})</CardTitle>
                    <CardDescription>Quản lý media đã upload trong phiên làm việc</CardDescription>
                </CardHeader>
                <CardContent>
                    {items.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Chưa có ảnh nào.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {items.map((item) => {
                                const deleting = deletingUrl === item.url;
                                return (
                                    <div key={item.url} className="border rounded-lg p-3 space-y-2">
                                        <Image src={item.url} alt="media" width={640} height={320} className="h-40 w-full rounded object-cover bg-muted" unoptimized />
                                        <div className="text-xs text-muted-foreground break-all">{item.url}</div>
                                        <Button variant="destructive" size="sm" onClick={() => void deleteImage(item.url)} disabled={deleting}>
                                            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                            Xóa
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
