<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewProduct\ReviewCreationRequest;
use App\Http\Service\ReviewSerivce; // Giữ nguyên tên class ReviewSerivce của bạn
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    protected ReviewSerivce $reviewService;

    public function __construct(ReviewSerivce $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * Lấy danh sách đánh giá cho Admin (có phân trang, tìm kiếm)
     */
    public function index(Request $request): JsonResponse
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort', 'id:desc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->reviewService->findAll($keyword, $sort, $page, $size);
        return response()->json($result);
    }

    /**
     * User tạo mới đánh giá
     * Validate dữ liệu thông qua ReviewCreationRequest
     */
    public function store(ReviewCreationRequest $request): JsonResponse
    {
        $review = $this->reviewService->create($request->validated());
        return response()->json([
            'message' => 'Cảm ơn bạn đã để lại đánh giá!',
            'data' => $review
        ], 201);
    }

    /**
     * Lấy chi tiết một đánh giá qua ID
     */
    public function show(int $id): JsonResponse
    {
        $review = $this->reviewService->getReviewById($id);
        return response()->json($review);
    }

    // /**
    //  * Lấy các đánh giá của bản thân cho một sản phẩm cụ thể
    //  */
    // public function getMyReviewByProduct(int $productId): JsonResponse
    // {
    //     $reviews = $this->reviewService->getReviewMeByProduct($productId);
    //     return response()->json($reviews);
    // }

    // /**
    //  * Thêm ảnh vào bài review đã có (Dành cho chức năng cập nhật ảnh)
    //  */
    // public function addImages(Request $request, int $reviewId): JsonResponse
    // {
    //     $request->validate([
    //         'image_urls' => 'required|array',
    //         'image_urls.*' => 'string|url'
    //     ]);

    //     $this->reviewService->addImage($request->image_urls, $reviewId);
    //     return response()->json(['message' => 'Thêm hình ảnh thành công.']);
    // }

    // /**
    //  * Xóa danh sách ảnh khỏi bài review
    //  */
    // public function deleteImages(Request $request, int $reviewId): JsonResponse
    // {
    //     $request->validate([
    //         'image_ids' => 'required|array',
    //         'image_ids.*' => 'integer'
    //     ]);

    //     $this->reviewService->deleteImage($request->image_ids, $reviewId);
    //     return response()->json(['message' => 'Xóa hình ảnh thành công.']);
    // }

    // /**
    //  * Cập nhật nội dung bài đánh giá
    //  */
    // public function update(Request $request, int $id): JsonResponse
    // {
    //     // Bạn có thể tạo ReviewUpdateRequest riêng nếu cần validate sâu hơn
    //     $this->reviewService->update($id, $request->all());
    //     return response()->json(['message' => 'Cập nhật đánh giá thành công.']);
    // }

    // public function destroy($id): void
    // {

    //     $this->reviewService->delete($id);

    // }
}