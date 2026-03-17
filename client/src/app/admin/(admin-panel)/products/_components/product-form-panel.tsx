import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryOption, ProductFormValues, ProductImageItem, SupplierOption } from "./product-types";
import { ImagePlus, Loader2, Save, Trash2, X } from "lucide-react";

type ProductFormPanelProps = {
    open: boolean;
    isSaving: boolean;
    isLoadingDetail: boolean;
    form: ProductFormValues;
    categoryOptions: CategoryOption[];
    supplierOptions: SupplierOption[];
    coverImage: ProductImageItem | null;
    galleryImages: ProductImageItem[];
    onChange: <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => void;
    onSelectCover: (file: File | null) => void;
    onSelectGallery: (files: FileList | null) => void;
    onRemoveCover: () => void;
    onRemoveGalleryImage: (key: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
};

function ImagePreviewCard({ item, onRemove }: { item: ProductImageItem; onRemove?: () => void }) {
    return (
        <div className="relative overflow-hidden rounded-xl border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.previewUrl || item.url} alt={item.fileName} className="h-32 w-full object-cover" />
            <div className="space-y-1 p-3">
                <p className="truncate text-sm font-medium">{item.fileName}</p>
                <p className="text-xs text-muted-foreground">{item.isUploading ? "Đang upload..." : "Sẵn sàng"}</p>
            </div>
            {item.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            )}
            {onRemove && (
                <Button type="button" variant="secondary" size="icon" className="absolute right-2 top-2 h-8 w-8" onClick={onRemove}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

export function ProductFormPanel({
    open,
    isSaving,
    isLoadingDetail,
    form,
    categoryOptions,
    supplierOptions,
    coverImage,
    galleryImages,
    onChange,
    onSelectCover,
    onSelectGallery,
    onRemoveCover,
    onRemoveGalleryImage,
    onCancel,
    onSubmit,
}: ProductFormPanelProps) {
    if (!open) return null;

    const isUploadingMedia = Boolean(coverImage?.isUploading) || galleryImages.some((item) => item.isUploading);

    return (
        <Card className="border-dashed">
            <CardHeader className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle>{form.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</CardTitle>
                        <CardDescription>Điền đúng phân loại, nhà cung cấp và ảnh trước khi lưu lên hệ thống.</CardDescription>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoadingDetail ? (
                    <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải chi tiết sản phẩm...
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="product-name">Tên sản phẩm</Label>
                                <Input id="product-name" value={form.name} onChange={(event) => onChange("name", event.target.value)} placeholder="Ví dụ: Bàn học gỗ sồi" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-supplier">Nhà cung cấp</Label>
                                <Select value={form.supplierId} onValueChange={(value) => onChange("supplierId", value)}>
                                    <SelectTrigger id="product-supplier">
                                        <SelectValue placeholder="Chọn nhà cung cấp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supplierOptions.map((supplier) => (
                                            <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-list-price">Giá niêm yết</Label>
                                <Input id="product-list-price" type="number" min="0" value={form.listPrice} onChange={(event) => onChange("listPrice", event.target.value)} placeholder="Nhập giá niêm yết" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-sale-price">Giá bán</Label>
                                <Input id="product-sale-price" type="number" min="0" value={form.salePrice} onChange={(event) => onChange("salePrice", event.target.value)} placeholder="Nhập giá bán" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="product-category">Phân loại</Label>
                                <Select value={form.categoryId} onValueChange={(value) => onChange("categoryId", value)}>
                                    <SelectTrigger id="product-category">
                                        <SelectValue placeholder="Chọn phân loại" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-description">Mô tả</Label>
                            <textarea
                                id="product-description"
                                value={form.description}
                                onChange={(event) => onChange("description", event.target.value)}
                                placeholder="Mô tả ngắn gọn về sản phẩm"
                                className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>

                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                            <div className="space-y-3 rounded-xl border p-4">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Ảnh bìa</h3>
                                    <p className="text-sm text-muted-foreground">Ảnh này sẽ dùng làm ảnh chính ngoài storefront.</p>
                                </div>
                                <Input type="file" accept="image/*" onChange={(event) => onSelectCover(event.target.files?.[0] ?? null)} />
                                {coverImage ? (
                                    <ImagePreviewCard item={coverImage} onRemove={onRemoveCover} />
                                ) : (
                                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                                        <ImagePlus className="mr-2 h-4 w-4" />
                                        Chưa có ảnh bìa
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 rounded-xl border p-4">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Ảnh sản phẩm</h3>
                                    <p className="text-sm text-muted-foreground">Có thể chọn nhiều ảnh. Nếu chưa có ảnh phụ, hệ thống sẽ dùng lại ảnh bìa.</p>
                                </div>
                                <Input type="file" accept="image/*" multiple onChange={(event) => onSelectGallery(event.target.files)} />
                                {galleryImages.length > 0 ? (
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {galleryImages.map((item) => (
                                            <ImagePreviewCard key={item.key} item={item} onRemove={() => onRemoveGalleryImage(item.key)} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                                        <ImagePlus className="mr-2 h-4 w-4" />
                                        Chưa có ảnh thư viện
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={onSubmit} disabled={isSaving || isUploadingMedia}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {form.id ? "Lưu thay đổi" : "Tạo sản phẩm"}
                            </Button>
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Hủy
                            </Button>
                            {isUploadingMedia && <p className="self-center text-sm text-muted-foreground">Đợi upload ảnh hoàn tất trước khi lưu.</p>}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
