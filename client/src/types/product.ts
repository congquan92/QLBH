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
    createdAt: string;
    updateAt: string;
}

export interface ProductListResponse {
    status: number;
    message: string;
    data: {
        data: Product[];
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalElements: number;
    };
}
