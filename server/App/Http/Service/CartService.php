<?php

namespace App\Http\Service;

use App\Enums\Status;
use App\Http\Mapper\CartMapper;
use App\Http\Mapper\ProductVariantMapper;
use App\Models\Cart;
use App\Models\ProductVariant;
use App\Http\Responses\PageResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class CartService
{
    /**
     * Lấy danh sách giỏ hàng (Phân trang + Sort)
     */
 public function getCarts(?string $sort, int $page, int $size, ?string $keyword = null)
{
    $user = auth()->user();

    $query = Cart::where('user_id', $user->id)
        ->where('status', Status::ACTIVE->value);

    // Thêm điều kiện tìm kiếm
    if (!empty($keyword)) {
        $query->where('name_product_snapshot', 'LIKE', '%' . $keyword . '%');
    }

    // Xử lý Sort
    $column = 'id';
    $direction = 'asc';
    if ($sort && str_contains($sort, ':')) {
        [$column, $dir] = explode(':', $sort);
        $direction = strtolower($dir) === 'desc' ? 'desc' : 'asc';
    }

    $paginator = $query->orderBy($column, $direction)
        ->paginate($size, ['*'], 'page', $page);

    $dtoItems = $paginator->getCollection()->map(fn($cart) => CartMapper::toResponse($cart));
    $paginator->setCollection($dtoItems);

    return PageResponse::fromLaravelPaginator($paginator);
}

    /**
     * Thêm sản phẩm vào giỏ (Xử lý Snapshot)
     */
    public function add(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = auth()->user();
            
            // Tìm variant để lấy dữ liệu làm snapshot
            $productVariant = ProductVariant::with('product')->findOrFail($data['product_variant_id']);

            if ($data['quantity'] > $productVariant->quantity) {
                throw new Exception("Số lượng vượt quá tồn kho hiện có.");
            }

            // Kiểm tra item đã tồn tại trong giỏ chưa
            $cart = Cart::where('user_id', $user->id)
                ->where('product_variant_id', $productVariant->id)
                ->where('status', Status::ACTIVE->value)
                ->first();

            if (!$cart) {
                // Tạo mới kèm Snapshot
                return Cart::create([
                    'user_id' => $user->id,
                    'product_variant_id' => $productVariant->id,
                    'quantity' => $data['quantity'],
                    'status' => Status::ACTIVE->value,
                    'list_price_snapshot' => $productVariant->price,
                    'url_image_snapshot' => $productVariant->product->url_cover_image, // Giả định tên cột
                    'name_product_snapshot' => $productVariant->product->name,
                    'variant_attributes_snapshot' => ProductVariantMapper::toVariantResponse($productVariant),
                ]);
            }

            // Cập nhật số lượng nếu đã tồn tại
            $newQuantity = $cart->quantity + $data['quantity'];
            if ($newQuantity > $productVariant->quantity) {
                throw new Exception("Tổng số lượng trong giỏ vượt quá tồn kho.");
            }

            $cart->update(['quantity' => $newQuantity]);
            return $cart;
        });
    }

    /**
     * Cập nhật số lượng Item trong giỏ
     */
    public function update(int $cartId, array $data)
    {
        return DB::transaction(function () use ($cartId, $data) {
            $user = auth()->user();

            $cart = Cart::where('id', $cartId)
                ->where('status', Status::ACTIVE->value)
                ->firstOrFail();

            if ($cart->user_id !== $user->id) {
                throw new Exception("Đây không phải giỏ hàng của bạn.");
            }

            if (isset($data['quantity'])) {
                // Vì bạn xóa cứng Variant, nên cần check xem variant còn tồn tại không để lấy tồn kho thực tế
                $variant = ProductVariant::find($cart->product_variant_id);
                
                if (!$variant) {
                    throw new Exception("Sản phẩm này đã ngừng kinh doanh, không thể cập nhật số lượng.");
                }

                if ($data['quantity'] > $variant->quantity) {
                    throw new Exception("Số lượng vượt quá tồn kho tối đa.");
                }
                
                $cart->update(['quantity' => $data['quantity']]);
            }

            return $cart;
        });
    }
    public function delete(int $cartId)
    {
        return DB::transaction(function () use ($cartId) {
            $user = auth()->user();

            // Tìm cart thuộc về user và đang ACTIVE
            $cart = Cart::where('id', $cartId)
                ->where('status', Status::ACTIVE->value)
                ->firstOrFail();

            // Kiểm tra quyền sở hữu
            if ($cart->user_id !== $user->id) {
                throw new Exception("Sản phẩm không thuộc giỏ hàng của bạn.");
            }

            // Theo logic Java của bạn: Chuyển trạng thái rồi mới xóa
            $cart->update(['status' => Status::INACTIVE->value]);
            
            return $cart->delete(); 
        });
    }
}