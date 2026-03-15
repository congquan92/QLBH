import { UserAddress } from "@/types/user";

export function formatDateTime(value?: string) {
    if (!value) return "Chưa cập nhật";

    const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("vi-VN", { hour12: false });
}

export function formatDate(value?: string) {
    if (!value) return "Chưa cập nhật";

    const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("vi-VN");
}

export function getAddressText(address: UserAddress) {
    return [address.address ?? address.detail, address.ward ?? address.wardName, address.district ?? address.districtName, address.province ?? address.provinceName].filter(Boolean).join(", ");
}

export function parseVariantSnapshot(value?: string) {
    if (!value) return [] as Array<{ key: string; value: string }>;

    try {
        const parsed = JSON.parse(value) as Record<string, unknown>;
        return Object.entries(parsed).map(([key, entryValue]) => ({ key, value: String(entryValue) }));
    } catch {
        return [];
    }
}

export function getDeliveryStatusMeta(status?: string) {
    switch (status) {
        case "PENDING":
            return { label: "Chờ xác nhận", className: "border-yellow-200 bg-yellow-50 text-yellow-700" };
        case "CONFIRMED":
            return { label: "Đã xác nhận", className: "border-blue-200 bg-blue-50 text-blue-700" };
        case "PROCESSING":
            return { label: "Đang xử lý", className: "border-indigo-200 bg-indigo-50 text-indigo-700" };
        case "SHIPPING":
            return { label: "Đang giao", className: "border-cyan-200 bg-cyan-50 text-cyan-700" };
        case "DELIVERED":
            return { label: "Đã giao", className: "border-green-200 bg-green-50 text-green-700" };
        case "CANCELLED":
            return { label: "Đã hủy", className: "border-red-200 bg-red-50 text-red-700" };
        default:
            return { label: status || "Chưa rõ", className: "border-gray-200 bg-gray-50 text-gray-700" };
    }
}

export function getPaymentStatusMeta(status?: string) {
    switch (status) {
        case "PAID":
            return { label: "Đã thanh toán", className: "border-green-200 bg-green-50 text-green-700" };
        case "UNPAID":
            return { label: "Chưa thanh toán", className: "border-orange-200 bg-orange-50 text-orange-700" };
        default:
            return { label: status || "Chưa rõ", className: "border-gray-200 bg-gray-50 text-gray-700" };
    }
}

export function getVerificationMeta(value?: boolean) {
    return value ? { label: "Đã xác minh", className: "border-green-200 bg-green-50 text-green-700" } : { label: "Chưa xác minh", className: "border-gray-200 bg-gray-50 text-gray-700" };
}
