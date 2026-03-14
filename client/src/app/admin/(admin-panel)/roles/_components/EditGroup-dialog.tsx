import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { RbacPageCatalogItem } from "@/types/rbac";

export type EditGroupForm = {
    id: number;
    name: string;
    url: string;
    icon: string;
    description: string;
    status: string;
    pageId: number | null;
};

type EditGroupDialogProps = {
    open: boolean;
    onClose: () => void;
    form: EditGroupForm | null;
    setForm: (value: EditGroupForm) => void;
    pages: RbacPageCatalogItem[];
    isSaving: boolean;
    onSave: () => Promise<void>;
};

export default function EditGroupDialog({ open, onClose, form, setForm, pages, isSaving, onSave }: EditGroupDialogProps) {
    if (!form) return null;

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Chuyển trang - <span className="font-normal text-muted-foreground">{form.name}</span>
                    </DialogTitle>
                    <DialogDescription>Chọn trang cha mới cho nhóm quyền này.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="eg-page">Trang cha</Label>
                        <select
                            id="eg-page"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={form.pageId ?? ""}
                            onChange={(e) => setForm({ ...form, pageId: e.target.value !== "" ? Number(e.target.value) : null })}
                        >
                            <option value="">Không thuộc trang nào</option>
                            {pages.map((page) => (
                                <option key={page.id} value={page.id}>
                                    {page.title}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Nhóm này đang thuộc: <span className="font-medium text-foreground">{pages.find((p) => p.id === form.pageId)?.title ?? "(Không có trang cha)"}</span>
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Hủy
                    </Button>
                    <Button onClick={() => void onSave()} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
