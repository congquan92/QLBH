<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Service\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    public function addPayment(Request $request, $orderId): JsonResponse
    {
        try {
            $result = $this->paymentService->createPaymentUrl($request, $orderId);

            return response()->json([
                'status' => 200,
                'message' => 'Tạo liên kết thanh toán thành công.',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => $e->getCode() ?: 400,
                'message' => $e->getMessage(),
                'data' => null
            ], $e->getCode() ?: 400);
        }
    }

    /**
     * Nhận kết quả từ VNPay (Callback)
     */
    public function returnPayment(Request $request): JsonResponse
    {
        $success = $this->paymentService->vnpayCallback($request);

        return response()->json([
            'status' => 200,
            'message' => $success ? 'Thanh toán thành công' : 'Thanh toán thất bại hoặc có lỗi xảy ra',
            'data' => $success
        ]);
    }
}