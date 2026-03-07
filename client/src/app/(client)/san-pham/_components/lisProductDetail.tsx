"use client";

import { ProductDetail } from "@/types/product";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Minus, Plus, Package, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helper } from "@/lib/helper";
import { Helper2 } from "@/lib/helper2";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

export default function ListProductDetail({ products }: { products: ProductDetail }) {
    const productImages = products.imageProduct.length > 0 ? products.imageProduct : [products.coverImage || "/window.svg"];
    const [selectedImage, setSelectedImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    // Lightbox slides
    const slides = productImages.map((img) => ({ src: img }));

    // Handle attribute selection
    const handleAttributeSelect = (attributeName: string, value: string) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [attributeName]: value,
        }));
    };

    // Handle quantity change
    const handleQuantityChange = (type: "increase" | "decrease") => {
        if (type === "increase") {
            setQuantity((prev) => prev + 1);
        } else if (type === "decrease" && quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    // Handle image navigation
    const handlePrevImage = () => {
        setSelectedImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    };

    const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Side - Image Gallery */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square bg-gray-100 border border-gray-200 overflow-hidden cursor-zoom-in group" onClick={() => setLightboxOpen(true)}>
                        <Image src={productImages[selectedImage]} alt={products.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
                        {products.status === "ACTIVE" && (
                            <Badge variant="destructive" className="absolute top-4 left-4 text-sm font-semibold">
                                Còn hàng
                            </Badge>
                        )}

                        {/* Navigation Arrows */}
                        {productImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrevImage();
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <ChevronLeft className="size-6 text-gray-700" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNextImage();
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <ChevronRight className="size-6 text-gray-700" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    <div className="grid grid-cols-4 gap-2">
                        {productImages.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative aspect-square border-2 overflow-hidden transition-all ${selectedImage === index ? "border-red-600" : "border-gray-200 hover:border-gray-400"}`}
                            >
                                <Image src={img} alt={`${products.name} ${index + 1}`} fill className="object-cover" sizes="25vw" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side - Product Info */}
                <div className="space-y-6">
                    {/* Product Name */}
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{products.name}</h1>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1">
                                {Helper2.renderStars(products.avgRating)}
                                <span className="text-sm text-gray-600 ml-1">({products.avgRating.toFixed(1)})</span>
                            </div>
                            <span className="text-sm text-gray-500">Đã bán {products.soldQuantity}</span>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Danh mục:</span>
                        {products.categoryParents.map((cat, index) => (
                            <span key={cat.id} className="text-gray-900 font-medium">
                                {cat.name}
                                {index < products.categoryParents.length - 1 && " / "}
                            </span>
                        ))}
                    </div>

                    {/* Price */}
                    <div className="bg-gray-50 border border-gray-200 p-4">
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-red-600">{Helper.formatPrice(products.salePrice)}</span>
                            {products.salePrice !== products.listPrice && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">{Helper.formatPrice(products.listPrice)}</span>
                                    <Badge variant="destructive" className="text-xs">
                                        Giảm {Math.round(((parseFloat(products.listPrice) - parseFloat(products.salePrice)) / parseFloat(products.listPrice)) * 100)}%
                                    </Badge>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Attributes Selection */}
                    {products.attributes.map((attribute) => (
                        <div key={attribute.id} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">{attribute.name}:</span>
                                {selectedAttributes[attribute.name] && <span className="text-sm text-gray-600">{selectedAttributes[attribute.name]}</span>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {attribute.attributeValue.map((value) => (
                                    <button
                                        key={value.id}
                                        onClick={() => handleAttributeSelect(attribute.name, value.value)}
                                        className={`px-4 py-2 border text-sm font-medium transition-all ${
                                            selectedAttributes[attribute.name] === value.value ? "border-red-600 bg-red-50 text-red-600" : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                        }`}
                                    >
                                        {value.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Quantity Selector */}
                    <div className="space-y-3">
                        <span className="text-sm font-semibold text-gray-900">Số lượng:</span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-300">
                                <button onClick={() => handleQuantityChange("decrease")} className="p-2 hover:bg-gray-100 transition-colors" disabled={quantity <= 1}>
                                    <Minus className="size-4 text-gray-600" />
                                </button>
                                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none" />
                                <button onClick={() => handleQuantityChange("increase")} className="p-2 hover:bg-gray-100 transition-colors">
                                    <Plus className="size-4 text-gray-600" />
                                </button>
                            </div>
                            <span className="text-sm text-gray-500">{products.productVariant.reduce((sum, v) => sum + v.quantity, 0)} sản phẩm có sẵn</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button variant="outline" size="lg" className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded-none h-12">
                            <ShoppingCart className="size-5 mr-2" />
                            Thêm vào giỏ
                        </Button>
                        <Button variant="default" size="lg" className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors rounded-none h-12">
                            Mua ngay
                        </Button>
                    </div>

                    {/* Service Icons */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded">
                                <Truck className="size-5 text-gray-700" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Miễn phí vận chuyển</p>
                                <p className="text-sm font-medium text-gray-900">Đơn từ 329K</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded">
                                <Shield className="size-5 text-gray-700" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Bảo hành</p>
                                <p className="text-sm font-medium text-gray-900">30 ngày</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded">
                                <RefreshCw className="size-5 text-gray-700" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Đổi trả</p>
                                <p className="text-sm font-medium text-gray-900">15 ngày</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded">
                                <Package className="size-5 text-gray-700" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Còn hàng</p>
                                <p className="text-sm font-medium text-gray-900">22 cửa hàng</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{products.description}</p>
                    </div>
                </div>
            </div>

            {/* Tabs Section - Mô tả & Bình luận */}
            <div className="mt-12 border-t border-gray-200">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("description")}
                        className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === "description" ? "text-red-600 border-b-2 border-red-600" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        Mô tả sản phẩm
                    </button>
                    <button onClick={() => setActiveTab("reviews")} className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === "reviews" ? "text-red-600 border-b-2 border-red-600" : "text-gray-600 hover:text-gray-900"}`}>
                        Đánh giá & Bình luận
                    </button>
                </div>

                {/* Tab Content */}
                <div className="py-8">
                    {activeTab === "description" ? (
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết sản phẩm</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">{products.description}</p>
                            {/* Placeholder cho nội dung mô tả chi tiết */}
                            <div className="bg-gray-50 border border-gray-200 p-6 text-center text-gray-500">
                                <p>Nội dung mô tả chi tiết sẽ được cập nhật sau</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá từ khách hàng</h3>
                            {/* Placeholder cho bình luận */}
                            <div className="bg-gray-50 border border-gray-200 p-6 text-center text-gray-500">
                                <p>Chưa có đánh giá nào cho sản phẩm này</p>
                                <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sản phẩm liên quan */}
            <div className="mt-12 border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
                {/* Placeholder cho sản phẩm liên quan */}
                <div className="bg-gray-50 border border-gray-200 p-12 text-center text-gray-500">
                    <p className="text-lg">Danh sách sản phẩm liên quan sẽ được cập nhật sau</p>
                </div>
            </div>

            {/* Lightbox */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={slides}
                index={selectedImage}
                plugins={[Zoom]}
                zoom={{
                    maxZoomPixelRatio: 3,
                    scrollToZoom: true,
                }}
            />
        </div>
    );
}
