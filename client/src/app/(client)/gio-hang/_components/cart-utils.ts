import { CartItem } from "@/types/cart";
import { UserAddress } from "@/types/user";

export type NewAddressForm = {
    customer_name: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    province_id: string;
    district_id: string;
    ward_id: string;
    address: string;
};

export function getAddressValue(address: UserAddress) {
    return {
        customerName: String(address.customerName ?? address.customer_name ?? address.fullName ?? "").trim(),
        phone: String(address.phoneNumber ?? address.phone_number ?? address.phone ?? "").trim(),
        province: String(address.province ?? address.provinceName ?? "").trim(),
        district: String(address.district ?? address.districtName ?? "").trim(),
        ward: String(address.ward ?? address.wardName ?? "").trim(),
        provinceId: Number(address.provinceId ?? address.province_id ?? 0),
        districtId: Number(address.districtId ?? address.district_id ?? 0),
        wardId: Number(address.wardId ?? address.ward_id ?? 0),
        detail: String(address.address ?? address.detail ?? "").trim(),
    };
}

export function getCartItemVariantId(item: CartItem) {
    return Number(item.productVariantId ?? item.product_variant_id ?? 0);
}

export function getCartItemName(item: CartItem) {
    return item.name ?? item.nameProductSnapshot ?? "Sản phẩm trong giỏ hàng";
}

export function getCartItemImage(item: CartItem) {
    return item.image ?? item.urlImageSnapshot ?? "";
}

export function getCartItemPrice(item: CartItem) {
    return Number(item.price ?? item.listPriceSnapshot ?? item.product_variant?.price ?? 0);
}

function toAttributeDisplayValue(value: unknown) {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (typeof value === "object") {
        const record = value as Record<string, unknown>;
        const nestedCandidates = [record.value, record.name, record.label];
        for (const candidate of nestedCandidates) {
            if (typeof candidate === "string" || typeof candidate === "number" || typeof candidate === "boolean") {
                return String(candidate);
            }
        }
    }

    return "";
}

function extractVariantAttributes(value: unknown) {
    if (!Array.isArray(value)) {
        return [] as Array<{ key: string; value: string }>;
    }

    return value
        .map((entry) => {
            if (!entry || typeof entry !== "object") {
                return null;
            }

            const record = entry as Record<string, unknown>;
            const key = toAttributeDisplayValue(record.attribute ?? record.key ?? record.name);
            const attributeValue = toAttributeDisplayValue(record.value ?? record.label);
            if (key === "" || attributeValue === "") {
                return null;
            }

            return { key, value: attributeValue };
        })
        .filter((attribute): attribute is { key: string; value: string } => Boolean(attribute));
}

export function getCartItemAttributes(item: CartItem) {
    const rawAttributes = item.attributes && typeof item.attributes === "object" ? (item.attributes as Record<string, unknown>) : null;
    const nestedAttributes = extractVariantAttributes(rawAttributes?.variantAttributes);

    if (nestedAttributes.length > 0) {
        return nestedAttributes;
    }

    if (rawAttributes && Object.keys(rawAttributes).length > 0) {
        return Object.entries(rawAttributes)
            .filter(([key]) => key !== "variantAttributes")
            .map(([key, value]) => ({
                key,
                value: toAttributeDisplayValue(value),
            }))
            .filter((attribute) => attribute.value !== "");
    }

    return (item.product_variant?.variantAttributes ?? [])
        .map((attribute) => ({
            key: toAttributeDisplayValue(attribute.attribute),
            value: toAttributeDisplayValue(attribute.value),
        }))
        .filter((attribute) => attribute.key !== "" && attribute.value !== "");
}

export function isCartItemAvailable(item: CartItem) {
    return Boolean(item.is_available ?? true) && (item.status ?? "ACTIVE") === "ACTIVE";
}

export function getCartLineTotal(item: CartItem) {
    return getCartItemPrice(item) * item.quantity;
}

export function getCartItemStock(item: CartItem) {
    const stock = Number(item.product_variant?.quantity);
    if (!Number.isFinite(stock) || stock < 0) {
        return undefined;
    }

    return stock;
}

export function getOrderItemsFromCart(cartItems: CartItem[]) {
    return cartItems
        .map((item) => ({
            productVariantId: getCartItemVariantId(item),
            quantity: item.quantity,
        }))
        .filter((item) => item.productVariantId > 0);
}

export function extractOrderId(value: unknown): number | null {
    if (!value || typeof value !== "object") {
        return null;
    }

    const record = value as Record<string, unknown>;
    const candidates = [record.id, record.orderId, record.order_id];
    for (const candidate of candidates) {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }

    return null;
}
