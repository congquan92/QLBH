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
    $order = Order::findOrFail($orderId);
    
    // Đảm bảo cấu hình luôn lấy đúng key từ file config/vnpay.php
    $vnp_TmnCode = config('vnpay.vnp_TmnCode');
    $vnp_HashSecret = config('vnpay.vnp_HashSecret');
    $vnp_Url = config('vnpay.vnp_Url');
    $vnp_Returnurl = config('vnpay.vnp_ReturnUrl');

    Log::info("VNPay Config Check:", [
        'vnp_TmnCode' => $vnp_TmnCode,
        // Cảnh báo: Chỉ log 3 ký tự đầu của Secret để bảo mật, không log hết
        'vnp_HashSecret_Preview' => $vnp_HashSecret,
        'vnp_Url' => $vnp_Url,
        'vnp_ReturnUrl' => $vnp_Returnurl
    ]);
    // QUAN TRỌNG: Thiết lập múi giờ GMT+7 cho riêng phiên làm việc này
    date_default_timezone_set('Asia/Ho_Chi_Minh');

    $vnp_TxnRef = "ORD" . $orderId . "_" . time(); 
    $vnp_Amount = (int)($order->total_amount * 100);
    
    // Lấy IP chuẩn IPv4
    $ipAddr = $request->ip();
    if ($ipAddr === '::1' || str_contains($ipAddr, ':')) {
        $ipAddr = '127.0.0.1';
    }

    $vnp_Params = [
        "vnp_Version"    => "2.1.0",
        "vnp_Command"    => "pay",
        "vnp_TmnCode"    => $vnp_TmnCode,
        "vnp_Amount"     => $vnp_Amount,
        "vnp_CurrCode"   => "VND",
        "vnp_TxnRef"     => $vnp_TxnRef,
        "vnp_OrderInfo"  => "Thanh toan don hang " . $orderId,
        "vnp_OrderType"  => "other",
        "vnp_Locale"     => "vn",
        "vnp_ReturnUrl"  => $vnp_Returnurl,
        "vnp_IpAddr"     => $ipAddr,
        "vnp_CreateDate" => date('YmdHis'),
        "vnp_ExpireDate" => date('YmdHis', strtotime('+15 minutes')),
    ];

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

    // Nối trực tiếp SecureHash mà không cần thêm dấu & thừa
    $vnpSecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
    $finalUrl = $vnp_Url . "?" . $query . 'vnp_SecureHash=' . $vnpSecureHash;

    Redis::setex($vnp_TxnRef, 900, $orderId);

    return $finalUrl;
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