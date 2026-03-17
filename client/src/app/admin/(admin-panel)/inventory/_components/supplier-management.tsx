import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SupplierFormValues, SupplierRow } from "./inventory-types";

type SupplierManagementProps = {
    suppliers: SupplierRow[];
    isLoading: boolean;
    isSaving: boolean;
    onRefresh: () => Promise<void>;
    onCreate: (payload: SupplierFormValues) => Promise<void>;
    onUpdate: (id: number, payload: SupplierFormValues) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    createOpen: boolean;
    onCreateOpenChange: (open: boolean) => void;
};

const EMPTY_FORM: SupplierFormValues = {
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    province: "",
    status: "ACTIVE",
};

function supplierStatusBadge(status: string) {
    if (status === "DISABLED") return "bg-rose-100 text-rose-700";
    if (status === "INACTIVE") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
}

export function SupplierManagement({ suppliers, isLoading, isSaving, onRefresh, onCreate, onUpdate, onDelete, createOpen, onCreateOpenChange }: SupplierManagementProps) {
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState<string>("all");
    const [form, setForm] = useState<SupplierFormValues>(EMPTY_FORM);

    const filtered = useMemo(() => {
        const search = keyword.trim().toLowerCase();
        return suppliers.filter((item) => {
            const passStatus = status === "all" ? true : item.status === status;
            const passKeyword = search.length === 0 ? true : [item.name, item.phone, item.address, item.district, item.province].join(" ").toLowerCase().includes(search);
            return passStatus && passKeyword;
        });
    }, [keyword, status, suppliers]);

    function startEdit(item: SupplierRow) {
        setForm({
            id: item.id,
            name: item.name,
            phone: item.phone,
            address: item.address,
            ward: item.ward,
            district: item.district,
            province: item.province,
            status: item.status,
        });
        onCreateOpenChange(true);
    }

    async function submitForm() {
        if (!form.name.trim()) return;
        if (!form.phone.trim()) return;

        if (form.id) {
            await onUpdate(form.id, form);
        } else {
            await onCreate(form);
        }
        onCreateOpenChange(false);
        setForm(EMPTY_FORM);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle>Nhà cung cấp</CardTitle>
                        <CardDescription>Quản lý đối tác cung ứng, thông tin liên hệ và trạng thái hoạt động.</CardDescription>
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
                <div className="grid gap-2 md:grid-cols-3">
                    <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên, số điện thoại, địa chỉ..." />
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                            <SelectItem value="DISABLED">DISABLED</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground md:justify-self-end md:self-center">{filtered.length} bản ghi</div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Nhà cung cấp</th>
                                <th className="px-4 py-3">Liên hệ</th>
                                <th className="px-4 py-3">Địa chỉ</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id} className="border-b align-top">
                                    <td className="px-4 py-3 font-medium">#{item.id}</td>
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3">
                                        <p>{item.phone || "-"}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{[item.address, item.ward, item.district, item.province].filter(Boolean).join(", ") || "-"}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={supplierStatusBadge(item.status)}>{item.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={isSaving || item.status === "DISABLED"}
                                                onClick={() => {
                                                    if (!confirm(`Vô hiệu hóa nhà cung cấp #${item.id}?`)) return;
                                                    void onDelete(item.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filtered.length === 0 && (
                                <tr>
                                    <td className="px-4 py-8 text-muted-foreground" colSpan={6}>
                                        Không có dữ liệu nhà cung cấp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {isLoading && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải danh sách nhà cung cấp...
                    </div>
                )}
            </CardContent>

            <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{form.id ? `Cập nhật nhà cung cấp #${form.id}` : "Thêm nhà cung cấp"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Tên nhà cung cấp</Label>
                            <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Số điện thoại</Label>
                            <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Địa chỉ</Label>
                            <Input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phường / Xã</Label>
                            <Input value={form.ward} onChange={(event) => setForm((prev) => ({ ...prev, ward: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Quận / Huyện</Label>
                            <Input value={form.district} onChange={(event) => setForm((prev) => ({ ...prev, district: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tỉnh / Thành phố</Label>
                            <Input value={form.province} onChange={(event) => setForm((prev) => ({ ...prev, province: event.target.value }))} />
                        </div>
                        {form.id && (
                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as SupplierFormValues["status"] }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                        <SelectItem value="DISABLED">DISABLED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onCreateOpenChange(false)}>
                            Đóng
                        </Button>
                        <Button disabled={isSaving} onClick={() => void submitForm()}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {form.id ? "Lưu thay đổi" : "Tạo mới"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
