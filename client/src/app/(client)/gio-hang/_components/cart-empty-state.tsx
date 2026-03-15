import { ShoppingBag } from "lucide-react";

export function CartEmptyState() {
    return (
        <div className="border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-600">
            <ShoppingBag className="mx-auto size-10 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">Giỏ hàng đang trống</p>
            <p className="mt-2 text-sm">Hãy quay lại khu sản phẩm để chọn biến thể và thêm vào giỏ.</p>
        </div>
    );
}
