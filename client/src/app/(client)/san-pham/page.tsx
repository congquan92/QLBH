export const revalidate = 3600; // Cache 1 tiếng (đơn vị: giây)
import { ProductApi } from "@/api/product.api";
import ListProduct from "@/app/(client)/san-pham/_components/listProduct";
import { Product } from "@/types/product";
import Link from "next/link";

async function getAllProducts() {
    try {
        const res = await ProductApi.getAllProducts();
        return res.data.data.data;
    } catch (err) {
        console.log(err);
    }
}

export default async function ProductPage() {
    const data: Product[] = await getAllProducts();
    console.log("ProductPage data:", data);
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
                </div>
            </div>

            <ListProduct products={data} />
        </div>
    );
}
