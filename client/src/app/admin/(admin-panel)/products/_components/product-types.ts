export type ProductFormValues = {
    id?: number;
    name: string;
    description: string;
    listPrice: string;
    salePrice: string;
    categoryId: string;
    supplierId: string;
    video: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    coverImage: string;
    imageProduct: string[];
    attributes: ProductAttributeInput[];
    productVariant: ProductVariantInput[];
};

export type ProductAttributeValueInput = {
    key: string;
    id?: number;
    value: string;
    image: string;
};

export type ProductAttributeInput = {
    key: string;
    id?: number;
    name: string;
    values: ProductAttributeValueInput[];
};

export type ProductVariantAttributeInput = {
    key: string;
    attribute: string;
    value: string;
};

export type ProductVariantInput = {
    key: string;
    id?: number;
    sku: string;
    price: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    variantAttributes: ProductVariantAttributeInput[];
};

export type CategoryOption = {
    id: number;
    name: string;
    label: string;
    status: string;
};

export type SupplierOption = {
    id: number;
    name: string;
    status: string;
};

export type ProductImageItem = {
    key: string;
    url: string;
    previewUrl: string;
    fileName: string;
    isUploading: boolean;
    file?: File;
};
