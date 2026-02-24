<?php

namespace App\Http\Service;

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Api\Admin\AdminApi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    public function __construct()
    {
        // Khởi tạo cấu hình bằng CLOUDINARY_URL trong file .env
        Configuration::instance(env('CLOUDINARY_URL'));
    }

    /**
     * Upload file lên Cloudinary
     */
    public function upload(UploadedFile $file): ?string
    {
        try {
            $uploadApi = new UploadApi();
            
            // Tận dụng getRealPath() để lấy đường dẫn file tạm trên server
            $response = $uploadApi->upload($file->getRealPath(), [
                'resource_type' => 'auto', // Tự động nhận diện ảnh/video/file
                'folder' => 'qlbh_uploads' // Bạn có thể tùy chỉnh tên folder
            ]);

            return $response['secure_url'] ?? null;
        } catch (\Exception $e) {
            Log::error("Cloudinary Upload Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Xóa file dựa trên mảng URL
     */
    public function deleteByUrls(array $urls): void
    {
        try {
            $uploadApi = new UploadApi();
            foreach ($urls as $url) {
                if ($url && str_contains($url, 'cloudinary.com')) {
                    $publicId = $this->extractPublicId($url);
                    $uploadApi->destroy($publicId);
                }
            }
        } catch (\Exception $e) {
            Log::error("Cloudinary Delete Error: " . $e->getMessage());
        }
    }

    /**
     * Tách lấy Public ID từ URL để thực hiện lệnh xóa
     */
    private function extractPublicId(string $url): string
    {
        // Cắt chuỗi để lấy phần sau 'upload/' và bỏ phần đuôi mở rộng
        $parts = explode('/upload/', $url);
        if (isset($parts[1])) {
            $pathAfterUpload = $parts[1];
            // Bỏ phần version (ví dụ: v1234567/) nếu có
            $segments = explode('/', $pathAfterUpload);
            
            // Nếu segment đầu tiên bắt đầu bằng 'v' và là số, thì đó là version
            if (preg_match('/^v\d+$/', $segments[0])) {
                array_shift($segments);
            }
            
            $filenameWithExtension = implode('/', $segments);
            return pathinfo($filenameWithExtension, PATHINFO_FILENAME);
        }
        
        return pathinfo(basename($url), PATHINFO_FILENAME);
    }
}