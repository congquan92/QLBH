import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helper } from "@/lib/helper";
import { Eye, Loader2, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { DeliveryStatus, ImportDetailDialogData, ImportFormValues, ImportRow, ProductOption, SupplierRow, VariantOption } from "./inventory-types";

type CreateImportPayload = {
    product_id: number;
    description: string;
    import_details: Array<{
        product_variant_id: number;
        quantity: number;
        unitPrice: number;
    }>;
};

type ImportManagementProps = {
    imports: ImportRow[];
    suppliers: SupplierRow[];
    products: ProductOption[];
    isLoading: boolean;
    isSaving: boolean;
    onRefresh: () => Promise<void>;
    loadVariantsForProduct: (productId: number) => Promise<VariantOption[]>;
    onCreate: (payload: CreateImportPayload) => Promise<void>;
    onGetDetail: (id: number) => Promise<ImportDetailDialogData>;
    onConfirm: (id: number) => Promise<void>;
    onCancel: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onUpdateQuantities: (id: number, items: Array<{ importDetailId: number; quantity: number }>) => Promise<void>;
    createOpen: boolean;
    onCreateOpenChange: (open: boolean) => void;
};

const EMPTY_FORM: ImportFormValues = {
    productId: "",
    description: "",
    lines: [{ variantId: "", quantity: "1", unitPrice: "0" }],
};

function statusBadgeClass(status: string) {
    if (status === "PENDING") return "bg-amber-100 text-amber-700";
    if (status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
    if (status === "CANCELLED") return "bg-rose-100 text-rose-700";
    return "bg-slate-100 text-slate-700";
}

function parseSnapshot(value: string): string {
    const raw = String(value || "").trim();
    if (!raw) return "-";
    try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return Object.entries(parsed)
            .slice(0, 8)
            .map(([key, val]) => `${key}: ${String(val ?? "-")}`)
            .join(" | ");
    } catch {
        return raw;
    }
}

export function ImportManagement({
    imports,
    suppliers,
    products,
    isLoading,
    isSaving,
    onRefresh,
    loadVariantsForProduct,
    onCreate,
    onGetDetail,
    onConfirm,
    onCancel,
    onDelete,
    onUpdateQuantities,
    createOpen,
    onCreateOpenChange,
}: ImportManagementProps) {
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState<string>("all");
    const [supplierId, setSupplierId] = useState<string>("all");

    const [form, setForm] = useState<ImportFormValues>(EMPTY_FORM);
    const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailData, setDetailData] = useState<ImportDetailDialogData | null>(null);
    const [editedQuantities, setEditedQuantities] = useState<Record<number, number>>({});

    const filtered = useMemo(() => {
        const search = keyword.trim().toLowerCase();
        return imports.filter((item) => {
            const passStatus = status === "all" ? true : item.status === status;
            const passSupplier = supplierId === "all" ? true : String(item.supplierId) === supplierId;
            const passKeyword = search.length === 0 ? true : [item.description, item.productName, item.supplierName, String(item.id)].join(" ").toLowerCase().includes(search);
            return passStatus && passSupplier && passKeyword;
        });
    }, [imports, keyword, status, supplierId]);

    async function onProductChange(nextProductId: string) {
        setForm((prev) => ({ ...prev, productId: nextProductId, lines: [{ variantId: "", quantity: "1", unitPrice: "0" }] }));
        setVariantOptions([]);
        if (!nextProductId) return;

        setLoadingVariants(true);
        try {
            const rows = await loadVariantsForProduct(Number(nextProductId));
            setVariantOptions(rows);
        } finally {
            setLoadingVariants(false);
        }
    }

    function addLine() {
        setForm((prev) => ({ ...prev, lines: [...prev.lines, { variantId: "", quantity: "1", unitPrice: "0" }] }));
    }

    function removeLine(index: number) {
        setForm((prev) => ({ ...prev, lines: prev.lines.filter((_, lineIndex) => lineIndex !== index) }));
    }

    async function submitCreate() {
        if (!form.productId) return;

        const normalizedLines = form.lines
            .map((line) => ({
                product_variant_id: Number(line.variantId),
                quantity: Number(line.quantity),
                unitPrice: Number(line.unitPrice),
            }))
            .filter((line) => Number.isFinite(line.product_variant_id) && line.product_variant_id > 0 && Number.isFinite(line.quantity) && line.quantity > 0 && Number.isFinite(line.unitPrice) && line.unitPrice >= 0);

        if (normalizedLines.length === 0) return;

        await onCreate({
            product_id: Number(form.productId),
            description: form.description,
            import_details: normalizedLines,
        });

        onCreateOpenChange(false);
        setVariantOptions([]);
        setForm(EMPTY_FORM);
    }

    async function openDetail(id: number) {
        setLoadingDetail(true);
        setDetailOpen(true);
        try {
            const detail = await onGetDetail(id);
            setDetailData(detail);
            setEditedQuantities(Object.fromEntries(detail.details.map((item) => [item.id, item.quantity])));
        } finally {
            setLoadingDetail(false);
        }
    }

    async function saveQuantities() {
        if (!detailData) return;
        const payload = detailData.details.map((item) => ({ importDetailId: item.id, quantity: Math.max(1, Number(editedQuantities[item.id] ?? item.quantity)) }));
        await onUpdateQuantities(detailData.id, payload);
        const refreshed = await onGetDetail(detailData.id);
        setDetailData(refreshed);
        setEditedQuantities(Object.fromEntries(refreshed.details.map((item) => [item.id, item.quantity])));
    }

    async function doConfirm() {
        if (!detailData) return;
        await onConfirm(detailData.id);
        setDetailOpen(false);
    }

    async function doCancel() {
        if (!detailData) return;
        await onCancel(detailData.id);
        setDetailOpen(false);
    }

    async function doDelete() {
        if (!detailData) return;
        if (!confirm(`Xóa phiếu nhập #${detailData.id}?`)) return;
        await onDelete(detailData.id);
        setDetailOpen(false);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle>Phiếu nhập kho</CardTitle>
                        <CardDescription>Tạo phiếu nhập, cập nhật số lượng, xác nhận nhập kho và theo dõi trạng thái xử lý.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => void onRefresh()} disabled={isLoading}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Làm mới
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid gap-2 md:grid-cols-4">
                    <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo mã phiếu, tên sản phẩm, nhà cung cấp..." className="md:col-span-2" />
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            {(["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"] as Array<DeliveryStatus>).map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Lọc nhà cung cấp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                            {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={String(supplier.id)}>
                                    {supplier.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Sản phẩm</th>
                                <th className="px-4 py-3">Nhà cung cấp</th>
                                <th className="px-4 py-3">Ngày tạo</th>
                                <th className="px-4 py-3">Chi tiết</th>
                                <th className="px-4 py-3">Tổng tiền</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id} className="border-b align-top">
                                    <td className="px-4 py-3 font-medium">#{item.id}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{item.productName || "-"}</p>
                                        <p className="text-xs text-muted-foreground">{item.description || "Không có mô tả"}</p>
                                    </td>
                                    <td className="px-4 py-3">{item.supplierName || "-"}</td>
                                    <td className="px-4 py-3">{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "-"}</td>
                                    <td className="px-4 py-3">{item.itemCount} dòng</td>
                                    <td className="px-4 py-3 font-medium">{Helper.formatCurrency(item.totalAmount)}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={statusBadgeClass(item.status)}>{item.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button variant="outline" size="sm" onClick={() => void openDetail(item.id)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Chi tiết
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filtered.length === 0 && (
                                <tr>
                                    <td className="px-4 py-8 text-muted-foreground" colSpan={8}>
                                        Không có dữ liệu phiếu nhập.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {isLoading && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải danh sách phiếu nhập...
                    </div>
                )}
            </CardContent>

            <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Tạo phiếu nhập mới</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Sản phẩm</Label>
                            <Select value={form.productId} onValueChange={(value) => void onProductChange(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn sản phẩm" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={String(product.id)}>
                                            {product.name} - NCC: {product.supplierName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Mô tả phiếu nhập</Label>
                            <Input value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Nhập mô tả ngắn cho phiếu nhập" />
                        </div>
                    </div>

                    <div className="space-y-3 rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Danh sách biến thể nhập</h4>
                            <Button variant="outline" size="sm" onClick={addLine}>
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm dòng
                            </Button>
                        </div>

                        {loadingVariants && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải biến thể...
                            </div>
                        )}

                        <div className="space-y-2">
                            {form.lines.map((line, index) => (
                                <div key={`${index}-${line.variantId}`} className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto]">
                                    <Select
                                        value={line.variantId}
                                        onValueChange={(value) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                lines: prev.lines.map((item, lineIndex) => (lineIndex === index ? { ...item, variantId: value } : item)),
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn biến thể" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {variantOptions.map((variant) => (
                                                <SelectItem key={variant.id} value={String(variant.id)}>
                                                    {variant.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={line.quantity}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                lines: prev.lines.map((item, lineIndex) => (lineIndex === index ? { ...item, quantity: event.target.value } : item)),
                                            }))
                                        }
                                        placeholder="Số lượng"
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        value={line.unitPrice}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                lines: prev.lines.map((item, lineIndex) => (lineIndex === index ? { ...item, unitPrice: event.target.value } : item)),
                                            }))
                                        }
                                        placeholder="Đơn giá"
                                    />
                                    <Button type="button" variant="outline" size="icon" disabled={form.lines.length === 1} onClick={() => removeLine(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onCreateOpenChange(false)}>
                            Đóng
                        </Button>
                        <Button disabled={isSaving} onClick={() => void submitCreate()}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Tạo phiếu nhập
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[95vw] lg:max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>Chi tiết phiếu nhập #{detailData?.id ?? "-"}</DialogTitle>
                    </DialogHeader>

                    {loadingDetail && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải chi tiết phiếu nhập...
                        </div>
                    )}

                    {detailData && !loadingDetail && (
                        <div className="space-y-4 text-sm">
                            <div className="grid gap-3 md:grid-cols-4">
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Sản phẩm</p>
                                    <p className="font-medium">{detailData.productName || "-"}</p>
                                </div>
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Nhà cung cấp</p>
                                    <p className="font-medium">{detailData.supplierName || "-"}</p>
                                </div>
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Trạng thái</p>
                                    <div className="mt-1">
                                        <Badge className={statusBadgeClass(detailData.status)}>{detailData.status}</Badge>
                                    </div>
                                </div>
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Tổng tiền</p>
                                    <p className="font-semibold">{Helper.formatCurrency(detailData.totalAmount)}</p>
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <div className="border-b p-3">
                                    <p className="font-medium">Chi tiết dòng nhập</p>
                                </div>
                                <div className="divide-y">
                                    {detailData.details.map((item) => (
                                        <div key={item.id} className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:items-center">
                                            <div>
                                                <p className="font-medium">{item.nameSnapshot || `Dòng #${item.id}`}</p>
                                                <p className="text-xs text-muted-foreground">{parseSnapshot(item.variantSnapshot)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Số lượng</p>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={editedQuantities[item.id] ?? item.quantity}
                                                    onChange={(event) => setEditedQuantities((prev) => ({ ...prev, [item.id]: Math.max(1, Number(event.target.value || 1)) }))}
                                                    disabled={detailData.status !== "PENDING"}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Đơn giá</p>
                                                <p className="font-medium">{Helper.formatCurrency(item.unitPrice)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Thành tiền</p>
                                                <p className="font-semibold">{Helper.formatCurrency((editedQuantities[item.id] ?? item.quantity) * item.unitPrice)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {detailData.details.length === 0 && <div className="p-3 text-muted-foreground">Không có chi tiết phiếu nhập.</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setDetailOpen(false)}>
                            Đóng
                        </Button>
                        {detailData?.status === "PENDING" && (
                            <>
                                <Button variant="outline" disabled={isSaving} onClick={() => void saveQuantities()}>
                                    Lưu số lượng
                                </Button>
                                <Button variant="destructive" disabled={isSaving} onClick={() => void doDelete()}>
                                    Xóa phiếu
                                </Button>
                                <Button variant="outline" disabled={isSaving} onClick={() => void doCancel()}>
                                    Hủy phiếu
                                </Button>
                                <Button disabled={isSaving} onClick={() => void doConfirm()}>
                                    Xác nhận nhập kho
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
