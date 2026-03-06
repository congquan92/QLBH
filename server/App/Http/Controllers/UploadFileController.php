<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Http\Service\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class UploadFileController extends Controller
{
    use ApiResponse;
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    public function upload(Request $request): JsonResponse
    {
        // 1. Validate sơ bộ để đảm bảo có file và đúng định dạng
        $request->validate([
            'files' => 'required',
            'files.*' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,wmv|max:20480',
        ]);

        $files = $request->file('files');
        $allFiles = $request->allFiles();

        if (empty($files)) {
            return response()->json([
                'message' => 'Mảng file rỗng. Hãy kiểm tra lại Key trong Postman!',
                'debug_received_keys' => array_keys($allFiles)
            ], 400);
        }

        $result = [];
        $fileArray = is_array($files) ? $files : [$files];

        foreach ($fileArray as $file) {
            if ($file->isValid()) {
                $url = $this->cloudinaryService->upload($file);

                if ($url) {
                    $result[] = [
                        'original_name' => $file->getClientOriginalName(),
                        'url' => $url,
                        'extension' => $file->getClientOriginalExtension()
                    ];
                } else {
                    Log::error("Không thể upload file: " . $file->getClientOriginalName());
                }
            }
        }

        if (empty($result)) {
            return response()->json(['message' => 'Upload thất bại. Kiểm tra cấu hình Cloudinary!'], 500);
        }

        return $this->success($result, 'Upload File thành công');
    }

    public function delete(Request $request): JsonResponse
    {
        // Giả sử bạn gửi lên mảng các link ảnh cần xóa
        $request->validate([
            'urls' => 'required|array',
        ]);

        $this->cloudinaryService->deleteByUrls($request->input('urls'));

        return $this->success(null, 'Xóa file thành công');
    }
}