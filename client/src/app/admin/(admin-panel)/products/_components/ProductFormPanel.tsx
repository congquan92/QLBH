import { FileUploadApi } from "@/api/admin/file-upload.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Boxes, Check, ImagePlus, Layers3, Loader2, PackageCheck, Plus, Save, Trash2, Truck, Upload } from "lucide-react";
import { useRef, useState } from "react";
import type { CategoryOption, ProductAttributeInput, ProductAttributeValueInput, ProductFormValues, ProductImageItem, ProductVariantInput, SupplierOption } from "./product-types";
import { toast } from "sonner";
import { RichTextEditor } from "./rich-text-editor";

type ProductFormPanelProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
    onAttributesChange: (next: ProductAttributeInput[]) => void;
    onVariantsChange: (next: ProductVariantInput[]) => void;
    onCancel: () => void;
    onSubmit: () => void;
    onUploadDescriptionImage: (file: File) => Promise<string>;
};

function createKey() {
    return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function ImagePreviewCard({ item, onRemove }: { item: ProductImageItem; onRemove?: () => void }) {
    return (
        <div className="relative overflow-hidden rounded-xl border bg-muted/30">
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

function VideoInputField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File | undefined) {
        if (!file) return;
        setUploading(true);
        try {
            const res = await FileUploadApi.upload(file);
            onChange(res.url);
        } catch {
            // ignore
            toast.error("Upload video thất bại");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="space-y-2">
            {!value && (
                <div className="flex items-center justify-center w-full">
                    <Button type="button" variant="outline" className="w-full border-dashed h-24 flex flex-col gap-2" disabled={uploading} onClick={() => fileRef.current?.click()}>
                        {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <>
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs font-normal">Tải video lên</span>
                            </>
                        )}
                    </Button>
                </div>
            )}
            {value && (
                <div className="relative group overflow-hidden rounded-xl border bg-black">
                    <video src={value} controls className="h-48 w-full object-contain" />
                    <Button type="button" variant="outline" size="icon" className="absolute top-2 right-2 size-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" onClick={() => onChange("")}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => void handleFile(e.target.files?.[0])} />
        </div>
    );
}

function AttributeValueChip({
    item,
    onValueChange,
    onImageChange,
    onRemove,
}: {
    item: ProductAttributeValueInput;
    onValueChange: (v: string) => void;
    onImageChange: (payload: { image: string; imageDeleted?: boolean; imageFile?: File; imagePreviewUrl?: string }) => void;
    onRemove: () => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);

    async function handleFile(file: File | undefined) {
        if (!file) {
            return;
        }

        setIsImageLoading(true);

        try {
            const oldImageUrl = String(item.image ?? "").trim();
            if (oldImageUrl) {
                await FileUploadApi.deleteFile(oldImageUrl);
            }

            if (item.imagePreviewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(item.imagePreviewUrl);
            }

            const response = await FileUploadApi.upload(file);
            const uploadedUrl = String(response.url ?? "").trim();

            if (!uploadedUrl) {
                throw new Error("Upload ảnh phân loại thất bại.");
            }

            onImageChange({ image: uploadedUrl, imageDeleted: false, imageFile: undefined, imagePreviewUrl: undefined });
        } catch {
            toast.error("Không thể cập nhật ảnh phân loại. Vui lòng thử lại.");
        } finally {
            setIsImageLoading(false);
        }
    }

    async function clearImage() {
        setIsImageLoading(true);

        try {
            const oldImageUrl = String(item.image ?? "").trim();
            if (oldImageUrl) {
                await FileUploadApi.deleteFile(oldImageUrl);
            }

            if (item.imagePreviewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(item.imagePreviewUrl);
            }

            onImageChange({ image: "", imageDeleted: true, imageFile: undefined, imagePreviewUrl: undefined });
        } catch {
            toast.error("Không thể xoá ảnh phân loại. Vui lòng thử lại.");
        } finally {
            setIsImageLoading(false);
        }
    }

    const displayImage = item.imagePreviewUrl || item.image;

    return (
        <div className="group relative flex w-24 shrink-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm transition-shadow hover:shadow-md">
            <div className="relative flex h-14 items-center justify-center bg-muted/40 cursor-pointer" onClick={() => !isImageLoading && fileRef.current?.click()} title="Click để chọn ảnh">
                {displayImage ? (
                    <img
                        src={displayImage}
                        alt={item.value}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                    />
                ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground/50" />
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="h-4 w-4 text-white" />
                </div>
                {isImageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                ) : null}
                {displayImage ? (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            void clearImage();
                        }}
                        disabled={isImageLoading}
                        className="absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                        title="Xoá ảnh"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                ) : null}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleFile(e.target.files?.[0])} />
            </div>

            <div className="flex-1 px-1.5 py-1.5">
                <input
                    value={item.value}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder="Tên..."
                    className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-center text-xs font-medium outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-orange-300 focus:bg-orange-50"
                />
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                title="Xoá giá trị"
            >
                <Trash2 className="h-3 w-3" />
            </button>
        </div>
    );
}

export function ProductFormPanel({
    open,
    onOpenChange,
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
    onAttributesChange,
    onVariantsChange,
    onCancel,
    onSubmit,
    onUploadDescriptionImage,
}: ProductFormPanelProps) {
    const [bulkPrice, setBulkPrice] = useState("");
    const [bulkWeight, setBulkWeight] = useState("");
    const [bulkLength, setBulkLength] = useState("");
    const [bulkWidth, setBulkWidth] = useState("");
    const [bulkHeight, setBulkHeight] = useState("");

    const isUploadingMedia = Boolean(coverImage?.isUploading) || galleryImages.some((item) => item.isUploading);
    const hasVariantAttributes = form.attributes.some((attribute) => attribute.name.trim() && attribute.values.some((value) => value.value.trim()));

    function addAttribute() {
        onAttributesChange([
            ...form.attributes,
            {
                key: createKey(),
                name: "",
                values: [{ key: createKey(), value: "", image: "", imageDeleted: false }],
            },
        ]);
    }

    function removeAttribute(attributeKey: string) {
        onAttributesChange(form.attributes.filter((attribute) => attribute.key !== attributeKey));
    }

    function updateAttributeName(attributeKey: string, value: string) {
        onAttributesChange(form.attributes.map((attribute) => (attribute.key === attributeKey ? { ...attribute, name: value } : attribute)));
    }

    function addAttributeValue(attributeKey: string) {
        onAttributesChange(
            form.attributes.map((attribute) =>
                attribute.key === attributeKey
                    ? {
                          ...attribute,
                          values: [...attribute.values, { key: createKey(), value: "", image: "", imageDeleted: false }],
                      }
                    : attribute,
            ),
        );
    }

    function updateAttributeValue(
        attributeKey: string,
        valueKey: string,
        patch: Partial<Pick<ProductAttributeValueInput, "value" | "image" | "imageFile" | "imagePreviewUrl">>,
    ) {
        onAttributesChange(
            form.attributes.map((attribute) =>
                attribute.key === attributeKey
                    ? {
                          ...attribute,
                          values: attribute.values.map((item) => (item.key === valueKey ? { ...item, ...patch } : item)),
                      }
                    : attribute,
            ),
        );
    }

    function removeAttributeValue(attributeKey: string, valueKey: string) {
        onAttributesChange(
            form.attributes.map((attribute) =>
                attribute.key === attributeKey
                    ? {
                          ...attribute,
                          values: attribute.values.filter((item) => item.key !== valueKey),
                      }
                    : attribute,
            ),
        );
    }

    function removeVariant(variantKey: string) {
        onVariantsChange(form.productVariant.filter((variant) => variant.key !== variantKey));
    }

    function updateVariantField(variantKey: string, field: "sku" | "price" | "weight" | "length" | "width" | "height", value: string) {
        onVariantsChange(form.productVariant.map((variant) => (variant.key === variantKey ? { ...variant, [field]: value } : variant)));
    }

    function applyBulkToVariants() {
        if (form.productVariant.length === 0) {
            return;
        }

        onVariantsChange(
            form.productVariant.map((variant) => ({
                ...variant,
                price: bulkPrice.trim() ? bulkPrice : variant.price,
                weight: bulkWeight.trim() ? bulkWeight : variant.weight,
                length: bulkLength.trim() ? bulkLength : variant.length,
                width: bulkWidth.trim() ? bulkWidth : variant.width,
                height: bulkHeight.trim() ? bulkHeight : variant.height,
            })),
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[94vh] overflow-y-auto p-0 sm:max-w-[98vw] xl:max-w-360">
                <DialogHeader>
                    <div className="sticky top-0 z-20 border-b bg-background px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <DialogTitle className="text-lg font-semibold">{form.id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                                <DialogDescription>Biểu mẫu gọn theo kiểu sàn TMĐT.</DialogDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="rounded-md px-2 py-1">
                                    <PackageCheck className="mr-1 h-3.5 w-3.5" />
                                    {form.productVariant.length} biến thể
                                </Badge>
                                <Badge variant="secondary" className="rounded-md px-2 py-1">
                                    <ImagePlus className="mr-1 h-3.5 w-3.5" />
                                    {galleryImages.length + (coverImage ? 1 : 0)} media
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                {isLoadingDetail ? (
                    <div className="flex min-h-56 items-center justify-center px-5 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải chi tiết sản phẩm...
                    </div>
                ) : (
                    <div className="space-y-4 px-5 pb-24 pt-3">
                        <section className="rounded-lg border bg-card p-4">
                            <div className="mb-3 flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-orange-700">
                                <Boxes className="h-4 w-4 text-orange-500" />
                                <h3 className="font-semibold">Thông tin sản phẩm</h3>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-2 xl:col-span-2">
                                    <Label htmlFor="product-name">Tên sản phẩm</Label>
                                    <Input id="product-name" value={form.name} onChange={(event) => onChange("name", event.target.value)} placeholder="Ví dụ: Dép Nam ICONDENIM Drift Slides" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-supplier">Nhà cung cấp</Label>
                                    <Select value={form.supplierId} onValueChange={(value) => onChange("supplierId", value)}>
                                        <SelectTrigger id="product-supplier">
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="max-h-50 overflow-y-auto">
                                            {supplierOptions.map((supplier) => (
                                                <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-category">Danh mục</Label>
                                    <Select value={form.categoryId} onValueChange={(value) => onChange("categoryId", value)}>
                                        <SelectTrigger id="product-category">
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="max-h-70 overflow-y-auto">
                                            {categoryOptions.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-list-price">Giá niêm yết</Label>
                                    <Input id="product-list-price" type="number" min="0" value={form.listPrice} onChange={(event) => onChange("listPrice", event.target.value)} placeholder="VD: 329000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-sale-price">Giá bán</Label>
                                    <Input id="product-sale-price" type="number" min="0" value={form.salePrice} onChange={(event) => onChange("salePrice", event.target.value)} placeholder="VD: 299000" />
                                </div>
                                <div className="space-y-2 md:col-span-2 xl:col-span-2">
                                    <Label htmlFor="product-video">Video sản phẩm (URL)</Label>
                                    <VideoInputField value={form.video} onChange={(url) => onChange("video", url)} />
                                </div>
                            </div>

                            <div className="mt-3 space-y-2">
                                <Label htmlFor="product-description">Mô tả</Label>
                                <RichTextEditor
                                    value={form.description}
                                    onChange={(html) => onChange("description", html)}
                                    onUploadImage={onUploadDescriptionImage}
                                    placeholder="Mô tả chi tiết sản phẩm. Có thể chèn ảnh, căn lề, in đậm, danh sách..."
                                />
                            </div>

                            {hasVariantAttributes ? null : (
                                <>
                                    <Separator className="my-3" />

                                    <div className="space-y-3 rounded-md border bg-background p-3">
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-orange-500" />
                                            <h4 className="font-medium">Thông số vận chuyển mặc định</h4>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="default-weight">Cân nặng (gram)</Label>
                                                <Input id="default-weight" type="number" min="0" step="1" value={form.weight} onChange={(event) => onChange("weight", event.target.value)} placeholder="350" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="default-length">Dài (cm)</Label>
                                                <Input id="default-length" type="number" min="0" step="0.1" value={form.length} onChange={(event) => onChange("length", event.target.value)} placeholder="25" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="default-width">Rộng (cm)</Label>
                                                <Input id="default-width" type="number" min="0" step="0.1" value={form.width} onChange={(event) => onChange("width", event.target.value)} placeholder="10" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="default-height">Cao (cm)</Label>
                                                <Input id="default-height" type="number" min="0" step="0.1" value={form.height} onChange={(event) => onChange("height", event.target.value)} placeholder="4" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>

                        <section className="grid gap-4 rounded-lg border bg-card p-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                            <div className="space-y-3 rounded-md border bg-background p-3">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Ảnh bìa</h3>
                                    <p className="text-xs text-muted-foreground">Ảnh đại diện chính của sản phẩm.</p>
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

                            <div className="space-y-3 rounded-md border bg-background p-3">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Ảnh sản phẩm</h3>
                                    <p className="text-xs text-muted-foreground">Thêm nhiều ảnh để hiển thị chi tiết.</p>
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
                        </section>

                        <section className="space-y-3 rounded-lg border bg-card p-4">
                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-orange-700">
                                    <Layers3 className="h-4 w-4 text-orange-500" />
                                    <h3 className="font-semibold">Thuộc tính phân loại</h3>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm thuộc tính
                                </Button>
                            </div>

                            {form.attributes.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    <Layers3 className="mx-auto mb-2 h-8 w-8 opacity-30" />
                                    Chưa có thuộc tính. Ví dụ: Màu sắc, Kích thước.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {form.attributes.map((attribute, index) => (
                                        <div key={attribute.key} className="rounded-lg border bg-background overflow-hidden">
                                            {/* Attribute row header */}
                                            <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-2.5">
                                                <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">Phân loại {index + 1}</span>
                                                <Input
                                                    value={attribute.name}
                                                    onChange={(event) => updateAttributeName(attribute.key, event.target.value)}
                                                    placeholder="Ví dụ: Màu sắc, Kích thước..."
                                                    className="h-8 flex-1 border-dashed bg-transparent text-sm font-medium focus-visible:border-solid focus-visible:bg-background"
                                                />
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeAttribute(attribute.key)} title="Xoá thuộc tính">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>

                                            {/* Value chips matrix */}
                                            <div className="flex flex-wrap gap-3 p-4">
                                                {attribute.values.map((item) => (
                                                    <AttributeValueChip
                                                        key={item.key}
                                                        item={item}
                                                        onValueChange={(v) => updateAttributeValue(attribute.key, item.key, { value: v })}
                                                        onImageChange={(payload) => updateAttributeValue(attribute.key, item.key, payload)}
                                                        onRemove={() => removeAttributeValue(attribute.key, item.key)}
                                                    />
                                                ))}

                                                {/* Add value chip */}
                                                <button
                                                    type="button"
                                                    onClick={() => addAttributeValue(attribute.key)}
                                                    className="flex h-22 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 text-xs text-muted-foreground transition-colors hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    Thêm giá trị
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="space-y-3 rounded-lg border bg-card p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                    <h3 className="font-semibold">Biến thể sản phẩm</h3>
                                    <p className="text-xs text-muted-foreground">Hiển thị theo bảng để nhập nhanh giống sàn TMĐT.</p>
                                </div>
                                {hasVariantAttributes ? (
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">Bảng tự động đồng bộ theo thuộc tính</Badge>
                                    </div>
                                ) : null}
                            </div>

                            {hasVariantAttributes ? (
                                <>
                                    <div className="rounded-md border border-orange-200 bg-orange-50/60 p-3">
                                        <p className="mb-2 text-xs font-medium text-orange-700">Thiết lập nhanh cho tất cả biến thể (kiểu Shopee)</p>
                                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
                                            <Input type="number" min="0" placeholder="Giá" value={bulkPrice} onChange={(event) => setBulkPrice(event.target.value)} />
                                            <Input type="number" min="0" step="1" placeholder="Nặng (g)" value={bulkWeight} onChange={(event) => setBulkWeight(event.target.value)} />
                                            <Input type="number" min="0" step="0.1" placeholder="Dài" value={bulkLength} onChange={(event) => setBulkLength(event.target.value)} />
                                            <Input type="number" min="0" step="0.1" placeholder="Rộng" value={bulkWidth} onChange={(event) => setBulkWidth(event.target.value)} />
                                            <Input type="number" min="0" step="0.1" placeholder="Cao" value={bulkHeight} onChange={(event) => setBulkHeight(event.target.value)} />
                                            <Button type="button" variant="outline" onClick={applyBulkToVariants}>
                                                <Check className="mr-2 h-4 w-4" />
                                                Áp dụng
                                            </Button>
                                        </div>
                                    </div>

                                    {form.productVariant.length === 0 ? (
                                        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Chưa có biến thể. Nhấn &quot;Tạo từ thuộc tính&quot; để sinh bảng biến thể.</div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-md border">
                                            <table className="min-w-300 text-sm">
                                                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-medium">#</th>
                                                        <th className="px-3 py-2 text-left font-medium">Thuộc tính biến thể</th>
                                                        <th className="px-3 py-2 text-left font-medium">SKU</th>
                                                        <th className="px-3 py-2 text-left font-medium">Giá</th>
                                                        <th className="px-3 py-2 text-left font-medium">Số lượng tồn</th>
                                                        <th className="px-3 py-2 text-left font-medium">Nặng (g)</th>
                                                        <th className="px-3 py-2 text-left font-medium">Dài</th>
                                                        <th className="px-3 py-2 text-left font-medium">Rộng</th>
                                                        <th className="px-3 py-2 text-left font-medium">Cao</th>
                                                        <th className="px-3 py-2 text-right font-medium">Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {form.productVariant.map((variant, variantIndex) => (
                                                        <tr key={variant.key} className="border-t align-top">
                                                            <td className="px-3 py-2 text-xs text-muted-foreground">{variantIndex + 1}</td>
                                                            <td className="px-3 py-2">
                                                                <div className="flex min-h-9 flex-wrap items-center gap-1.5">
                                                                    {variant.variantAttributes.length > 0 ? (
                                                                        variant.variantAttributes.map((item) => (
                                                                            <Badge key={item.key} variant="secondary">
                                                                                {item.attribute}: {item.value}
                                                                            </Badge>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground">Không có</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input
                                                                    value={variant.sku}
                                                                    readOnly={Boolean(form.id)}
                                                                    onChange={(event) => updateVariantField(variant.key, "sku", event.target.value)}
                                                                    placeholder={form.id ? "SKU được tạo tự động" : "DRIFT-BLACK-S"}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input type="number" min="0" value={variant.price} onChange={(event) => updateVariantField(variant.key, "price", event.target.value)} placeholder="329000" />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input type="number" min="0" value={variant.quantity || "0"} readOnly disabled title="Số lượng tồn kho hiện tại của biến thể" />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input type="number" min="0" step="1" value={variant.weight} onChange={(event) => updateVariantField(variant.key, "weight", event.target.value)} placeholder="350" />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input type="number" min="0" step="0.1" value={variant.length} onChange={(event) => updateVariantField(variant.key, "length", event.target.value)} placeholder="25" />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input type="number" min="0" step="0.1" value={variant.width} onChange={(event) => updateVariantField(variant.key, "width", event.target.value)} placeholder="10" />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input type="number" min="0" step="0.1" value={variant.height} onChange={(event) => updateVariantField(variant.key, "height", event.target.value)} placeholder="4" />
                                                            </td>
                                                            <td className="px-3 py-2 text-right">
                                                                <Button type="button" variant="outline" size="sm" onClick={() => removeVariant(variant.key)}>
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Xoá
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Bảng biến thể chỉ hiển thị khi đã có thuộc tính phân loại hợp lệ (ví dụ: Màu sắc, Kích thước).</div>
                            )}
                        </section>

                        <div className="sticky bottom-0 z-30 -mx-5 border-t bg-background/95 px-5 py-3 backdrop-blur">
                            <div className="mx-auto flex max-w-360 flex-wrap items-center justify-between gap-3">
                                {isUploadingMedia ? <p className="text-xs text-muted-foreground">Đang upload media, vui lòng đợi trước khi lưu.</p> : null}
                                <div className="flex flex-wrap gap-2 ml-auto">
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        Hủy
                                    </Button>
                                    <Button type="button" onClick={onSubmit} disabled={isSaving || isUploadingMedia}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        {form.id ? "Lưu thay đổi" : "Tạo sản phẩm"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
