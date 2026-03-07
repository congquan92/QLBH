<?php

namespace App\Http\Service;

use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Models\Order;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Http\Request;
use Exception;


class PaymentService
{
    protected $orderService;
    protected $fireBaseService;

    public function __construct(OrderService $orderService, FirebaseService $fireBaseService)
    {
        $this->orderService = $orderService;
        $this->fireBaseService = $fireBaseService;
    }

    /**
     * Tạo URL thanh toán VNPay (Tương đương hàm add trong Java)
     */
    public function createPaymentUrl(Request $request, $orderId)
    {
        $user = auth()->user();
        $order = Order::findOrFail($orderId);

        // Kiểm tra logic nghiệp vụ
        if ($order->user_id !== $user->id) {
            throw new BusinessException(ErrorCode::NOT_EXISTED, "Bạn không có quyền thanh toán đơn hàng này.");
        }
        if ($order->payment_type !== PaymentType::BANK_TRANSFER) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Phương thức thanh toán của đơn hàng không phải là chuyển khoản ngân hàng.");
        }
        if ($order->payment_status === PaymentStatus::PAID) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng này đã được thanh toán trước đó.");
        }

        $vnp_TmnCode = config('vnpay.vnp_TmnCode');
        $vnp_HashSecret = config('vnpay.vnp_HashSecret');
        $vnp_Url = config('vnpay.vnp_Url');
        $vnp_Returnurl = config('vnpay.vnp_ReturnUrl');

        $vnp_TxnRef = "ORD" . $orderId . "_" . now()->getTimestampMs();
        $vnp_Amount = $order->total_amount * 100;

        $vnp_Params = [
            "vnp_Version" => config('vnpay.vnp_Version'),
            "vnp_Command" => config('vnpay.vnp_Command'),
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_CurrCode" => "VND",
            "vnp_TxnRef" => $vnp_TxnRef,
            "vnp_OrderInfo" => "Thanh toan don hang:" . $vnp_TxnRef,
            "vnp_OrderType" => "other",
            "vnp_Locale" => "vn",
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_IpAddr" => $request->ip(),
            "vnp_CreateDate" => now()->format('YmdHis'),
            "vnp_ExpireDate" => now()->addMinutes(5)->format('YmdHis'),
        ];

        // Sắp xếp dữ liệu theo Alphabet (giống Collections.sort trong Java)
        ksort($vnp_Params);

        $hashData = "";
        $query = "";
        $i = 0;

        foreach ($vnp_Params as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $query = rtrim($query, '&'); // QUAN TRỌNG: Loại bỏ dấu & thừa cuối cùng
        $vnp_Url = $vnp_Url . "?" . $query;

        $vnpSecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
        $vnp_Url .= '&vnp_SecureHash=' . $vnpSecureHash;

        Redis::setex($vnp_TxnRef, 300, $orderId);
        return $vnp_Url;
    }

    /**
     * Xử lý Callback từ VNPay
     */
    public function vnpayCallback(Request $request)
    {
        $vnp_ResponseCode = $request->vnp_ResponseCode;
        $vnp_TxnRef = $request->vnp_TxnRef;
        $vnp_SecureHash = $request->vnp_SecureHash;
        $vnp_HashSecret = config('vnpay.vnp_HashSecret');

        $inputData = $request->all();
        unset($inputData['vnp_SecureHash']);
        ksort($inputData);

        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        // Kiểm tra chữ ký (validateVnpayCallback)
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
        if ($secureHash !== $vnp_SecureHash) {
            Log::error("❌ Wrong signature VNPay callback");
            return false;
        }

        // Kiểm tra Redis
        $cachedOrderId = Redis::get($vnp_TxnRef);
        if (!$cachedOrderId) {
            Log::error("❌ Payment link is expired or invalid: " . $vnp_TxnRef);
            return false;
        }

        if ($vnp_ResponseCode === "00") {
            // Logic xử lý thành công
            $orderId = explode('_', str_replace('ORD', '', $vnp_TxnRef))[0];

            $this->orderService->completePayment($orderId);
            Redis::del($vnp_TxnRef);

            $order = Order::find($orderId);
            $this->fireBaseService->updateOrderStatus($order);

            Log::info("✅ Thanh toán thành công đơn hàng: " . $orderId);
            return true;
        }

        return false;
    }
}