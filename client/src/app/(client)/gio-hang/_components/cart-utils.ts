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

export function getCartItemAttributes(item: CartItem) {
    if (item.attributes && Object.keys(item.attributes).length > 0) {
        return Object.entries(item.attributes).map(([key, value]) => ({ key, value }));
    }

    return (item.product_variant?.variantAttributes ?? []).map((attribute) => ({
        key: attribute.attribute,
        value: attribute.value,
    }));
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
