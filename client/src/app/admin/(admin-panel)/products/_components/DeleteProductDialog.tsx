import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/types/product";

type DeleteProductDialogProps = {
    product: Product | null;
    isSaving: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function DeleteProductDialog({ product, isSaving, onClose, onConfirm }: DeleteProductDialogProps) {
    const isSold = Boolean(product && Number(product.soldQuantity) > 0);

    return (
        <Dialog
            open={Boolean(product)}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Xác nhận xoá sản phẩm</DialogTitle>
                    <DialogDescription>{isSold ? "Sản phẩm đã có lượt bán. Hệ thống sẽ chuyển trạng thái sang ẩn khỏi web và bạn có thể khôi phục sau." : "Sản phẩm chưa có lượt bán. Hệ thống sẽ xoá vĩnh viễn sản phẩm này."}</DialogDescription>
                </DialogHeader>

                {product && (
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-muted-foreground">Mã sản phẩm #{product.id}</p>
                        <p className="text-muted-foreground">Đã bán: {product.soldQuantity}</p>
                    </div>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Huỷ
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSaving}>
                        Xác nhận xoá
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
