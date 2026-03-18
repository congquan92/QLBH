"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { FileUploadApi } from "@/api/admin/file-upload.api";
import { CategoryApi } from "@/api/category.api";
import { ProductApi } from "@/api/product.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Helper } from "@/lib/helper";
import type { Supplier } from "@/types/admin-crud";
import type { Category, CategoryChild } from "@/types/navbar";
import type { Product, ProductDetail } from "@/types/product";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteProductDialog } from "./_components/DeleteProductDialog";
import { ProductFormPanel } from "./_components/ProductFormPanel";
import { ProductPageHeader } from "./_components/ProductPageHeader";
import { ProductTable } from "./_components/ProductTable";
import type { CategoryOption, ProductAttributeInput, ProductFormValues, ProductImageItem, ProductVariantInput, SupplierOption } from "./_components/product-types";

const emptyForm: ProductFormValues = {
    name: "",
    description: "",
    listPrice: "",
    salePrice: "",
    categoryId: "",
    supplierId: "",
    video: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    coverImage: "",
    imageProduct: [],
    attributes: [],
    productVariant: [],
};

function createKey() {
    return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function createImageItem(url: string, fileName?: string): ProductImageItem {
    return {
        key: createKey(),
        url,
        previewUrl: url,
        fileName: fileName ?? url.split("/").pop() ?? "image",
        isUploading: false,
    };
}

function createLocalImageItem(file: File): ProductImageItem {
    return {
        key: createKey(),
        url: "",
        previewUrl: URL.createObjectURL(file),
        fileName: file.name,
        isUploading: false,
        file,
    };
}

function flattenCategories(categories: Category[]): CategoryOption[] {
    const result: CategoryOption[] = [];

    function walk(nodes: Array<Category | CategoryChild>) {
        for (const node of nodes) {
            result.push({
                id: node.id,
                name: node.name,
                label: node.name,
                status: String(node.status ?? "ACTIVE"),
            });

            if (node.childCategory?.length) {
                walk(node.childCategory);
            }
        }
    }

    walk(categories);
    return result;
}

function normalizeSuppliers(items: Supplier[]): SupplierOption[] {
    return items
        .filter((supplier) => String(supplier.status ?? "ACTIVE") !== "DISABLED")
        .map((supplier) => ({
            id: supplier.id,
            name: String(supplier.name ?? `Supplier #${supplier.id}`),
            status: String(supplier.status ?? "ACTIVE"),
        }));
}

function createFormFromDetail(detail: ProductDetail): ProductFormValues {
    const mappedAttributes = (detail.attributes ?? []).map((attribute) => ({
        key: createKey(),
        id: attribute.id,
        name: String(attribute.name ?? ""),
        values: (attribute.attributeValue ?? []).map((item) => ({
            key: createKey(),
            id: item.id,
            value: String(item.value ?? ""),
            image: String(item.image ?? item.urlImage ?? item.url_image ?? ""),
        })),
    }));

    const hasClassificationAttributes = mappedAttributes.some((attribute) => attribute.name.trim() && attribute.values.some((item) => item.value.trim()));

    const mappedVariants = (detail.productVariant ?? []).map((variant) => ({
        key: createKey(),
        id: variant.id,
        sku: String(variant.sku ?? ""),
        price: String(variant.price ?? ""),
        weight: String(variant.weight ?? ""),
        length: String(variant.length ?? ""),
        width: String(variant.width ?? ""),
        height: String(variant.height ?? ""),
        variantAttributes: (variant.variantAttributes ?? []).map((item) => ({
            key: createKey(),
            attribute: String(item.attribute ?? ""),
            value: String(item.value ?? ""),
        })),
    }));

    const defaultVariant = detail.productVariant?.[0];

    return {
        id: detail.id,
        name: String(detail.name ?? ""),
        description: String(detail.description ?? ""),
        listPrice: String(detail.listPrice ?? ""),
        salePrice: String(detail.salePrice ?? ""),
        categoryId: String(detail.categoryId ?? ""),
        supplierId: String(detail.supplierId ?? ""),
        video: String(detail.video ?? ""),
        weight: hasClassificationAttributes ? "" : String(defaultVariant?.weight ?? ""),
        length: hasClassificationAttributes ? "" : String(defaultVariant?.length ?? ""),
        width: hasClassificationAttributes ? "" : String(defaultVariant?.width ?? ""),
        height: hasClassificationAttributes ? "" : String(defaultVariant?.height ?? ""),
        coverImage: String(detail.coverImage ?? ""),
        imageProduct: Array.isArray(detail.imageProduct) ? detail.imageProduct.filter(Boolean) : [],
        attributes: mappedAttributes,
        productVariant: hasClassificationAttributes ? mappedVariants : [],
    };
}

function buildAttributesPayloadForCreate(form: ProductFormValues) {
    const map = new Map<string, Map<string, string>>();

    for (const attribute of form.attributes) {
        const name = attribute.name.trim();
        if (!name) continue;

        if (!map.has(name)) {
            map.set(name, new Map());
        }

        for (const value of attribute.values) {
            const cleaned = value.value.trim();
            const image = value.image.trim();
            if (cleaned) {
                map.get(name)?.set(cleaned, image);
            }
        }
    }

    for (const variant of form.productVariant) {
        for (const item of variant.variantAttributes) {
            const name = item.attribute.trim();
            const value = item.value.trim();
            if (!name || !value) continue;

            if (!map.has(name)) {
                map.set(name, new Map());
            }
            if (!map.get(name)?.has(value)) {
                map.get(name)?.set(value, "");
            }
        }
    }

    return Array.from(map.entries()).map(([name, valuesMap]) => ({
        name,
        attributeValue: Array.from(valuesMap.entries()).map(([value, image]) => ({
            value,
            ...(image ? { image } : {}),
        })),
    }));
}

function buildAttributesPayloadForUpdate(form: ProductFormValues) {
    return form.attributes
        .map((attribute) => ({
            ...(attribute.id ? { id: attribute.id } : {}),
            name: attribute.name.trim(),
            attributeValue: attribute.values
                .map((item) => ({
                    ...(item.id ? { id: item.id } : {}),
                    value: item.value.trim(),
                    ...(item.image.trim() ? { image: item.image.trim() } : {}),
                }))
                .filter((item) => item.value),
        }))
        .filter((attribute) => attribute.name && attribute.attributeValue.length > 0);
}

function buildVariantCombinations(attributes: ProductAttributeInput[]) {
    const source = attributes
        .map((attribute) => ({
            name: attribute.name.trim(),
            values: attribute.values.map((item) => item.value.trim()).filter(Boolean),
        }))
        .filter((attribute) => attribute.name && attribute.values.length > 0);

    if (source.length === 0) {
        return [] as Array<Array<{ attribute: string; value: string }>>;
    }

    const combinations: Array<Array<{ attribute: string; value: string }>> = [];

    function backtrack(index: number, current: Array<{ attribute: string; value: string }>) {
        if (index === source.length) {
            combinations.push([...current]);
            return;
        }

        const attribute = source[index];
        for (const value of attribute.values) {
            current.push({ attribute: attribute.name, value });
            backtrack(index + 1, current);
            current.pop();
        }
    }

    backtrack(0, []);
    return combinations;
}

function toVariantSignature(items: Array<{ attribute: string; value: string }>) {
    return items
        .map((item) => `${item.attribute.trim().toLowerCase()}::${item.value.trim().toLowerCase()}`)
        .sort()
        .join("|");
}

function buildVariantsPayload(form: ProductFormValues) {
    return form.productVariant
        .map((variant) => ({
            sku: variant.sku.trim() || undefined,
            price: Number(variant.price),
            weight: Number(variant.weight),
            length: Number(variant.length),
            width: Number(variant.width),
            height: Number(variant.height),
            variantAttributes: variant.variantAttributes
                .map((item) => ({
                    attribute: item.attribute.trim(),
                    value: item.value.trim(),
                }))
                .filter((item) => item.attribute && item.value),
        }))
        .filter(
            (variant) =>
                !Number.isNaN(variant.price) &&
                variant.price > 0 &&
                !Number.isNaN(variant.weight) &&
                variant.weight > 0 &&
                !Number.isNaN(variant.length) &&
                variant.length > 0 &&
                !Number.isNaN(variant.width) &&
                variant.width > 0 &&
                !Number.isNaN(variant.height) &&
                variant.height > 0 &&
                variant.variantAttributes.length > 0,
        );
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<ProductFormValues>(emptyForm);
    const [coverImage, setCoverImage] = useState<ProductImageItem | null>(null);
    const [galleryImages, setGalleryImages] = useState<ProductImageItem[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [originalAttributeIds, setOriginalAttributeIds] = useState<number[]>([]);
    const [originalAttributeValuePairs, setOriginalAttributeValuePairs] = useState<Array<{ id: number; attributeId: number }>>([]);

    useEffect(() => {
        return () => {
            if (coverImage?.previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(coverImage.previewUrl);
            }

            galleryImages.forEach((item) => {
                if (item.previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [coverImage, galleryImages]);

    useEffect(() => {
        async function bootstrap() {
            setIsLoading(true);
            try {
                const [categoryRes, supplierRes, productRes] = await Promise.all([CategoryApi.getAdminCategories({ page: 1, size: 300 }), AdminCrudApi.getSuppliers({ page: 1, size: 200, sort: "id:desc" }), ProductApi.getAdminProducts(1, 200)]);

                setCategories(flattenCategories(categoryRes.data));
                setSuppliers(normalizeSuppliers(supplierRes.data.data));
                setProducts(productRes.data.data ?? []);
            } catch (error) {
                toast.error(Helper.errorMessage(error));
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        }

        void bootstrap();
    }, []);

    function updateFormField<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function clearCoverImage() {
        if (coverImage?.previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(coverImage.previewUrl);
        }

        setCoverImage(null);
        setForm((current) => ({ ...current, coverImage: "" }));
    }

    function removeGalleryImage(key: string) {
        setGalleryImages((current) => {
            const target = current.find((item) => item.key === key);
            if (target?.previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(target.previewUrl);
            }

            const next = current.filter((item) => item.key !== key);
            setForm((formState) => ({ ...formState, imageProduct: next.filter((item) => item.url).map((item) => item.url) }));
            return next;
        });
    }

    function clearGalleryImages() {
        setGalleryImages((current) => {
            current.forEach((item) => {
                if (item.previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
            return [];
        });
    }

    function resetForm() {
        clearCoverImage();
        clearGalleryImages();
        setForm(emptyForm);
        setOriginalAttributeIds([]);
        setOriginalAttributeValuePairs([]);
        setShowForm(false);
        setIsLoadingDetail(false);
    }

    async function refreshProducts() {
        const response = await ProductApi.getAdminProducts(1, 200);
        setProducts(response.data.data);
    }

    function selectCoverImage(file: File | null) {
        if (!file) return;

        const nextItem = createLocalImageItem(file);

        if (coverImage?.previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(coverImage.previewUrl);
        }

        setCoverImage(nextItem);

        setForm((current) => ({
            ...current,
            coverImage: "",
        }));
    }

    function selectGalleryImages(files: FileList | null) {
        if (!files?.length) return;

        const pickedFiles = Array.from(files).map((file) => createLocalImageItem(file));
        setGalleryImages((current) => [...current, ...pickedFiles]);
    }

    function updateAttributes(next: ProductAttributeInput[]) {
        setForm((current) => ({ ...current, attributes: next }));
    }

    function updateVariants(next: ProductVariantInput[]) {
        setForm((current) => ({ ...current, productVariant: next }));
    }

    useEffect(() => {
        setForm((current) => {
            const combinations = buildVariantCombinations(current.attributes);

            if (combinations.length === 0) {
                if (current.productVariant.length === 0) {
                    return current;
                }

                return {
                    ...current,
                    productVariant: [],
                };
            }

            const fallbackPrice = Number(current.salePrice) > 0 ? String(Number(current.salePrice)) : "";
            const existingBySignature = new Map(current.productVariant.map((variant) => [toVariantSignature(variant.variantAttributes), variant]));

            const nextVariants: ProductVariantInput[] = combinations.map((combo) => {
                const existingVariant = existingBySignature.get(toVariantSignature(combo));

                return {
                    key: existingVariant?.key ?? createKey(),
                    id: existingVariant?.id,
                    sku: existingVariant?.sku ?? "",
                    price: existingVariant?.price ?? fallbackPrice,
                    weight: existingVariant?.weight ?? current.weight,
                    length: existingVariant?.length ?? current.length,
                    width: existingVariant?.width ?? current.width,
                    height: existingVariant?.height ?? current.height,
                    variantAttributes: combo.map((item) => ({
                        key: createKey(),
                        attribute: item.attribute,
                        value: item.value,
                    })),
                };
            });

            const prevSignature = current.productVariant
                .map((variant) => `${variant.id ?? "new"}:${toVariantSignature(variant.variantAttributes)}`)
                .sort()
                .join(";");

            const nextSignature = nextVariants
                .map((variant) => `${variant.id ?? "new"}:${toVariantSignature(variant.variantAttributes)}`)
                .sort()
                .join(";");

            if (prevSignature === nextSignature) {
                return current;
            }

            return {
                ...current,
                productVariant: nextVariants,
            };
        });
    }, [form.attributes, form.salePrice, form.weight, form.length, form.width, form.height]);

    async function uploadPendingMedia() {
        let resolvedCoverUrl = form.coverImage;

        if (coverImage?.file) {
            setCoverImage((current) => (current ? { ...current, isUploading: true } : current));
            const response = await FileUploadApi.upload(coverImage.file);
            resolvedCoverUrl = String(response.url ?? "");

            setCoverImage((current) => {
                if (!current) return current;

                if (current.previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(current.previewUrl);
                }

                return {
                    ...current,
                    url: resolvedCoverUrl,
                    previewUrl: resolvedCoverUrl,
                    isUploading: false,
                    file: undefined,
                };
            });
        }

        const nextGallery: ProductImageItem[] = [];
        for (const image of galleryImages) {
            if (image.file) {
                setGalleryImages((current) => current.map((item) => (item.key === image.key ? { ...item, isUploading: true } : item)));

                const response = await FileUploadApi.upload(image.file);
                const uploadedUrl = String(response.url ?? "");

                if (image.previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(image.previewUrl);
                }

                nextGallery.push({
                    ...image,
                    url: uploadedUrl,
                    previewUrl: uploadedUrl,
                    isUploading: false,
                    file: undefined,
                });
            } else if (image.url) {
                nextGallery.push({ ...image, isUploading: false });
            }
        }

        setGalleryImages(nextGallery);

        const galleryUrls = nextGallery.filter((item) => item.url).map((item) => item.url);
        setForm((current) => ({
            ...current,
            coverImage: resolvedCoverUrl,
            imageProduct: galleryUrls,
        }));

        return {
            coverImage: resolvedCoverUrl,
            imageProduct: galleryUrls,
        };
    }

    async function startEdit(product: Product) {
        setShowForm(true);
        setIsLoadingDetail(true);

        try {
            const detailResponse = await ProductApi.getAdminProductDetail(product.id);
            const detail = detailResponse.data;
            const nextForm = createFormFromDetail(detail);

            clearCoverImage();
            clearGalleryImages();

            setForm(nextForm);
            const loadedAttributes = nextForm.attributes;
            setOriginalAttributeIds(loadedAttributes.map((attribute) => Number(attribute.id)).filter((id) => Number.isFinite(id)));
            setOriginalAttributeValuePairs(
                loadedAttributes.flatMap((attribute) =>
                    attribute.values
                        .filter((item) => Number.isFinite(Number(item.id)))
                        .map((item) => ({ id: Number(item.id), attributeId: Number(attribute.id) })),
                ),
            );
            setCoverImage(detail.coverImage ? createImageItem(detail.coverImage, "cover-image") : null);
            setGalleryImages((detail.imageProduct.length > 0 ? detail.imageProduct : detail.coverImage ? [detail.coverImage] : []).map((url, index) => createImageItem(url, `image-${index + 1}`)));
        } catch (error) {
            toast.error(Helper.errorMessage(error));
            setShowForm(false);
        } finally {
            setIsLoadingDetail(false);
        }
    }

    async function submitProduct() {
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên sản phẩm.");
            return;
        }

        if (!form.categoryId) {
            toast.error("Vui lòng chọn phân loại.");
            return;
        }

        if (!form.supplierId) {
            toast.error("Vui lòng chọn nhà cung cấp.");
            return;
        }

        if (!coverImage && !form.coverImage) {
            toast.error("Vui lòng upload ảnh bìa.");
            return;
        }
        const listPrice = Number(form.listPrice);
        const salePrice = Number(form.salePrice);
        const weight = Number(form.weight);
        const length = Number(form.length);
        const width = Number(form.width);
        const height = Number(form.height);
        const attributesPayloadForCreate = buildAttributesPayloadForCreate(form);
        const attributesPayloadForUpdate = buildAttributesPayloadForUpdate(form);
        const hasClassificationAttributes = attributesPayloadForUpdate.length > 0;
        const variantsPayload = buildVariantsPayload(form);

        if (Number.isNaN(listPrice) || listPrice <= 0) {
            toast.error("Giá niêm yết phải lớn hơn 0.");
            return;
        }

        if (Number.isNaN(salePrice) || salePrice <= 0) {
            toast.error("Giá bán phải lớn hơn 0.");
            return;
        }

        if (!hasClassificationAttributes && (Number.isNaN(weight) || weight <= 0 || Number.isNaN(length) || length <= 0 || Number.isNaN(width) || width <= 0 || Number.isNaN(height) || height <= 0)) {
            toast.error("Vui lòng nhập đầy đủ thông số vận chuyển mặc định.");
            return;
        }

        if (hasClassificationAttributes && form.productVariant.length === 0) {
            toast.error("Vui lòng tạo bảng biến thể từ thuộc tính phân loại.");
            return;
        }

        if (hasClassificationAttributes && variantsPayload.length !== form.productVariant.length) {
            toast.error("Biến thể chưa hợp lệ. Mỗi biến thể cần giá, kích thước, cân nặng và ít nhất 1 thuộc tính.");
            return;
        }

        setIsSaving(true);
        try {
            const uploadedMedia = await uploadPendingMedia();

            if (!uploadedMedia.coverImage) {
                toast.error("Upload ảnh bìa thất bại. Vui lòng kiểm tra lại.");
                return;
            }

            const payload: Record<string, unknown> = {
                name: form.name.trim(),
                description: form.description.trim(),
                listPrice,
                salePrice,
                categoryId: Number(form.categoryId),
                supplierId: Number(form.supplierId),
                ...(form.video.trim() ? { video: form.video.trim() } : {}),
                coverImage: uploadedMedia.coverImage,
                imageProduct: uploadedMedia.imageProduct.length > 0 ? uploadedMedia.imageProduct : [uploadedMedia.coverImage],
            };

            if (!form.id && !hasClassificationAttributes) {
                payload.weight = weight;
                payload.length = length;
                payload.width = width;
                payload.height = height;
            }

            if (!form.id && hasClassificationAttributes) {
                if (attributesPayloadForCreate.length > 0) {
                    payload.attributes = attributesPayloadForCreate;
                }

                if (variantsPayload.length > 0) {
                    payload.productVariant = variantsPayload;
                }
            }

            if (form.id) {
                const currentAttributeIds = form.attributes.map((attribute) => Number(attribute.id)).filter((id) => Number.isFinite(id));
                const deletedAttributeIds = originalAttributeIds.filter((id) => !currentAttributeIds.includes(id));

                const currentValueIds = form.attributes
                    .flatMap((attribute) => attribute.values.map((item) => Number(item.id)))
                    .filter((id) => Number.isFinite(id));

                const deletedAttributeValueIds = originalAttributeValuePairs
                    .filter((item) => !deletedAttributeIds.includes(item.attributeId) && !currentValueIds.includes(item.id))
                    .map((item) => item.id);

                if (deletedAttributeValueIds.length > 0) {
                    await ProductApi.deleteAttributeValue(form.id, { attributeValueIds: deletedAttributeValueIds });
                }

                if (deletedAttributeIds.length > 0) {
                    await ProductApi.deleteAttribute(form.id, { attributeIds: deletedAttributeIds });
                }

                payload.attributes = attributesPayloadForUpdate;
                await ProductApi.updateProduct({ id: form.id, ...payload });

                if (hasClassificationAttributes) {
                    const updateRequests = form.productVariant
                        .filter((variant) => Boolean(variant.id))
                        .map((variant) => ({
                            variantId: Number(variant.id),
                            price: Number(variant.price),
                            weight: Number(variant.weight),
                            length: Number(variant.length),
                            width: Number(variant.width),
                            height: Number(variant.height),
                            variantAttributes: variant.variantAttributes.map((item) => ({
                                attribute: item.attribute.trim(),
                                value: item.value.trim(),
                            })),
                        }));

                    const addRequests = form.productVariant
                        .filter((variant) => !variant.id)
                        .map((variant) => ({
                            sku: variant.sku.trim() || undefined,
                            price: Number(variant.price),
                            weight: Number(variant.weight),
                            length: Number(variant.length),
                            width: Number(variant.width),
                            height: Number(variant.height),
                            variantAttributes: variant.variantAttributes.map((item) => ({
                                attribute: item.attribute.trim(),
                                value: item.value.trim(),
                            })),
                        }));

                    for (const variantPayload of updateRequests) {
                        await ProductApi.updateVariants(form.id, variantPayload);
                    }

                    if (addRequests.length > 0) {
                        await ProductApi.addVariants(form.id, addRequests);
                    }
                }

                toast.success("Cập nhật sản phẩm thành công.");
            } else {
                await ProductApi.addProduct(payload);
                toast.success("Tạo sản phẩm thành công.");
            }

            resetForm();
            await refreshProducts();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(product: Product) {
        setDeleteTarget(product);
    }

    async function confirmDelete() {
        if (!deleteTarget) return;

        const isSold = Number(deleteTarget.soldQuantity) > 0;

        setIsSaving(true);
        try {
            await ProductApi.deleteProduct(deleteTarget.id);
            toast.success(isSold ? "Sản phẩm đã được ẩn khỏi web." : "Đã xoá sản phẩm khỏi hệ thống.");
            if (form.id === deleteTarget.id) {
                resetForm();
            }
            await refreshProducts();
            setDeleteTarget(null);
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleRestore(productId: number) {
        setIsSaving(true);
        try {
            await ProductApi.restoreProduct(productId);
            toast.success("Sản phẩm đã hiển thị trở lại trên web.");
            await refreshProducts();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    const filteredProducts = searchKeyword.trim()
        ? products.filter(
              (product) =>
                  String(product.name ?? "")
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase()) ||
                  String(product.description ?? "")
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase()),
          )
        : products;

    const categoryFilteredProducts = categoryFilter === "all" ? filteredProducts : filteredProducts.filter((product) => String(product.categoryId) === categoryFilter);

    const activeProducts = products.filter((product) => product.status === "ACTIVE").length;
    const hiddenProducts = products.filter((product) => product.status === "INACTIVE").length;

    return (
        <AdminPageShell title="Sản phẩm" description="Quản lý sản phẩm theo đúng hợp đồng dữ liệu của server.">
            <div className="space-y-4">
                <ProductPageHeader
                    totalProducts={products.length}
                    activeProducts={activeProducts}
                    hiddenProducts={hiddenProducts}
                    categoriesCount={categories.filter((category) => category.status === "ACTIVE").length}
                    onCreate={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                />

                <ProductFormPanel
                    open={showForm}
                    onOpenChange={(open) => {
                        if (!open) {
                            resetForm();
                            return;
                        }

                        setShowForm(true);
                    }}
                    isSaving={isSaving}
                    isLoadingDetail={isLoadingDetail}
                    form={form}
                    categoryOptions={categories.filter((category) => category.status === "ACTIVE" || String(category.id) === form.categoryId)}
                    supplierOptions={suppliers.filter((supplier) => supplier.status === "ACTIVE" || String(supplier.id) === form.supplierId)}
                    coverImage={coverImage}
                    galleryImages={galleryImages}
                    onChange={updateFormField}
                    onSelectCover={selectCoverImage}
                    onSelectGallery={selectGalleryImages}
                    onRemoveCover={clearCoverImage}
                    onRemoveGalleryImage={removeGalleryImage}
                    onAttributesChange={updateAttributes}
                    onVariantsChange={updateVariants}
                    onCancel={resetForm}
                    onSubmit={() => void submitProduct()}
                />

                <ProductTable
                    products={categoryFilteredProducts}
                    isLoading={isLoading}
                    isSaving={isSaving}
                    searchKeyword={searchKeyword}
                    categoryFilterValue={categoryFilter}
                    categoryFilterOptions={categories.filter((category) => category.status === "ACTIVE")}
                    onSearchChange={setSearchKeyword}
                    onCategoryFilterChange={setCategoryFilter}
                    getCategoryLabel={(categoryId) => categories.find((category) => category.id === categoryId)?.name ?? `Danh mục #${categoryId}`}
                    onEdit={(product) => void startEdit(product)}
                    onDelete={(product) => void handleDelete(product)}
                    onRestore={(productId) => void handleRestore(productId)}
                />

                <DeleteProductDialog product={deleteTarget} isSaving={isSaving} onClose={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} />
            </div>
        </AdminPageShell>
    );
}
