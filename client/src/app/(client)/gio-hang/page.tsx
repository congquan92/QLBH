"use client";

import { CartApi } from "@/api/cart.api";
import { Button } from "@/components/ui/button";
import { Helper } from "@/lib/helper";
import { UserAuthUtil } from "@/lib/user-auth";
import { UserAuthStore } from "@/stores/user-auth.store";
import { CartItem } from "@/types/cart";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
    const session = UserAuthStore.useStore((state) => state.session);
    const isAuthLoading = UserAuthStore.useStore((state) => state.isLoading);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [lastLoadedToken, setLastLoadedToken] = useState<string | null>(null);

    const sessionToken = session?.token ?? null;
    const isAuthenticated = UserAuthUtil.isSessionValid(session);
    const isLoading = isAuthLoading || (isAuthenticated && lastLoadedToken !== sessionToken);

    useEffect(() => {
        if (isAuthLoading || !isAuthenticated || !sessionToken) return;

        let isCancelled = false;

        const fetchCart = async () => {
            const cartResponse = await CartApi.getMyCart({ page: 1, size: 50, sort: "id:desc" });

            if (isCancelled) {
                return;
            }

            setCartItems(cartResponse.data.data);
            setLastLoadedToken(sessionToken);
        };

        void fetchCart();

        return () => {
            isCancelled = true;
        };
    }, [isAuthenticated, isAuthLoading, sessionToken]);

    const handleQuantityChange = async (item: CartItem, nextQuantity: number) => {
        if (nextQuantity < 1) {
            return;
        }

        const response = await CartApi.updateItem(item.id, { quantity: nextQuantity });
        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể cập nhật giỏ hàng.");
            return;
        }

        setCartItems((current) => current.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: nextQuantity } : cartItem)));
        toast.success("Đã cập nhật số lượng.");
    };

    const handleDelete = async (itemId: number) => {
        const response = await CartApi.deleteItem(itemId);
        if (!response || response.status >= 400) {
            toast.error(response?.message || "Không thể xóa sản phẩm khỏi giỏ hàng.");
            return;
        }

        setCartItems((current) => current.filter((item) => item.id !== itemId));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
    };

    const totalAmount = cartItems.reduce((sum, item) => {
        const price = Number(item.listPriceSnapshot ?? 0);
        return sum + price * item.quantity;
    }, 0);

    if (isLoading || isAuthLoading) {
        return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-gray-500">Đang tải giỏ hàng...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-16">
                <div className="border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                    <p className="mt-3 text-sm leading-6 text-gray-600">Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình. Đừng lo, chỉ mất vài giây!</p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link href="/dang-nhap?redirect=%2Fgio-hang" className="bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                            Đăng nhập để xem giỏ hàng
                        </Link>
                        <Link href="/san-pham" className="border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900">
                            Tiếp tục xem sản phẩm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Mua sắm</p>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                </div>
                <Link href="/san-pham" className="text-sm font-semibold text-gray-700 transition-colors hover:text-red-600">
                    Thêm sản phẩm
                </Link>
            </div>

            {cartItems.length === 0 ? (
                <div className="border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-600">
                    <ShoppingBag className="mx-auto size-10 text-gray-400" />
                    <p className="mt-4 text-lg font-medium text-gray-900">Giỏ hàng đang trống</p>
                    <p className="mt-2 text-sm">Hãy quay lại khu sản phẩm để chọn biến thể và thêm vào giỏ.</p>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <article key={item.id} className="grid gap-4 border border-gray-200 bg-white p-4 sm:grid-cols-[120px_1fr]">
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    {item.urlImageSnapshot ? (
                                        <Image src={item.urlImageSnapshot} alt={item.nameProductSnapshot || "Cart item"} fill className="object-cover" sizes="120px" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
                                    )}
                                </div>

                                <div className="flex flex-col justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{item.nameProductSnapshot || "Sản phẩm trong giỏ hàng"}</h2>
                                        <p className="mt-2 text-sm text-gray-600">Đơn giá: {Helper.formatPrice(String(item.listPriceSnapshot ?? 0))}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center border border-gray-300">
                                            <button onClick={() => void handleQuantityChange(item, item.quantity - 1)} className="p-2 transition-colors hover:bg-gray-100" disabled={item.quantity <= 1}>
                                                <Minus className="size-4" />
                                            </button>
                                            <span className="min-w-12 border-x border-gray-300 px-4 py-2 text-center text-sm font-medium">{item.quantity}</span>
                                            <button onClick={() => void handleQuantityChange(item, item.quantity + 1)} className="p-2 transition-colors hover:bg-gray-100">
                                                <Plus className="size-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <p className="text-base font-bold text-red-600">{Helper.formatPrice(String(Number(item.listPriceSnapshot ?? 0) * item.quantity))}</p>
                                            <Button variant="ghost" className="text-gray-500 hover:text-red-600" onClick={() => void handleDelete(item.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <aside className="h-fit border border-gray-200 bg-gray-50 p-6">
                        <h2 className="text-xl font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
                        <div className="mt-6 space-y-3 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span>Số dòng sản phẩm</span>
                                <span className="font-medium text-gray-900">{cartItems.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Tổng tạm tính</span>
                                <span className="font-medium text-gray-900">{Helper.formatPrice(String(totalAmount))}</span>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <p className="flex items-center justify-between text-lg font-bold text-gray-900">
                                <span>Tổng cộng</span>
                                <span>{Helper.formatPrice(String(totalAmount))}</span>
                            </p>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-gray-500">Luồng đặt hàng và thanh toán có backend hỗ trợ, nhưng storefront hiện mới hoàn thiện tới bước giỏ hàng và điều chỉnh số lượng.</p>
                    </aside>
                </div>
            )}
        </div>
    );
}
