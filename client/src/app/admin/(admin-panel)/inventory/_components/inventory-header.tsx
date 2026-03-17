import { Button } from "@/components/ui/button";
import { Helper } from "@/lib/helper";
import { Boxes, Building2, Plus, Truck } from "lucide-react";

type InventoryHeaderProps = {
    supplierCount: number;
    importCount: number;
    pendingCount: number;
    totalAmount: number;
    onCreateSupplier: () => void;
    onCreateImport: () => void;
};

export function InventoryHeader({ supplierCount, importCount, pendingCount, totalAmount, onCreateSupplier, onCreateImport }: InventoryHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-linear-to-r from-amber-50 via-orange-50 to-rose-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">Trung tâm điều phối kho</h2>
                        <p className="max-w-3xl text-sm text-muted-foreground">Theo dõi phiếu nhập, quản lý nhà cung cấp và xử lý trạng thái nhập kho ngay trên một màn hình.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={onCreateSupplier} variant="outline">
                            <Building2 className="mr-2 h-4 w-4" />
                            Thêm nhà cung cấp
                        </Button>
                        <Button onClick={onCreateImport}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo phiếu nhập
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Nhà cung cấp hoạt động</p>
                    <div className="mt-2 flex items-center gap-2 text-xl font-semibold">
                        <Building2 className="h-4 w-4 text-orange-500" />
                        {Helper.formatNumber(supplierCount)}
                    </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Tổng phiếu nhập</p>
                    <div className="mt-2 flex items-center gap-2 text-xl font-semibold">
                        <Boxes className="h-4 w-4 text-cyan-500" />
                        {Helper.formatNumber(importCount)}
                    </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Chờ xử lý</p>
                    <div className="mt-2 flex items-center gap-2 text-xl font-semibold">
                        <Truck className="h-4 w-4 text-amber-500" />
                        {Helper.formatNumber(pendingCount)}
                    </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Tổng giá trị nhập</p>
                    <div className="mt-2 text-xl font-semibold">{Helper.formatCurrency(totalAmount)}</div>
                </div>
            </div>
        </div>
    );
}
