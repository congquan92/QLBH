<?php
namespace App\Http\Controllers;

use App\Http\Service\CartService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Lấy danh sách item trong giỏ hàng
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->cartService->getCarts(
            $request->query('sort'),
            (int) $request->query('page', 1),
            (int) $request->query('size', 10),
            $request->query('keyword') // Lấy keyword từ query string
        );

        return response()->json($result);
    }

    /**
     * Thêm mới sản phẩm vào giỏ hàng
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_variant_id' => 'required|integer',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            $cart = $this->cartService->add($request->all());
            return response()->json([
                'message' => 'Đã thêm sản phẩm vào giỏ hàng thành công',
                'data' => $cart
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Cập nhật số lượng item (Dùng PUT hoặc PATCH)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            $cart = $this->cartService->update((int) $id, $request->only('quantity'));
            return response()->json([
                'message' => 'Cập nhật số lượng thành công',
                'data' => $cart
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Xóa item khỏi giỏ hàng
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->cartService->delete((int) $id);
            return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}