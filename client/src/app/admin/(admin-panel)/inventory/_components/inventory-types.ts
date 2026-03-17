export type SupplierStatus = "ACTIVE" | "INACTIVE" | "DISABLED";
export type DeliveryStatus = "PENDING" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "INACTIVE";

export interface SupplierRow {
    id: number;
    name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    status: SupplierStatus;
}

export interface ProductOption {
    id: number;
    name: string;
    supplierId: number;
    supplierName: string;
}

export interface VariantOption {
    id: number;
    sku: string;
    quantity: number;
    price: number;
    label: string;
}

export interface ImportDetailRow {
    id: number;
    quantity: number;
    unitPrice: number;
    variantId: number;
    nameSnapshot: string;
    imageSnapshot: string;
    variantSnapshot: string;
}

export interface ImportRow {
    id: number;
    description: string;
    status: DeliveryStatus;
    totalAmount: number;
    createdAt: string;
    productId: number;
    productName: string;
    supplierId: number;
    supplierName: string;
    itemCount: number;
}

export interface ImportDetailDialogData extends ImportRow {
    details: ImportDetailRow[];
}

export interface SupplierFormValues {
    id?: number;
    name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    status: SupplierStatus;
}

export interface ImportLineForm {
    variantId: string;
    quantity: string;
    unitPrice: string;
}

export interface ImportFormValues {
    productId: string;
    description: string;
    lines: ImportLineForm[];
}

export const EMPTY_SUPPLIER_FORM: SupplierFormValues = {
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    province: "",
    status: "ACTIVE",
};

export const EMPTY_IMPORT_FORM: ImportFormValues = {
    productId: "",
    description: "",
    lines: [{ variantId: "", quantity: "1", unitPrice: "0" }],
};
