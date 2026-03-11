import { CategoryApi } from "@/api/category.api";
import { ProductApi } from "@/api/product.api";
import ProductGrid from "@/components/feature/product-grid";
import { Helper } from "@/lib/helper";
import { Category } from "@/types/navbar";
import Link from "next/link";

async function getHomeData() {
    const [categoriesResponse, productsResponse] = await Promise.all([CategoryApi.getPublicCategories({ page: 1, size: 20, sort: "id:asc" }), ProductApi.getAllProducts({ page: 1, size: 10, sort: "id:desc" })]);

    return {
        categories: categoriesResponse.data.data,
        products: productsResponse.data.data,
    };
}

export default async function Home() {
    const { categories, products } = await getHomeData();
    const featuredProducts = products.slice(0, 5);
    const newestProducts = products.slice(0, 10);

    return (
        <div className="bg-white">
            <section className="overflow-hidden border-b border-gray-200 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_30%),linear-gradient(135deg,#171717_0%,#0a0a0a_40%,#262626_100%)] text-white">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.9fr] lg:px-8 lg:py-20">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-300">Storefront</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Thời trang nam dễ chọn, dữ liệu hiển thị trực tiếp từ hệ thống bán hàng.</h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                            Trang chủ hiện lấy danh mục và sản phẩm trực tiếp từ backend để làm nền cho khu mua sắm của khách hàng. Bạn có thể bắt đầu từ danh mục hoặc xem ngay các mẫu đang bán.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/san-pham" className="inline-flex items-center justify-center bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                                Xem toàn bộ sản phẩm
                            </Link>
                            <Link href="/he-thong-cua-hang" className="inline-flex items-center justify-center border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                                Hệ thống cửa hàng
                            </Link>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <div className="border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Danh mục</p>
                                <p className="mt-2 text-3xl font-bold">{categories.length}</p>
                            </div>
                            <div className="border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Sản phẩm hiển thị</p>
                                <p className="mt-2 text-3xl font-bold">{products.length}</p>
                            </div>
                            <div className="border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Trạng thái</p>
                                <p className="mt-2 text-3xl font-bold">Realtime</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        {categories.slice(0, 3).map((category: Category) => (
                            <Link key={category.id} href={`/${Helper.generateSlug(category.name)}`} className="border border-white/10 bg-white/5 p-5 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">Danh mục</p>
                                <h2 className="mt-2 text-2xl font-semibold text-white">{category.name}</h2>
                                <p className="mt-3 text-sm text-gray-300">{category.childCategory.length} phân nhóm con đang sẵn sàng hiển thị trong storefront.</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Ưu tiên hiển thị</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Sản phẩm nổi bật</h2>
                    </div>
                    <Link href="/san-pham" className="text-sm font-semibold text-gray-700 transition-colors hover:text-red-600">
                        Xem tất cả
                    </Link>
                </div>
                <div className="mt-8">
                    <ProductGrid products={featuredProducts} emptyMessage="Chưa có sản phẩm nổi bật để hiển thị." />
                </div>
            </section>

            <section className="border-y border-gray-200 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Danh mục</p>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Khám phá theo nhóm sản phẩm</h2>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {categories.map((category: Category) => (
                            <article key={category.id} className="border border-gray-200 bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                                <p className="mt-3 text-sm leading-6 text-gray-600">Duyệt nhanh các phân nhóm con để tới đúng khu vực sản phẩm mà bạn cần.</p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {category.childCategory.slice(0, 5).map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/${Helper.generateSlug(category.name)}/${Helper.generateSlug(child.name)}`}
                                            className="border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-red-500 hover:text-red-600"
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Cập nhật gần đây</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Mới lên kệ</h2>
                    </div>
                </div>
                <div className="mt-8">
                    <ProductGrid products={newestProducts} emptyMessage="Chưa có dữ liệu sản phẩm mới." />
                </div>
            </section>
        </div>
    );
}
