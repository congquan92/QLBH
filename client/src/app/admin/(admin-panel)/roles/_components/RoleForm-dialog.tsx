import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export type RoleFormState = {
    id?: number;
    name: string;
    description: string;
    status: string;
};

type RoleFormDialogProps = {
    open: boolean;
    isSaving: boolean;
    form: RoleFormState;
    onOpenChange: (open: boolean) => void;
    onFormChange: (next: RoleFormState) => void;
    onSubmit: () => void;
};

export function RoleFormDialog({ open, isSaving, form, onOpenChange, onFormChange, onSubmit }: RoleFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{form.id ? "Cập nhật vai trò" : "Tạo vai trò mới"}</DialogTitle>
                    <DialogDescription>{form.id ? "Chỉnh sửa thông tin cơ bản. Phân quyền được thực hiện trực tiếp trên bảng bên dưới." : "Nhập thông tin vai trò. Sau khi tạo, phân quyền trực tiếp trên bảng bên dưới."}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="dlg-role-name">Tên vai trò</Label>
                        <Input id="dlg-role-name" value={form.name} onChange={(e) => onFormChange({ ...form, name: e.target.value })} placeholder="VD: QUẢN LÝ KHO" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dlg-role-desc">Mô tả</Label>
                        <Input id="dlg-role-desc" value={form.description} onChange={(e) => onFormChange({ ...form, description: e.target.value })} placeholder="Mô tả ngắn về vai trò" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dlg-role-status">Trạng thái</Label>
                        <select id="dlg-role-status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => onFormChange({ ...form, status: e.target.value })}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {form.id ? "Lưu thay đổi" : "Tạo vai trò"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
