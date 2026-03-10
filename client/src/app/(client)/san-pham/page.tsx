export const revalidate = 0; // Tắt cache để luôn lấy dữ liệu mới khi chuyển trang
import { ProductApi } from "@/api/product.api";
import ListProduct from "@/app/(client)/san-pham/_components/listProduct";
import { ProductListResponse } from "@/types/product";
import Link from "next/link";

async function getAllProducts(query: { page: number; size: number; keyword?: string; sort?: string }) {
    return ProductApi.getAllProducts(query);
}

interface PageProps {
    searchParams: Promise<{ page?: string; pageSize?: string; keyword?: string; sort?: string }>;
}

export default async function ProductPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const keyword = params.keyword?.trim() || undefined;
    const sort = params.sort?.trim() || undefined;

    const data: ProductListResponse = await getAllProducts({
        page: currentPage,
        size: pageSize,
        keyword,
        sort,
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="border-b bg-gray-50">
                <div className="mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-gray-900">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Sản phẩm</span>
                    </div>
                </div>
            </div>

            {/* Title Page */}
            <div className="border-b">
                <div className="mx-auto p-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 uppercase">Sản Phẩm</h1>
                    {keyword && (
                        <p className="mt-2 text-sm text-gray-600">
                            Kết quả tìm kiếm cho từ khóa: <span className="font-semibold text-gray-900">{keyword}</span>
                        </p>
                    )}
                </div>
            </div>

            <ListProduct products={data.data.data} data={data} />
        </div>
    );
}
