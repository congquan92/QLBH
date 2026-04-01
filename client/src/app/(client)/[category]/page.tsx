import { CategoryApi } from "@/api/category.api";
import { ProductApi } from "@/api/product.api";
import ListProduct from "@/app/(client)/san-pham/_components/listProduct";
import PageComingSoon from "@/components/feature/page/PageComingSoon";
import { PUBLIC_PAGES } from "@/data/public-pages";
import { Helper } from "@/lib/helper";
import { findRootCategoryBySlug } from "@/app/(client)/[category]/public-catalog";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CategoryPageProps {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ page?: string; pageSize?: string; keyword?: string; sort?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { category } = await params;
    const content = PUBLIC_PAGES.find((page) => page === category);

    if (content) {
        return <PageComingSoon />;
    }

    const query = await searchParams;
    const currentPage = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword?.trim() || undefined;
    const sort = query.sort?.trim() || undefined;

    const categoriesResponse = await CategoryApi.getPublicCategories();
    const resolvedCategory = findRootCategoryBySlug(categoriesResponse.data.data, category);

    if (!resolvedCategory) {
        notFound();
    }

    const productsResponse = await ProductApi.getProductsByCategory(resolvedCategory.id, {
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
                        <span className="font-medium text-gray-900">{resolvedCategory.name}</span>
                    </div>
                </div>
            </div>

            <section className="border-b border-gray-200 bg-white">
                <div className="mx-auto px-4 py-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Danh mục</p>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">{resolvedCategory.name}</h1>

                    {resolvedCategory.childCategory.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {resolvedCategory.childCategory.map((child) => (
                                <Link key={child.id} href={`/${category}/${Helper.generateSlug(child.name)}`} className="border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-red-500 hover:text-red-600">
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <ListProduct products={productsResponse.data.data} data={productsResponse} categoryId={resolvedCategory.id} initialKeyword={keyword ?? ""} />
        </div>
    );
}
