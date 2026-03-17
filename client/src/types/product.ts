import type { ApiResponse, PageResponse } from "@/types/api";

export interface Product {
    id: number;
    name: string;
    listPrice: string;
    salePrice: string;
    description: string;
    urlVideo: string | null;
    urlImageCover: string;
    soldQuantity: number;
    avgRating: number;
    status: string;
    categoryId: number;
    supplierId: number;
    createdAt: string;
    updateAt: string;
}

export interface ProductListResponse {
    status: ApiResponse<PageResponse<Product>>["status"];
    message: ApiResponse<PageResponse<Product>>["message"];
    data: PageResponse<Product>;
}

// -----------------------Product detail--------------------------
export interface CategoryParent {
    id: number;
    name: string;
}

export interface AttributeValue {
    id: number;
    value: string;
}

export interface Attribute {
    id: number;
    name: string;
    attributeValue: AttributeValue[];
}

export interface VariantAttribute {
    id: number;
    attribute: string;
    value: string;
}

export interface ProductVariant {
    id: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    price: string;
    quantity: number;
    sku: string;
    variantAttributes: VariantAttribute[];
}

export interface ProductDetail {
    id: number;
    name: string;
    description: string;
    listPrice: string;
    salePrice: string;
    status: string;
    categoryId: number;
    supplierId: number;
    video: string | null;
    coverImage: string;
    categoryParents: CategoryParent[];
    imageProduct: string[];
    soldQuantity: number;
    avgRating: number;
    attributes: Attribute[];
    productVariant: ProductVariant[];
    createAt: string;
    updateAt: string;
}

export interface ProductDetailResponse {
    status: ApiResponse<ProductDetail>["status"];
    message: ApiResponse<ProductDetail>["message"];
    data: ApiResponse<ProductDetail>["data"];
}
