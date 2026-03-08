<?php

namespace App\Http\Service;

use App\Enums\PaymentStatus;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentType;
use App\Exceptions\ErrorCode;
use App\Exceptions\BusinessException;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GhnService
{
    protected $baseUrl;
    protected $token;
    protected $shopId;


    public function __construct()
    {
        $this->baseUrl = config('services.ghn.base_url');
        $this->token = config('services.ghn.token');
        $this->shopId = config('services.ghn.shop_id');
    }

    /**
     * Tạo Helper cho Headers để tái sử dụng và tránh lỗi method không tồn tại
     */
    private function getHeaders()
    {
        return [
            'Token' => $this->token,
            'ShopId' => (string) $this->shopId,
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * @param Order $order
     * @param string $requiredNote
     * @return array
     */
    public function createShippingOrder(Order $order, $requiredNote = "CHOTHUHANG")
    {
        // 1. Validation logic
        if ($order->order_status === DeliveryStatus::CANCELLED) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng đã bị hủy.");
        }
        if ($order->order_status === DeliveryStatus::SHIPPED) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng ở trạng thái không khả dụng !");
        }
        if ($order->payment_type === PaymentType::BANK_TRANSFER && $order->payment_status !== PaymentStatus::PAID) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng chưa được thanh toán !");
        }

        $url = "{$this->baseUrl}/v2/shipping-order/create";

        try {
            // Đảm bảo KHÔNG dùng Http::async()
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::timeout(30)
                ->withHeaders($this->getHeaders())
                ->post($url, $this->buildGhnPayload($order, $requiredNote));

            // Kiểm tra Response
            if ($response->status() >= 400) {
                Log::error("GHN Create Order Error: " . json_encode($response->json()));
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Lỗi từ GHN: " . ($response->json('message') ?? "Unknown Error"));
            }
        } catch (\Exception $e) {
            Log::error("GHN Create Order Exception: " . $e->getMessage());
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Lỗi từ GHN: " . $e->getMessage());
        }

        $data = $response->json('data');

        $order->update([
            'order_tracking_code' => $data['order_code'],
            'total_fee_for_ship' => $data['total_fee'],
        ]);

        return [
            'orderId' => (string) $order->id,
            'orderCode' => $order->order_tracking_code,
            'status' => $data['status'] ?? 'CREATED',
            'receiver' => [
                'name' => $order->customer_name,
                'phone' => $order->customer_phone,
                'address' => $order->delivery_address,
                'wardCode' => $order->delivery_ward_code,
                'districtId' => $order->delivery_district_id,
            ],
            'sender' => [
                'name' => config('services.ghn.from.name'),
                'phone' => config('services.ghn.from.phone'),
                'address' => config('services.ghn.from.address'),
                'provinceName' => config('services.ghn.from.province'),
                'districtName' => config('services.ghn.from.district_name'),
                'wardName' => config('services.ghn.from.ward_name'),
            ],
            'raw' => $response->json(),
        ];
    }

    /**
     * @param Order $order
     * @param string $requiredNote
     * @return array
     */
    private function buildGhnPayload($order, $requiredNote)
    {
        $items = $order->orderItem->map(function ($item) {
            return [
                "name" => $item->name_product_snapshot,
                "code" => $item->productVariant->sku ?? "SKU",
                "quantity" => (int) $item->quantity,
                "price" => (int) round($item->final_price),
            ];
        })->toArray();

        $payload = [
            "payment_type_id" => 1,
            "required_note" => $requiredNote,
            "from_name" => config('services.ghn.from.name'),
            "from_phone" => config('services.ghn.from.phone'),
            "from_address" => config('services.ghn.from.address'),
            "from_ward_name" => config('services.ghn.from.ward_name'),
            "from_district_name" => config('services.ghn.from.district_name'),
            "to_name" => $order->customer_name,
            "to_phone" => $order->customer_phone,
            "to_address" => $order->delivery_address,
            "to_ward_code" => (string) $order->delivery_ward_code,
            "to_district_id" => (int) $order->delivery_district_id,
            "weight" => (int) $order->weight,
            "length" => (int) $order->length,
            "width" => (int) $order->width,
            "height" => (int) $order->height,
            "service_type_id" => (int) ($order->service_type_id ?? 2),
            "items" => $items,
        ];

        if ($order->payment_type === PaymentType::COD) {
            $payload["cod_amount"] = (int) round($order->total_amount);
        }

        return $payload;
    }

    /**
     * Tính phí vận chuyển (Tương đương calculateShippingFee + toFeeRequest bên Java)
     */
    public function calculateShippingFee(Order $order , array $items)
    {
        $url = "{$this->baseUrl}/v2/shipping-order/fee";

        $body = [
            "from_district_id" => (int) config('services.ghn.from.district_id'),
            "from_ward_code" => (string) config('services.ghn.from.ward_code'),
            "to_district_id" => (int) $order->delivery_district_id,
            "to_ward_code" => (string) $order->delivery_ward_code,
            "service_type_id" => (int) $order->service_type_id,
            "weight" => (int) $order->weight,
        ];

        if ($order->service_type_id == 2) {
            $body["length"] = (int) $order->length;
            $body["width"] = (int) $order->width;
            $body["height"] = (int) $order->height;
        } elseif ($order->service_type_id == 5) {
            $body["items"] = $items;
        }

        Log::info("GHN Fee Payload: ", $body);

        $response = Http::withHeaders($this->getHeaders())->post($url, $body);

        if ($response->failed()) {
            Log::error("GHN Fee Error: " . $response->body());
            throw new BusinessException(
                ErrorCode::BAD_REQUEST,
                "Không thể tính phí vận chuyển: " . ($response->json('message') ?? 'Lỗi từ GHN')
            );
        }

        $data = $response->json('data');

        return [
            'shippingFee' => (float) $data['total'],
            'insuranceFee' => 0,
            'total' => (float) $data['total'],
            'raw' => $response->json(),
        ];
    }
    public function getShippingDetail($orderCode)
    {
        $url = "{$this->baseUrl}/v2/shipping-order/detail";
        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::timeout(30)
            ->withHeaders($this->getHeaders())
            ->post($url, ['order_code' => $orderCode]);

        return $response->json('data');
    }
}