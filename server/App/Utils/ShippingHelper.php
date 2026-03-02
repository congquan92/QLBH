<?php
namespace App\Utils;

class ShippingHelper
{
    /**
     * Tổng khối lượng (gram) = sum(weight × quantity)
     */
    public static function calculateTotalWeight(array $packages): int
    {
        return collect($packages)->sum(function ($pkg) {
            return ($pkg['weight'] ?? 0) * ($pkg['quantity'] ?? 0);
        });
    }

    /**
     * Chiều dài trung bình có trọng số (theo quantity)
     */
    public static function calculateAverageLength(array $packages): int
    {
        $totalQty = collect($packages)->sum('quantity');
        if ($totalQty === 0) return 0;

        $totalLength = collect($packages)->sum(function ($pkg) {
            return ($pkg['length'] ?? 0) * ($pkg['quantity'] ?? 0);
        });

        return (int) round($totalLength / $totalQty);
    }

    /**
     * Chiều rộng trung bình có trọng số
     */
    public static function calculateAverageWidth(array $packages): int
    {
        $totalQty = collect($packages)->sum('quantity');
        if ($totalQty === 0) return 0;

        $totalWidth = collect($packages)->sum(function ($pkg) {
            return ($pkg['width'] ?? 0) * ($pkg['quantity'] ?? 0);
        });

        return (int) round($totalWidth / $totalQty);
    }

    /**
     * Chiều cao trung bình có trọng số
     */
    public static function calculateAverageHeight(array $packages): int
    {
        $totalQty = collect($packages)->sum('quantity');
        if ($totalQty === 0) return 0;

        $totalHeight = collect($packages)->sum(function ($pkg) {
            return ($pkg['height'] ?? 0) * ($pkg['quantity'] ?? 0);
        });

        return (int) round($totalHeight / $totalQty);
    }

    /**
     * Xác định loại dịch vụ GHN (2 = hàng nhẹ, 5 = hàng nặng)
     * Dựa vào quy tắc của GHN (cân nặng & thể tích quy đổi)
     */
    public static function determineServiceTypeId(int $weightGram, int $lengthCm, int $widthCm, int $heightCm): int
    {
    
        $volumetricWeightKg = ($lengthCm * $widthCm * $heightCm) / 5000.0;
        $actualWeightKg = $weightGram / 1000.0;

        if ($actualWeightKg > 15.0 || $volumetricWeightKg > 15.0) {
            return 5; 
        }
        return 2; 
    }
}