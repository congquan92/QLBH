<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Http\Service\GhnService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GhnController extends Controller
{
    use ApiResponse;

    protected GhnService $ghnService;

    public function __construct(GhnService $ghnService)
    {
        $this->ghnService = $ghnService;
    }

    /**
     * Tính phí vận chuyển GHN (preview trước khi đặt đơn)
     * POST /api/ghn/calculate-fee
     * Body: { districtId: int, wardCode: string }
     */
    public function calculateFee(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'districtId' => 'required|integer|min:1',
            'wardCode'   => 'required|string',
        ]);

        $districtId = (int) $validated['districtId'];
        $wardCode   = (string) $validated['wardCode'];

        $baseUrl = config('services.ghn.base_url');
        $token   = config('services.ghn.token');
        $shopId  = config('services.ghn.shop_id');

        $body = [
            'from_district_id' => (int) config('services.ghn.from.district_id'),
            'from_ward_code'   => (string) config('services.ghn.from.ward_code'),
            'to_district_id'   => $districtId,
            'to_ward_code'     => $wardCode,
            'service_type_id'  => 2,     // Hàng nhẹ – dùng chiều dài/rộng/cao
            'weight'           => 500,   // gram – mặc định cho preview
            'length'           => 20,
            'width'            => 20,
            'height'           => 10,
        ];

        /** @var \Illuminate\Http\Client\Response $response */
        $response = \Illuminate\Support\Facades\Http::timeout(15)
            ->withoutVerifying()
            ->withHeaders([
                'Token'        => $token,
                'ShopId'       => (string) $shopId,
                'Content-Type' => 'application/json',
            ])
            ->post("{$baseUrl}/v2/shipping-order/fee", $body);

        if ($response->failed()) {
            \Illuminate\Support\Facades\Log::error('GHN Fee Preview Error: ' . $response->body());
            return $this->error(
                'Không thể tính phí vận chuyển: ' . ($response->json('message') ?? 'Lỗi từ GHN'),
                400
            );
        }

        $data = $response->json('data');

        return $this->success([
            'shippingFee' => (float) ($data['total'] ?? 0),
            'total'       => (float) ($data['total'] ?? 0),
            'raw'         => $data,
        ], 'Tính phí vận chuyển thành công');
    }
}
