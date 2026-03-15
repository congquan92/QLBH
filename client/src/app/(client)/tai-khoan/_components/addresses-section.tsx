import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAddress } from "@/types/user";
import { Loader2, Save } from "lucide-react";
import { getAddressText } from "./account-utils";

type AddressFormState = {
    customer_name: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    province_id: string;
    district_id: string;
    ward_id: string;
    address: string;
    address_type: string;
};

interface AddressesSectionProps {
    form: AddressFormState;
    addresses: UserAddress[];
    isSavingAddress: boolean;
    onFormChange: (updater: (current: AddressFormState) => AddressFormState) => void;
    onAddAddress: () => void;
    onSetDefault: (addressId: number) => void;
    onDeleteAddress: (addressId: number) => void;
}

export function AddressesSection({ form, addresses, isSavingAddress, onFormChange, onAddAddress, onSetDefault, onDeleteAddress }: AddressesSectionProps) {
    return (
        <div className="space-y-6">
            <section className="border border-gray-200 bg-white p-6">
                <h2 className="text-2xl font-semibold text-gray-900">Thêm địa chỉ mới</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Người nhận</Label>
                        <Input value={form.customer_name} onChange={(event) => onFormChange((current) => ({ ...current, customer_name: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input value={form.phone} onChange={(event) => onFormChange((current) => ({ ...current, phone: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tỉnh/Thành</Label>
                        <Input value={form.province} onChange={(event) => onFormChange((current) => ({ ...current, province: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Mã tỉnh</Label>
                        <Input value={form.province_id} onChange={(event) => onFormChange((current) => ({ ...current, province_id: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Quận/Huyện</Label>
                        <Input value={form.district} onChange={(event) => onFormChange((current) => ({ ...current, district: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Mã quận</Label>
                        <Input value={form.district_id} onChange={(event) => onFormChange((current) => ({ ...current, district_id: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Phường/Xã</Label>
                        <Input value={form.ward} onChange={(event) => onFormChange((current) => ({ ...current, ward: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Mã phường</Label>
                        <Input value={form.ward_id} onChange={(event) => onFormChange((current) => ({ ...current, ward_id: event.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Địa chỉ chi tiết</Label>
                        <Input value={form.address} onChange={(event) => onFormChange((current) => ({ ...current, address: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Loại địa chỉ</Label>
                        <Input value={form.address_type} onChange={(event) => onFormChange((current) => ({ ...current, address_type: event.target.value }))} placeholder="HOME / WORK" />
                    </div>
                </div>
                <Button className="mt-6 rounded-none bg-red-600 hover:bg-red-700" onClick={onAddAddress} disabled={isSavingAddress}>
                    {isSavingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Lưu địa chỉ
                </Button>
            </section>

            <section className="border border-gray-200 bg-white p-6">
                <h2 className="text-2xl font-semibold text-gray-900">Danh sách địa chỉ</h2>
                <div className="mt-6 space-y-4">
                    {addresses.length === 0 ? (
                        <div className="border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">Bạn chưa có địa chỉ giao hàng nào.</div>
                    ) : (
                        addresses.map((address) => (
                            <article key={address.id} className="border border-gray-200 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{address.customer_name || address.customerName || address.fullName || "Địa chỉ giao hàng"}</h3>
                                        <p className="mt-1 text-sm text-gray-600">{address.phone_number || address.phoneNumber || address.phone}</p>
                                        <p className="mt-3 text-sm text-gray-600">{getAddressText(address)}</p>
                                    </div>
                                    {address.is_default === 1 || address.is_default === true || address.isDefault ? (
                                        <span className="border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Mặc định</span>
                                    ) : null}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {!(address.is_default === 1 || address.is_default === true || address.isDefault) ? (
                                        <Button variant="outline" className="rounded-none" onClick={() => onSetDefault(address.id)}>
                                            Đặt mặc định
                                        </Button>
                                    ) : null}
                                    <Button variant="ghost" className="rounded-none text-red-600 hover:text-red-700" onClick={() => onDeleteAddress(address.id)}>
                                        Xóa địa chỉ
                                    </Button>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
