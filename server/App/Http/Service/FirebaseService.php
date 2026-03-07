<?php

namespace App\Http\Service;

use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    protected string $databaseUrl;
    protected string $serviceAccountPath;

    public function __construct()
    {
        $this->databaseUrl = config('services.firebase.base_url');
        $this->serviceAccountPath = base_path('firebase.json');
    }

    /**
     * Tạo Access Token từ Service Account để gọi API
     */
    private function getAccessToken()
    {
        $key = json_decode(file_get_contents($this->serviceAccountPath), true);

        $now = time();
        $payload = [
            'iss' => $key['client_email'],
            'scope' => 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.database',
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
        ];

        $jwt = JWT::encode($payload, $key['private_key'], 'RS256');

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        return $response->json()['access_token'] ?? null;
    }

    public function test()
    {
        $token = $this->getAccessToken();
        $url = "{$this->databaseUrl}/1/hello.json?access_token={$token}";
        $data = [
            "test" => "abc",
        ];
        $response = Http::put($url, $data);

        if ($response->failed()) {
            Log::error("Firebase Sync Failed: " . $response->body());
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    public function updateOrderStatus($order)
    {
        $token = $this->getAccessToken();
        if (!$token) {
            Log::error("Firebase: Không thể lấy Access Token");
            return;
        }

        $url = "{$this->databaseUrl}/orders/order_{$order->id}.json?access_token={$token}";

        $data = [
            'order_id' => $order->id,
            'status' => $order->order_status,
            'payment_status' => $order->payment_status,
            'customer' => $order->customer_name,
            'total' => $order->total_amount,
            'updated_at' => now()->toDateTimeString(),
        ];

        $response = Http::put($url, $data);

        if ($response->failed()) {
            Log::error("Firebase Sync Failed: " . $response->body());
        }
    }

    public function sendNotification($target, $data)
{
    $token = $this->getAccessToken();
    
    // target có thể là 'role_admin', 'role_warehouse' hoặc 'user_123'
    $url = "{$this->databaseUrl}/notifications/{$target}.json?access_token={$token}";

    $payload = [
        'title'      => $data['title'],
        'body'       => $data['body'],
        'order_id'   => $data['order_id'] ?? null,
        'type'       => $data['type'], // 'order_status', 'new_order', 'system'
        'created_at' => now()->getTimestampMs(), // Dùng timestamp để FE dễ sắp xếp
        'order_data' => $data['order_data'] ?? null,
    ];

    return Http::post($url, $payload);
}
}