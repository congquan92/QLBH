import { CategoryApi } from "@/api/category.api";
import { ProductApi } from "@/api/product.api";
import ListProduct from "@/app/(client)/san-pham/_components/listProduct";
import { findChildCategoryBySlugs } from "@/lib/public-catalog";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ChildCategoryPageProps {
    params: Promise<{ category: string; subCategory: string }>;
    searchParams: Promise<{ page?: string; pageSize?: string; keyword?: string; sort?: string }>;
}

export default async function ChildCategoryPage({ params, searchParams }: ChildCategoryPageProps) {
    const { category, subCategory } = await params;
    const query = await searchParams;
    const currentPage = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword?.trim() || undefined;
    const sort = query.sort?.trim() || undefined;

    const categoriesResponse = await CategoryApi.getPublicCategories();
    const resolvedCategory = findChildCategoryBySlugs(categoriesResponse.data.data, category, subCategory);

    if (!resolvedCategory?.child) {
        notFound();
    }

    const productsResponse = await ProductApi.getProductsByCategory(resolvedCategory.child.id, {
        page: currentPage,
        size: pageSize,
        keyword,
        sort,
    });

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b bg-gray-50">
                <div className="mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-gray-900">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <Link href={`/${category}`} className="hover:text-gray-900">
                            {resolvedCategory.parent.name}
                        </Link>
                        <span>/</span>
                        <span className="font-medium text-gray-900">{resolvedCategory.child.name}</span>
                    </div>
                </div>
            </div>

            <section className="border-b border-gray-200 bg-white">
                <div className="mx-auto px-4 py-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Phân nhóm</p>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">{resolvedCategory.child.name}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">Các sản phẩm trong nhóm {resolvedCategory.child.name.toLowerCase()} đang được hiển thị trực tiếp từ backend theo dữ liệu thật.</p>
                </div>
            </section>

            <ListProduct products={productsResponse.data.data} data={productsResponse} categoryId={resolvedCategory.child.id} initialKeyword={keyword ?? ""} />
        </div>
    );
}
