"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { ProductApi } from "@/api/product.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helper } from "@/lib/helper";
import type { Supplier } from "@/types/admin-crud";
import type { Product, ProductDetail } from "@/types/product";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImportManagement } from "./_components/import-management";
import { InventoryHeader } from "./_components/inventory-header";
import { SupplierManagement } from "./_components/supplier-management";
import type { DeliveryStatus, ImportDetailDialogData, ImportDetailRow, ImportRow, LowStockVariantRow, ProductOption, SupplierFormValues, SupplierRow, VariantOption } from "./_components/inventory-types";

const LOW_STOCK_THRESHOLD = 5;

function toSafeString(value: unknown): string {
    return String(value ?? "").trim();
}

function normalizeSupplierStatus(value: unknown): SupplierRow["status"] {
    const raw = toSafeString(value).toUpperCase();
    if (raw === "DISABLED") return "DISABLED";
    if (raw === "INACTIVE") return "INACTIVE";
    return "ACTIVE";
}

function normalizeDeliveryStatus(value: unknown): DeliveryStatus {
    const raw = toSafeString(value).toUpperCase();
    if (raw === "CONFIRMED" || raw === "PACKED" || raw === "SHIPPED" || raw === "DELIVERED" || raw === "COMPLETED" || raw === "CANCELLED" || raw === "INACTIVE") {
        return raw;
    }
    return "PENDING";
}

function mapSupplierRows(items: Supplier[]): SupplierRow[] {
    return items.map((item) => ({
        id: Number(item.id ?? 0),
        name: toSafeString(item.name) || `Supplier #${String(item.id ?? "-")}`,
        phone: toSafeString(item.phone),
        address: toSafeString(item.address),
        ward: toSafeString(item.ward),
        district: toSafeString(item.district),
        province: toSafeString(item.province),
        status: normalizeSupplierStatus(item.status),
    }));
}

function mapProductOptions(items: Product[], suppliers: SupplierRow[]): ProductOption[] {
    const supplierMap = new Map<number, string>(suppliers.map((item) => [item.id, item.name]));
    return items.map((item) => ({
        id: item.id,
        name: toSafeString(item.name) || `Product #${item.id}`,
        supplierId: Number(item.supplierId ?? 0),
        supplierName: supplierMap.get(Number(item.supplierId ?? 0)) ?? `Supplier #${String(item.supplierId ?? "-")}`,
    }));
}

function mapImportRows(items: Array<Record<string, unknown>>): ImportRow[] {
    return items.map((item) => {
        const product = (item.product as Record<string, unknown> | undefined) ?? {};
        const supplier = (product.supplier as Record<string, unknown> | undefined) ?? {};
        const details = (item.importDetail as Array<unknown> | undefined) ?? (item.import_detail as Array<unknown> | undefined) ?? [];

        return {
            id: Number(item.id ?? 0),
            description: toSafeString(item.description),
            status: normalizeDeliveryStatus(item.status),
            totalAmount: Number(item.totalAmount ?? item.total_amount ?? 0),
            createdAt: toSafeString(item.created_at ?? item.createdAt),
            productId: Number(item.product_id ?? product.id ?? 0),
            productName: toSafeString(product.name),
            supplierId: Number(product.supplier_id ?? supplier.id ?? 0),
            supplierName: toSafeString(supplier.name),
            itemCount: Array.isArray(details) ? details.length : 0,
        };
    });
}

function mapImportDetails(items: Array<Record<string, unknown>>): ImportDetailRow[] {
    return items.map((item) => ({
        id: Number(item.id ?? 0),
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unitPrice ?? item.unit_price ?? 0),
        variantId: Number(item.product_variant_id ?? 0),
        nameSnapshot: toSafeString(item.nameProductSnapShot ?? item.name_product_snap_shot),
        imageSnapshot: toSafeString(item.urlImageSnapShot ?? item.url_image_snap_shot),
        variantSnapshot: toSafeString(item.variantAttributesSnapshot ?? item.variant_attributes_snapshot),
    }));
}

function mapVariantOptions(detail: ProductDetail): VariantOption[] {
    return (detail.productVariant ?? []).map((variant) => {
        const attrs = (variant.variantAttributes ?? []).map((attr) => `${attr.attribute}: ${attr.value}`).join(" | ");
        return {
            id: variant.id,
            sku: toSafeString(variant.sku),
            quantity: Number(variant.quantity ?? 0),
            price: Number(variant.price ?? 0),
            label: `${toSafeString(variant.sku)}${attrs ? ` - ${attrs}` : ""} (tồn: ${Number(variant.quantity ?? 0)})`,
        };
    });
}

function parseLowStockVariantIdsParam(raw: string | null): number[] {
    if (!raw) return [];
    return Array.from(
        new Set(
            raw
                .split(",")
                .map((item) => Number(item.trim()))
                .filter((item) => Number.isFinite(item) && item > 0),
        ),
    );
}

function mapLowStockVariants(detail: ProductDetail, productOption?: ProductOption): LowStockVariantRow[] {
    return (detail.productVariant ?? [])
        .map((variant) => {
            const quantity = Number(variant.quantity ?? 0);
            const attrs = (variant.variantAttributes ?? [])
                .map((item) => `${toSafeString(item.attribute)}: ${toSafeString(item.value)}`)
                .filter(Boolean)
                .join(" | ");

            return {
                productId: Number(detail.id ?? 0),
                productName: toSafeString(detail.name) || `Product #${String(detail.id ?? "-")}`,
                supplierId: Number(detail.supplierId ?? productOption?.supplierId ?? 0),
                supplierName: productOption?.supplierName ?? "-",
                variantId: Number(variant.id ?? 0),
                sku: toSafeString(variant.sku),
                attributesLabel: attrs,
                quantity,
                unitPrice: Number(variant.price ?? detail.salePrice ?? 0),
                suggestedQuantity: Math.max(1, LOW_STOCK_THRESHOLD - quantity + 1),
            } satisfies LowStockVariantRow;
        })
        .filter((item) => item.variantId > 0 && Number.isFinite(item.quantity) && item.quantity <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.quantity - b.quantity);
}

export default function InventoryPage() {
    const searchParams = useSearchParams();
    const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
    const [imports, setImports] = useState<ImportRow[]>([]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [lowStockVariants, setLowStockVariants] = useState<LowStockVariantRow[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"imports" | "suppliers">("imports");
    const [openCreateSupplier, setOpenCreateSupplier] = useState(false);
    const [openCreateImport, setOpenCreateImport] = useState(false);

    const preselectedLowStockVariantIds = useMemo(() => parseLowStockVariantIdsParam(searchParams.get("lowStock")), [searchParams]);

    const fetchInventoryData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [supplierRes, importRes, productRes] = await Promise.all([
                AdminCrudApi.getSuppliers({ page: 1, size: 400, sort: "id:desc" }),
                AdminCrudApi.getImportProducts({ page: 1, size: 200, sort: "id:desc" }),
                ProductApi.getAdminProducts(1, 300),
            ]);

            const supplierRows = mapSupplierRows(supplierRes.data.data);
            const productOptions = mapProductOptions(productRes.data.data ?? [], supplierRows);

            const detailResults = await Promise.allSettled((productRes.data.data ?? []).map((item) => ProductApi.getAdminProductDetail(item.id)));
            const lowStockRows: LowStockVariantRow[] = [];

            for (const result of detailResults) {
                if (result.status !== "fulfilled") continue;

                const detail = result.value.data;
                const productOption = productOptions.find((item) => item.id === Number(detail.id ?? 0));
                lowStockRows.push(...mapLowStockVariants(detail, productOption));
            }

            setSuppliers(supplierRows);
            setImports(mapImportRows((importRes.data.data as Array<Record<string, unknown>>) ?? []));
            setProducts(productOptions);
            setLowStockVariants(lowStockRows);
        } catch (error) {
            toast.error(Helper.errorMessage(error));
            setSuppliers([]);
            setImports([]);
            setProducts([]);
            setLowStockVariants([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchInventoryData();
    }, [fetchInventoryData]);

    const stats = useMemo(() => {
        const activeSuppliers = suppliers.filter((item) => item.status === "ACTIVE").length;
        const pendingImports = imports.filter((item) => item.status === "PENDING").length;
        const totalAmount = imports.reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0);
        return {
            activeSuppliers,
            pendingImports,
            totalAmount,
        };
    }, [imports, suppliers]);

    async function createSupplier(payload: SupplierFormValues) {
        setIsSaving(true);
        try {
            await AdminCrudApi.createSupplier({
                name: payload.name.trim(),
                phone: payload.phone.trim(),
                address: payload.address.trim(),
                ward: payload.ward.trim(),
                district: payload.district.trim(),
                province: payload.province.trim(),
            });
            toast.success("Đã tạo nhà cung cấp mới");
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function updateSupplier(id: number, payload: SupplierFormValues) {
        setIsSaving(true);
        try {
            await AdminCrudApi.updateSupplier(id, {
                name: payload.name.trim(),
                phone: payload.phone.trim(),
                address: payload.address.trim(),
                ward: payload.ward.trim(),
                district: payload.district.trim(),
                province: payload.province.trim(),
                status: payload.status,
            });
            toast.success(`Đã cập nhật nhà cung cấp #${id}`);
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function deleteSupplier(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteSupplier(id);
            toast.success(`Đã vô hiệu hóa nhà cung cấp #${id}`);
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function loadVariantsForProduct(productId: number): Promise<VariantOption[]> {
        const response = await ProductApi.getAdminProductDetail(productId);
        return mapVariantOptions(response.data);
    }

    async function createImport(payload: { product_id: number; description: string; import_details: Array<{ product_variant_id: number; quantity: number; unitPrice: number }> }) {
        setIsSaving(true);
        try {
            await AdminCrudApi.createImportProduct(payload);
            toast.success("Đã tạo phiếu nhập mới");
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function createImportBatch(payloads: Array<{ product_id: number; description: string; import_details: Array<{ product_variant_id: number; quantity: number; unitPrice: number }> }>) {
        if (payloads.length === 0) return;

        setIsSaving(true);

        try {
            const results = await Promise.allSettled(payloads.map((payload) => AdminCrudApi.createImportProduct(payload)));
            const successCount = results.filter((result) => result.status === "fulfilled").length;
            const failCount = results.length - successCount;

            if (failCount === 0) {
                toast.success(`Đã tạo ${successCount} phiếu nhập từ danh sách sắp hết hàng.`);
            } else {
                toast.error(`Đã tạo ${successCount} phiếu nhập, lỗi ${failCount} phiếu.`);
            }
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function getImportDetail(id: number): Promise<ImportDetailDialogData> {
        const response = (await AdminCrudApi.getImportProductDetail(id)) as { data?: Record<string, unknown> };
        const data = (response.data ?? {}) as Record<string, unknown>;
        const product = (data.product as Record<string, unknown> | undefined) ?? {};
        const supplier = (product.supplier as Record<string, unknown> | undefined) ?? {};
        const details = (data.importDetail as Array<Record<string, unknown>> | undefined) ?? (data.import_detail as Array<Record<string, unknown>> | undefined) ?? [];

        return {
            id: Number(data.id ?? id),
            description: toSafeString(data.description),
            status: normalizeDeliveryStatus(data.status),
            totalAmount: Number(data.totalAmount ?? data.total_amount ?? 0),
            createdAt: toSafeString(data.created_at ?? data.createdAt),
            productId: Number(data.product_id ?? product.id ?? 0),
            productName: toSafeString(product.name),
            supplierId: Number(product.supplier_id ?? supplier.id ?? 0),
            supplierName: toSafeString(supplier.name),
            itemCount: details.length,
            details: mapImportDetails(details),
        };
    }

    async function confirmImport(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.confirmImportProduct(id);
            toast.success(`Đã xác nhận phiếu nhập #${id}`);
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function cancelImport(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.cancelImportProduct(id);
            toast.success(`Đã hủy phiếu nhập #${id}`);
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function deleteImport(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteImportProduct(id);
            toast.success(`Đã xóa phiếu nhập #${id}`);
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function updateImportQuantities(id: number, items: Array<{ importDetailId: number; quantity: number }>) {
        setIsSaving(true);
        try {
            await AdminCrudApi.updateImportQuantities(id, { items });
            toast.success(`Đã cập nhật số lượng cho phiếu #${id}`);
            await fetchInventoryData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Kho hàng" description="Quản lý nhà cung cấp, phiếu nhập và tồn kho của bạn ngay tại đây. Theo dõi trạng thái nhập hàng, cập nhật số lượng và đảm bảo kho luôn được điều phối hiệu quả.">
            <div className="space-y-4">
                <InventoryHeader
                    supplierCount={stats.activeSuppliers}
                    importCount={imports.length}
                    pendingCount={stats.pendingImports}
                    totalAmount={stats.totalAmount}
                    onCreateSupplier={() => {
                        setActiveTab("suppliers");
                        setOpenCreateSupplier(true);
                    }}
                    onCreateImport={() => {
                        setActiveTab("imports");
                        setOpenCreateImport(true);
                    }}
                />

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "imports" | "suppliers")}>
                    <TabsList variant="line" className="w-full justify-start">
                        <TabsTrigger value="imports">Phiếu nhập</TabsTrigger>
                        <TabsTrigger value="suppliers">Nhà cung cấp</TabsTrigger>
                    </TabsList>

                    <TabsContent value="imports">
                        <ImportManagement
                            imports={imports}
                            suppliers={suppliers}
                            products={products}
                            lowStockVariants={lowStockVariants}
                            initialSelectedLowStockVariantIds={preselectedLowStockVariantIds}
                            isLoading={isLoading}
                            isSaving={isSaving}
                            onRefresh={fetchInventoryData}
                            loadVariantsForProduct={loadVariantsForProduct}
                            onCreate={createImport}
                            onCreateBatch={createImportBatch}
                            onGetDetail={getImportDetail}
                            onConfirm={confirmImport}
                            onCancel={cancelImport}
                            onDelete={deleteImport}
                            onUpdateQuantities={updateImportQuantities}
                            createOpen={openCreateImport}
                            onCreateOpenChange={setOpenCreateImport}
                        />
                    </TabsContent>

                    <TabsContent value="suppliers">
                        <SupplierManagement
                            suppliers={suppliers}
                            isLoading={isLoading}
                            isSaving={isSaving}
                            onRefresh={fetchInventoryData}
                            onCreate={createSupplier}
                            onUpdate={updateSupplier}
                            onDelete={deleteSupplier}
                            createOpen={openCreateSupplier}
                            onCreateOpenChange={setOpenCreateSupplier}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminPageShell>
    );
}
