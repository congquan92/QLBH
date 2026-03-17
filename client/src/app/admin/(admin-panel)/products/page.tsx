"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { FileUploadApi } from "@/api/admin/file-upload.api";
import { CategoryApi } from "@/api/category.api";
import { ProductApi } from "@/api/product.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Helper } from "@/lib/helper";
import type { Supplier } from "@/types/admin-crud";
import type { Category, CategoryChild } from "@/types/navbar";
import type { Product, ProductDetail } from "@/types/product";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductFormPanel } from "./_components/product-form-panel";
import { ProductPageHeader } from "./_components/product-page-header";
import { ProductTable } from "./_components/product-table";
import type { CategoryOption, ProductFormValues, ProductImageItem, SupplierOption } from "./_components/product-types";

const emptyForm: ProductFormValues = {
    name: "",
    description: "",
    listPrice: "",
    salePrice: "",
    categoryId: "",
    supplierId: "",
    coverImage: "",
    imageProduct: [],
};

function createImageItem(url: string, fileName?: string): ProductImageItem {
    return {
        key: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        url,
        previewUrl: url,
        fileName: fileName ?? url.split("/").pop() ?? "image",
        isUploading: false,
    };
}

function flattenCategories(categories: Category[]): CategoryOption[] {
    const result: CategoryOption[] = [];

    function walk(nodes: Array<Category | CategoryChild>, depth = 0) {
        for (const node of nodes) {
            result.push({
                id: node.id,
                name: node.name,
                label: `${depth > 0 ? `${"— ".repeat(depth)} ` : ""}${node.name}`,
                status: String(node.status ?? "ACTIVE"),
            });

            if (node.childCategory?.length) {
                walk(node.childCategory, depth + 1);
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
    return {
        id: detail.id,
        name: String(detail.name ?? ""),
        description: String(detail.description ?? ""),
        listPrice: String(detail.listPrice ?? ""),
        salePrice: String(detail.salePrice ?? ""),
        categoryId: String(detail.categoryId ?? ""),
        supplierId: String(detail.supplierId ?? ""),
        coverImage: String(detail.coverImage ?? ""),
        imageProduct: Array.isArray(detail.imageProduct) ? detail.imageProduct.filter(Boolean) : [],
    };
}

export default function ProductsPage() {
    const { hasPermission } = useAdminAuth();
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

    const canViewProducts = hasPermission("VIEW_PRODUCTS_ADMIN");
    const canCreateProduct = hasPermission("CREATE_PRODUCT");
    const canUpdateProduct = hasPermission("UPDATE_PRODUCT");
    const canDeleteProduct = hasPermission("DELETE_PRODUCT");
    const canRestoreProduct = hasPermission("RESTORE_PRODUCT");

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
                const [categoryRes, supplierRes, productRes] = await Promise.all([
                    CategoryApi.getAdminCategories({ page: 1, size: 300 }),
                    AdminCrudApi.getSuppliers({ page: 1, size: 200, sort: "id:desc" }),
                    canViewProducts ? ProductApi.getAdminProducts(1, 200) : Promise.resolve(null),
                ]);

                setCategories(flattenCategories(categoryRes.data));
                setSuppliers(normalizeSuppliers(supplierRes.data.data));
                setProducts(productRes?.data.data ?? []);
            } catch (error) {
                toast.error(Helper.errorMessage(error));
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        }

        void bootstrap();
    }, [canViewProducts]);

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
        setShowForm(false);
        setIsLoadingDetail(false);
    }

    async function refreshProducts() {
        if (!canViewProducts) {
            setProducts([]);
            return;
        }

        const response = await ProductApi.getAdminProducts(1, 200);
        setProducts(response.data.data);
    }

    async function uploadCoverImage(file: File | null) {
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        const nextItem: ProductImageItem = {
            key: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            url: "",
            previewUrl,
            fileName: file.name,
            isUploading: true,
        };

        if (coverImage?.previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(coverImage.previewUrl);
        }

        setCoverImage(nextItem);

        try {
            const response = await FileUploadApi.upload(file);
            const uploadedUrl = String(response.url ?? "");

            setCoverImage((current) => {
                if (!current || current.key !== nextItem.key) return current;
                if (current.previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(current.previewUrl);
                }

                return {
                    ...current,
                    url: uploadedUrl,
                    previewUrl: uploadedUrl,
                    isUploading: false,
                };
            });
            setForm((current) => ({
                ...current,
                coverImage: uploadedUrl,
                imageProduct: current.imageProduct.length > 0 ? current.imageProduct : [uploadedUrl],
            }));
            setGalleryImages((current) => (current.length > 0 ? current : [createImageItem(uploadedUrl, file.name)]));
        } catch (error) {
            clearCoverImage();
            toast.error(Helper.errorMessage(error));
        }
    }

    async function uploadGalleryImages(files: FileList | null) {
        if (!files?.length) return;

        const pickedFiles = Array.from(files).map((file) => ({
            file,
            item: {
                key: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
                url: "",
                previewUrl: URL.createObjectURL(file),
                fileName: file.name,
                isUploading: true,
            } satisfies ProductImageItem,
        }));

        setGalleryImages((current) => [...current, ...pickedFiles.map(({ item }) => item)]);

        await Promise.all(
            pickedFiles.map(async ({ file, item }) => {
                try {
                    const response = await FileUploadApi.upload(file);
                    const uploadedUrl = String(response.url ?? "");

                    setGalleryImages((current) => {
                        const next = current.map((image) => {
                            if (image.key !== item.key) return image;
                            if (image.previewUrl.startsWith("blob:")) {
                                URL.revokeObjectURL(image.previewUrl);
                            }

                            return {
                                ...image,
                                url: uploadedUrl,
                                previewUrl: uploadedUrl,
                                isUploading: false,
                            };
                        });
                        setForm((formState) => ({ ...formState, imageProduct: next.filter((image) => image.url).map((image) => image.url) }));
                        return next;
                    });
                } catch (error) {
                    removeGalleryImage(item.key);
                    toast.error(Helper.errorMessage(error));
                }
            }),
        );
    }

    async function startEdit(product: Product) {
        setShowForm(true);
        setIsLoadingDetail(true);

        try {
            const detailResponse = await ProductApi.getAdminProductDetail(product.id);
            const detail = detailResponse.data;

            clearCoverImage();
            clearGalleryImages();

            setForm(createFormFromDetail(detail));
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

        if (!form.coverImage) {
            toast.error("Vui lòng upload ảnh bìa.");
            return;
        }

        const uploadedGalleryImages = galleryImages.filter((item) => item.url).map((item) => item.url);
        const listPrice = Number(form.listPrice);
        const salePrice = Number(form.salePrice);

        if (Number.isNaN(listPrice) || listPrice <= 0) {
            toast.error("Giá niêm yết phải lớn hơn 0.");
            return;
        }

        if (Number.isNaN(salePrice) || salePrice <= 0) {
            toast.error("Giá bán phải lớn hơn 0.");
            return;
        }

        const payload: Record<string, unknown> = {
            name: form.name.trim(),
            description: form.description.trim(),
            listPrice,
            salePrice,
            categoryId: Number(form.categoryId),
            supplierId: Number(form.supplierId),
            coverImage: form.coverImage,
            imageProduct: uploadedGalleryImages.length > 0 ? uploadedGalleryImages : [form.coverImage],
        };

        setIsSaving(true);
        try {
            if (form.id) {
                await ProductApi.updateProduct({ id: form.id, ...payload });
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
        const isSold = Number(product.soldQuantity) > 0;
        const confirmed = window.confirm(isSold ? "Sản phẩm này đã được bán. Hệ thống sẽ chuyển sang trạng thái ẩn khỏi web. Tiếp tục?" : "Sản phẩm chưa được bán. Bạn có chắc chắn muốn xoá vĩnh viễn sản phẩm này?");

        if (!confirmed) return;

        setIsSaving(true);
        try {
            await ProductApi.deleteProduct(product.id);
            toast.success(isSold ? "Sản phẩm đã được ẩn khỏi web." : "Đã xoá sản phẩm khỏi hệ thống.");
            if (form.id === product.id) {
                resetForm();
            }
            await refreshProducts();
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
                    canCreateProduct={canCreateProduct}
                    onCreate={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                />

                <ProductFormPanel
                    open={showForm}
                    isSaving={isSaving}
                    isLoadingDetail={isLoadingDetail}
                    form={form}
                    categoryOptions={categories.filter((category) => category.status === "ACTIVE" || String(category.id) === form.categoryId)}
                    supplierOptions={suppliers.filter((supplier) => supplier.status === "ACTIVE" || String(supplier.id) === form.supplierId)}
                    coverImage={coverImage}
                    galleryImages={galleryImages}
                    onChange={updateFormField}
                    onSelectCover={(file) => void uploadCoverImage(file)}
                    onSelectGallery={(files) => void uploadGalleryImages(files)}
                    onRemoveCover={clearCoverImage}
                    onRemoveGalleryImage={removeGalleryImage}
                    onCancel={resetForm}
                    onSubmit={() => void submitProduct()}
                />

                <ProductTable
                    products={filteredProducts}
                    isLoading={isLoading}
                    isSaving={isSaving}
                    canViewProducts={canViewProducts}
                    canUpdateProduct={canUpdateProduct}
                    canDeleteProduct={canDeleteProduct}
                    canRestoreProduct={canRestoreProduct}
                    searchKeyword={searchKeyword}
                    onSearchChange={setSearchKeyword}
                    getCategoryLabel={(categoryId) => categories.find((category) => category.id === categoryId)?.name ?? `Danh mục #${categoryId}`}
                    onEdit={(product) => void startEdit(product)}
                    onDelete={(product) => void handleDelete(product)}
                    onRestore={(productId) => void handleRestore(productId)}
                />
            </div>
        </AdminPageShell>
    );
}
