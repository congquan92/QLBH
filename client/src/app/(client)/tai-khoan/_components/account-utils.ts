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

function toText(input: unknown): string {
    if (input == null) return "";
    if (typeof input === "string") return input;
    if (typeof input === "number" || typeof input === "boolean") return String(input);
    try {
        return JSON.stringify(input);
    } catch {
        return String(input);
    }
}

type VariantEntry = { key: string; value: string };

function pushVariant(entries: VariantEntry[], key: string, rawValue: unknown) {
    const normalizedKey = String(key || "Phân loại").trim() || "Phân loại";

    if (rawValue == null) return;

    if (typeof rawValue !== "object") {
        const valueText = toText(rawValue).trim();
        if (valueText) entries.push({ key: normalizedKey, value: valueText });
        return;
    }

    if (Array.isArray(rawValue)) {
        rawValue.forEach((item) => {
            if (item && typeof item === "object" && "attribute" in item && "value" in item) {
                const attr = toText((item as { attribute?: unknown }).attribute).trim() || normalizedKey;
                const val = toText((item as { value?: unknown }).value).trim();
                if (val) entries.push({ key: attr, value: val });
                return;
            }
            const itemText = toText(item).trim();
            if (itemText) entries.push({ key: normalizedKey, value: itemText });
        });
        return;
    }

    const obj = rawValue as Record<string, unknown>;
    if ("attribute" in obj && "value" in obj) {
        const attr = toText(obj.attribute).trim() || normalizedKey;
        const val = toText(obj.value).trim();
        if (val) entries.push({ key: attr, value: val });
        return;
    }

    if ("value" in obj && (typeof obj.value === "string" || typeof obj.value === "number" || typeof obj.value === "boolean")) {
        const val = toText(obj.value).trim();
        if (val) entries.push({ key: normalizedKey, value: val });
        return;
    }

    const nestedVariantAttributes = obj.variantAttributes;
    if (Array.isArray(nestedVariantAttributes)) {
        pushVariant(entries, normalizedKey, nestedVariantAttributes);
        return;
    }

    Object.entries(obj).forEach(([nestedKey, nestedValue]) => {
        pushVariant(entries, nestedKey, nestedValue);
    });
}

export function parseVariantSnapshot(value?: unknown) {
    if (!value) return [] as VariantEntry[];

    const parsedValue = (() => {
        if (typeof value !== "string") return value;
        try {
            return JSON.parse(value) as unknown;
        } catch {
            return null;
        }
    })();

    if (!parsedValue || typeof parsedValue !== "object") {
        return [] as VariantEntry[];
    }

    const entries: VariantEntry[] = [];
    pushVariant(entries, "Phân loại", parsedValue);
    return entries;
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
