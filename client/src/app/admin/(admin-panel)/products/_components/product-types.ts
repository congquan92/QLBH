export type ProductFormValues = {
    id?: number;
    name: string;
    description: string;
    listPrice: string;
    salePrice: string;
    categoryId: string;
    supplierId: string;
    coverImage: string;
    imageProduct: string[];
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
};
