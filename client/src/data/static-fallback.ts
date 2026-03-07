import type { ApiResponse, PageResponse } from "@/types/api";
import type { CartItem } from "@/types/cart";
import type { Category } from "@/types/navbar";
import type { OrderSummary } from "@/types/order";
import type { Product, ProductDetail } from "@/types/product";
import type { Review } from "@/types/review";
import type { UserAddress, UserProfile } from "@/types/user";
import type { Voucher } from "@/types/voucher";

const nowIso = new Date().toISOString();

export const FALLBACK_PRODUCTS: Product[] = [
    {
        id: 999001,
        name: "Fallback Tee Black",
        listPrice: "399000",
        salePrice: "329000",
        description: "Static fallback product while API is unavailable.",
        urlVideo: null,
        urlImageCover: "/globe.svg",
        soldQuantity: 0,
        avgRating: 5,
        status: "ACTIVE",
        createdAt: nowIso,
        updateAt: nowIso,
    },
    {
        id: 999002,
        name: "Fallback Hoodie Gray",
        listPrice: "699000",
        salePrice: "599000",
        description: "Static fallback product while API is unavailable.",
        urlVideo: null,
        urlImageCover: "/window.svg",
        soldQuantity: 0,
        avgRating: 4.8,
        status: "ACTIVE",
        createdAt: nowIso,
        updateAt: nowIso,
    },
];

export const FALLBACK_PRODUCT_DETAIL: ProductDetail = {
    id: 999001,
    name: "Fallback Tee Black",
    description: "Static fallback detail. Please check backend API contract.",
    listPrice: "399000",
    salePrice: "329000",
    status: "ACTIVE",
    categoryId: 0,
    video: null,
    coverImage: "/globe.svg",
    categoryParents: [
        {
            id: 1,
            name: "Fallback Category",
        },
    ],
    imageProduct: ["/globe.svg", "/window.svg"],
    soldQuantity: 0,
    avgRating: 5,
    attributes: [
        {
            id: 1,
            name: "Size",
            attributeValue: [
                { id: 11, value: "M" },
                { id: 12, value: "L" },
            ],
        },
    ],
    productVariant: [
        {
            id: 1,
            weight: 200,
            length: 30,
            width: 20,
            height: 2,
            price: "329000",
            quantity: 10,
            sku: "FB-TEE-BLACK-M",
            variantAttributes: [
                {
                    id: 1,
                    attribute: "Size",
                    value: "M",
                },
            ],
        },
    ],
    createAt: nowIso,
    updateAt: nowIso,
};

export const FALLBACK_CATEGORIES: Category[] = [
    {
        id: 1,
        name: "Fallback Collection",
        status: "ACTIVE",
        createAt: nowIso,
        childCategory: [
            {
                id: 11,
                name: "Tops",
                status: "ACTIVE",
                createAt: nowIso,
                childCategory: [],
            },
            {
                id: 12,
                name: "Outerwear",
                status: "ACTIVE",
                createAt: nowIso,
                childCategory: [],
            },
        ],
    },
];

export const FALLBACK_ORDERS: OrderSummary[] = [
    {
        id: 880001,
        orderStatus: "PENDING",
        paymentStatus: "UNPAID",
        totalAmount: 329000,
        createdAt: nowIso,
        orderItem: [
            {
                id: 1,
                productVariantId: 1,
                quantity: 1,
                nameProductSnapshot: "Fallback Tee Black",
                finalPrice: 329000,
            },
        ],
    },
];

export const FALLBACK_VOUCHERS: Voucher[] = [
    {
        id: 770001,
        name: "FALLBACK10",
        code: "FALLBACK10",
        description: "Fallback voucher while API is unavailable.",
        type: "PERCENTAGE",
        discountValue: 10,
        maxDiscountValue: 50000,
        minDiscountValue: 100000,
        remainingQuantity: 100,
        status: "ACTIVE",
        startDate: nowIso,
        endDate: nowIso,
    },
];

export const FALLBACK_REVIEWS: Review[] = [
    {
        id: 660001,
        rating: 5,
        comment: "Fallback review while API is unavailable.",
        productId: 999001,
        userId: 1,
        images: ["/window.svg"],
        createdAt: nowIso,
    },
];

export const FALLBACK_CART_ITEMS: CartItem[] = [
    {
        id: 550001,
        productVariantId: 1,
        quantity: 1,
        listPriceSnapshot: 329000,
        nameProductSnapshot: "Fallback Tee Black",
        urlImageSnapshot: "/globe.svg",
    },
];

export const FALLBACK_USERS: UserProfile[] = [
    {
        id: 440001,
        username: "fallback_user",
        fullName: "Fallback User",
        email: "fallback@example.com",
        phone: "0000000000",
        status: "ACTIVE",
    },
];

export const FALLBACK_ADDRESSES: UserAddress[] = [
    {
        id: 330001,
        fullName: "Fallback User",
        phone: "0000000000",
        provinceName: "Fallback Province",
        districtName: "Fallback District",
        wardName: "Fallback Ward",
        detail: "Fallback Street",
        isDefault: true,
    },
];

export function createFallbackProductListResponse(page: number, size: number): ApiResponse<PageResponse<Product>> {
    return {
        status: 200,
        message: "Fallback product list",
        data: {
            data: FALLBACK_PRODUCTS,
            pageNumber: page,
            pageSize: size,
            totalPages: 1,
            totalElements: FALLBACK_PRODUCTS.length,
        },
    };
}

export function createFallbackProductDetailResponse(): ApiResponse<ProductDetail> {
    return {
        status: 200,
        message: "Fallback product detail",
        data: FALLBACK_PRODUCT_DETAIL,
    };
}

export function createFallbackCategoryResponse(): ApiResponse<PageResponse<Category>> {
    return {
        status: 200,
        message: "Fallback category list",
        data: {
            data: FALLBACK_CATEGORIES,
            pageNumber: 1,
            pageSize: FALLBACK_CATEGORIES.length,
            totalPages: 1,
            totalElements: FALLBACK_CATEGORIES.length,
        },
    };
}

export function createFallbackOrderListResponse(page: number, size: number): ApiResponse<PageResponse<OrderSummary>> {
    return {
        status: 200,
        message: "Fallback order list",
        data: {
            data: FALLBACK_ORDERS,
            pageNumber: page,
            pageSize: size,
            totalPages: 1,
            totalElements: FALLBACK_ORDERS.length,
        },
    };
}

export function createFallbackOrderDetailResponse(): ApiResponse<OrderSummary> {
    return {
        status: 200,
        message: "Fallback order detail",
        data: FALLBACK_ORDERS[0],
    };
}

export function createFallbackVoucherListResponse(page: number, size: number): ApiResponse<PageResponse<Voucher>> {
    return {
        status: 200,
        message: "Fallback voucher list",
        data: {
            data: FALLBACK_VOUCHERS,
            pageNumber: page,
            pageSize: size,
            totalPages: 1,
            totalElements: FALLBACK_VOUCHERS.length,
        },
    };
}

export function createFallbackVoucherDetailResponse(): ApiResponse<Voucher> {
    return {
        status: 200,
        message: "Fallback voucher detail",
        data: FALLBACK_VOUCHERS[0],
    };
}

export function createFallbackReviewListResponse(page: number, size: number): ApiResponse<PageResponse<Review>> {
    return {
        status: 200,
        message: "Fallback review list",
        data: {
            data: FALLBACK_REVIEWS,
            pageNumber: page,
            pageSize: size,
            totalPages: 1,
            totalElements: FALLBACK_REVIEWS.length,
        },
    };
}

export function createFallbackReviewDetailResponse(): ApiResponse<Review> {
    return {
        status: 200,
        message: "Fallback review detail",
        data: FALLBACK_REVIEWS[0],
    };
}

export function createFallbackCartListResponse(page: number, size: number): ApiResponse<PageResponse<CartItem>> {
    return {
        status: 200,
        message: "Fallback cart list",
        data: {
            data: FALLBACK_CART_ITEMS,
            pageNumber: page,
            pageSize: size,
            totalPages: 1,
            totalElements: FALLBACK_CART_ITEMS.length,
        },
    };
}

export function createFallbackUserListResponse(page: number, size: number): ApiResponse<PageResponse<UserProfile>> {
    return {
        status: 200,
        message: "Fallback user list",
        data: {
            data: FALLBACK_USERS,
            pageNumber: page,
            pageSize: size,
            totalPages: 1,
            totalElements: FALLBACK_USERS.length,
        },
    };
}

export function createFallbackAddressListResponse(page: number, size: number): ApiResponse<PageResponse<UserAddress>> {
    return {
        status: 200,
        message: "Fallback address list",
        data: {
            data: FALLBACK_ADDRESSES,
            pageNumber: page,
            pageSize: size,
            totalPages: 1,
            totalElements: FALLBACK_ADDRESSES.length,
        },
    };
}
