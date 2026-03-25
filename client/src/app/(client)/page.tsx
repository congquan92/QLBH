import { ProductApi } from "@/api/product.api";
import BannerCarousel from "@/components/feature/page/bannerCarousel";
import HomeCategory from "@/components/feature/page/homeCategory";
import ImgPage from "@/components/feature/page/ImgPage";
import ProductCarousel from "@/components/feature/page/ProductCarousel";
import ProductGrid from "@/components/feature/page/ProductGrid";
import { data_banner } from "@/data/banner";
import Link from "next/link";

async function getHomeData() {
    const [productsSalePrice, productsCreated] = await Promise.all([ProductApi.getAllProducts({ page: 1, size: 10, sort: "sale_price:desc" }), ProductApi.getAllProducts({ page: 1, size: 10, sort: "created_at:desc" })]);
    // console.log("Home page - productsResponse:", productsResponse);
    return {
        productsSalePrice: productsSalePrice.data.data,
        productsCreated: productsCreated.data.data,
    };
}

export default async function Home() {
    const { productsSalePrice, productsCreated } = await getHomeData();

    return (
        <div className="bg-white">
            {/* banner */}
            <BannerCarousel autoplay banners={data_banner} />
            <div className="container mx-auto">
                {/* Sản phẩm nổi bật */}
                <section className="px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Sản phẩm nổi bật</h2>
                        </div>
                        <Link href="/san-pham" className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 hover:underline">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="mt-8">
                        <ImgPage url="/a1.png" />
                        <ProductGrid products={productsCreated} emptyMessage="Chưa có sản phẩm nổi bật để hiển thị." />
                    </div>
                </section>
                {/* Sản Phẩm Khuyến Mãi */}
                <section className="px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Sản phẩm khuyến mãi</h2>
                        </div>
                        <Link href="/san-pham" className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 hover:underline">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="mt-8">
                        <ImgPage url="/a1.png" />
                        <ProductCarousel products={productsSalePrice} emptyMessage="Chưa có sản phẩm khuyến mãi để hiển thị." />
                    </div>
                </section>

                {/* Khám phám các danh mục */}
                <section className="px-4 py-12 sm:px-6 lg:px-8">
                    <HomeCategory />
                </section>
            </div>
        </div>
    );
}
