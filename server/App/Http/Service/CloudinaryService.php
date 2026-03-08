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

                    // Xác định resource_type dựa trên URL
                    $resourceType = str_contains($url, '/video/upload/') ? 'video' : 'image';

                    $uploadApi->destroy($publicId, [
                        'resource_type' => $resourceType
                    ]);

                    Log::info("Đã xóa file ($resourceType): " . $publicId);
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
        // 1. Tách lấy phần sau '/upload/'
        $parts = explode('/upload/', $url);
        if (!isset($parts[1]))
            return "";

        $pathAfterUpload = $parts[1];

        // 2. Tách các thành phần
        $segments = explode('/', $pathAfterUpload);

        // 3. Nếu có version (v12345...), bỏ nó đi
        if (preg_match('/^v\d+$/', $segments[0])) {
            array_shift($segments);
        }

        // 4. Lấy phần còn lại làm Public ID
        $publicIdWithExtension = implode('/', $segments);

        // 5. BỎ pathinfo(..., PATHINFO_FILENAME) đi. 
        // Chúng ta cần cả đuôi file và giữ nguyên folder (ví dụ: qlbh_uploads/abc.jpg)
        // Cloudinary yêu cầu public_id không chứa đuôi mở rộng (.jpg, .png)
        $pathInfo = pathinfo($publicIdWithExtension);

        return $pathInfo['dirname'] !== '.' ? $pathInfo['dirname'] . '/' . $pathInfo['filename'] : $pathInfo['filename'];
    }
}