<?php

namespace App\Http\Controllers;

use App\Http\Service\FirebaseService;

use Illuminate\Http\Request;

class FirebaseController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }
    public function test()
    {
        try {
            // Gọi hàm test bên trong Service mà bạn vừa sửa dấu ";"
            $this->firebaseService->test();

            return response()->json([
                'status' => 'success',
                'message' => 'Dữ liệu đã được đẩy lên Firebase thành công!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
