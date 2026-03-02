<?php

namespace App\Http\Controllers;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Http\Responses\ApiResponse;
use App\Http\Service\OAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OAuthController extends Controller
{
    use ApiResponse;
    protected OAuthService $oAuthService;

    public function __construct(OAuthService $oAuthService)
    {
        $this->oAuthService = $oAuthService;
    }
    public function googleLogin(Request $request): JsonResponse
    {

        $validator = Validator::make($request->all(), [
            'access_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Thiếu tham số!');
        }

        $response = $this->oAuthService->loginWithGoogle($request->access_token);
        return response()->json($response->toArray());
    }
}
