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
        $this->databaseUrl = rtrim((string) config('services.firebase.base_url'), '/');
        $this->serviceAccountPath = base_path('firebase.json');
    }

    private function normalizeTarget(string $target): string
    {
        $normalized = strtolower(trim($target));

        if ($normalized === '') {
            return $target;
        }

        if (str_starts_with($normalized, 'role_') || str_starts_with($normalized, 'user_')) {
            return $normalized;
        }

        return 'role_' . $normalized;
    }

    /**
     * Tạo Access Token từ Service Account để gọi API
     */
    private function getAccessToken()
    {
        if (!is_file($this->serviceAccountPath)) {
            Log::warning("Firebase service account file not found", [
                'path' => $this->serviceAccountPath,
            ]);
            return null;
        }

        $raw = file_get_contents($this->serviceAccountPath);
        if ($raw === false) {
            Log::warning("Firebase service account file cannot be read", [
                'path' => $this->serviceAccountPath,
            ]);
            return null;
        }

        $key = json_decode($raw, true);
        if (!is_array($key) || empty($key['client_email']) || empty($key['private_key'])) {
            Log::warning("Firebase service account file is invalid", [
                'path' => $this->serviceAccountPath,
            ]);
            return null;
        }

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
        if (!$token) {
            Log::warning("Firebase test skipped because access token is unavailable");
            return;
        }

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
        if ($this->databaseUrl === '') {
            Log::error("Firebase: FIREBASE_URL chưa được cấu hình");
            return;
        }

        $token = $this->getAccessToken();
        if (!$token) {
            Log::error("Firebase: Không thể lấy Access Token");
            return;
        }

        $url = "{$this->databaseUrl}/orders/order_{$order->id}.json?access_token={$token}";

        $data = [
            'order_id' => $order->id,
            'status' => $order->order_status?->value ?? (string) $order->order_status,
            'payment_status' => $order->payment_status?->value ?? (string) $order->payment_status,
            'customer' => $order->customer_name,
            'total' => $order->total_amount,
            'updated_at' => now()->toDateTimeString(),
        ];

        $response = Http::put($url, $data);

        if ($response->failed()) {
            Log::error("Firebase Sync Failed", [
                'order_id' => $order->id,
                'status_code' => $response->status(),
                'response' => $response->body(),
            ]);
        } else {
            Log::info("Firebase Sync Success", [
                'order_id' => $order->id,
                'status' => $data['status'],
                'payment_status' => $data['payment_status'],
            ]);
        }
    }

    public function sendNotification($target, $data)
{
    if ($this->databaseUrl === '') {
        Log::error("Firebase: FIREBASE_URL chưa được cấu hình", [
            'target' => $target,
        ]);
        return null;
    }

    $token = $this->getAccessToken();
    if (!$token) {
        Log::warning("Firebase notification skipped because access token is unavailable", [
            'target' => $target,
            'type' => $data['type'] ?? null,
            'order_id' => $data['order_id'] ?? null,
        ]);
        return null;
    }
    
    $normalizedTarget = $this->normalizeTarget((string) $target);

    // target có thể là 'role_admin', 'role_warehouse' hoặc 'user_123'
    $url = "{$this->databaseUrl}/notifications/{$normalizedTarget}.json?access_token={$token}";

    $payload = [
        'title'      => $data['title'],
        'body'       => $data['body'],
        'order_id'   => $data['order_id'] ?? null,
        'type'       => $data['type'], // 'order_status', 'new_order', 'system'
        'created_at' => now()->getTimestampMs(), // Dùng timestamp để FE dễ sắp xếp
        'order_data' => $data['order_data'] ?? null,
    ];

    $response = Http::post($url, $payload);

    if ($response->failed()) {
        Log::error("Firebase notification failed", [
            'target' => $normalizedTarget,
            'status_code' => $response->status(),
            'response' => $response->body(),
            'type' => $payload['type'] ?? null,
            'order_id' => $payload['order_id'] ?? null,
        ]);
    }

    return $response;
}
}