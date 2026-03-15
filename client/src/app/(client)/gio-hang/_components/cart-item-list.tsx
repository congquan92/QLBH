import { Button } from "@/components/ui/button";
import { Helper } from "@/lib/helper";
import { CartItem } from "@/types/cart";
import { AlertCircle, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { getCartItemAttributes, getCartItemImage, getCartItemName, getCartItemPrice, getCartLineTotal, isCartItemAvailable } from "./cart-utils";

interface CartItemListProps {
    cartItems: CartItem[];
    onQuantityChange: (item: CartItem, nextQuantity: number) => void;
    onDelete: (itemId: number) => void;
}

export function CartItemList({ cartItems, onQuantityChange, onDelete }: CartItemListProps) {
    return (
        <div className="space-y-4">
            {cartItems.map((item) => {
                const attributes = getCartItemAttributes(item);
                const available = isCartItemAvailable(item);

                return (
                    <article key={item.id} className="grid gap-4 border border-gray-200 bg-white p-4 sm:grid-cols-[120px_1fr]">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                            {getCartItemImage(item) ? (
                                <Image src={getCartItemImage(item)} alt={getCartItemName(item)} fill className="object-cover" sizes="120px" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
                            )}
                        </div>

                        <div className="flex flex-col justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-gray-900">{getCartItemName(item)}</h2>
                                    {!available ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            Tạm hết khả dụng
                                        </span>
                                    ) : null}
                                </div>

                                {attributes.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                        {attributes.map((attribute) => (
                                            <span key={`${item.id}-${attribute.key}`} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                                                {attribute.key}: {attribute.value}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}

                                <p className="mt-3 text-sm text-gray-600">Đơn giá: {Helper.formatPrice(String(getCartItemPrice(item)))}</p>
                                <p className="mt-1 text-xs text-gray-500">SKU: {item.product_variant?.sku || "Chưa có"}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center border border-gray-300">
                                    <button onClick={() => onQuantityChange(item, item.quantity - 1)} className="p-2 transition-colors hover:bg-gray-100" disabled={item.quantity <= 1}>
                                        <Minus className="size-4" />
                                    </button>
                                    <span className="min-w-12 border-x border-gray-300 px-4 py-2 text-center text-sm font-medium">{item.quantity}</span>
                                    <button onClick={() => onQuantityChange(item, item.quantity + 1)} className="p-2 transition-colors hover:bg-gray-100" disabled={!available}>
                                        <Plus className="size-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <p className="text-base font-bold text-red-600">{Helper.formatPrice(String(getCartLineTotal(item)))}</p>
                                    <Button variant="ghost" className="text-gray-500 hover:text-red-600" onClick={() => onDelete(item.id)}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
