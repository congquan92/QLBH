import { ProductApi } from "@/api/product.api";
import ListProductDetail from "@/app/(client)/san-pham/_components/lisProductDetail";
import { Product, ProductDetail } from "@/types/product";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProductDetailProps {
    params: Promise<{ id: string[] }>;
}
async function getProductDetail(id: string) {
    const res = await ProductApi.getProductDetail(id);
    return res.data;
}
export default async function ProductDetailPage({ params }: ProductDetailProps) {
    const { id } = await params;
    const data: ProductDetail = await getProductDetail(id[0]);

    if (!data) {
        notFound();
    }

    const relatedResponse = await ProductApi.getProductsByCategory(data.categoryId, { page: 1, size: 10 });
    const relatedProducts: Product[] = relatedResponse.data.data.filter((product) => product.id !== data.id).slice(0, 8);
    // console.log(relatedProducts);

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
                        <Link href="/san-pham" className="hover:text-gray-900">
                            Sản phẩm
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{decodeURIComponent(id[1])}</span>
                    </div>
                </div>
            </div>
            <ListProductDetail products={data} relatedProducts={relatedProducts} />
        </div>
    );
}
