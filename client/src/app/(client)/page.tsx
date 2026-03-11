import { CategoryApi } from "@/api/category.api";
import { ProductApi } from "@/api/product.api";
import BannerCarousel, { Banner } from "@/components/feature/bannerCarousel";
import ProductGrid from "@/components/feature/ProductGrid";
import { Helper } from "@/lib/helper";
import { Category } from "@/types/navbar";
import Link from "next/link";
import { id } from "zod/v4/locales";

async function getHomeData() {
    const [categoriesResponse, productsResponse] = await Promise.all([CategoryApi.getPublicCategories({ page: 1, size: 20, sort: "id:asc" }), ProductApi.getAllProducts({ page: 1, size: 10, sort: "id:desc" })]);

    return {
        categories: categoriesResponse.data.data,
        products: productsResponse.data.data,
    };
}

export default async function Home() {
    // const { categories, products } = await getHomeData();
    // const featuredProducts = products.slice(0, 5);
    // const newestProducts = products.slice(0, 10);
    const datatest: Banner[] = [
        {
            id: "1",
            imageUrl: "https://i.pinimg.com/1200x/26/ba/59/26ba594f5be8d2f6eedcac9c9fca429e.jpg",
            name: "Banner",
        },
        {
            id: "2",
            imageUrl: "https://i.pinimg.com/736x/77/5d/e5/775de521373d82ab08b4d4b95259e389.jpg",
            name: "Banner",
        },
    ];
    return (
        <div className="bg-white">
            {/* banner */}
            <BannerCarousel autoplay banners={datatest} />
            {/* uu tien hien thi
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
            </section> */}
        </div>
    );
}
