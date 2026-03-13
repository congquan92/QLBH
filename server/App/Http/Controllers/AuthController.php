<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Service\Auth\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(LoginRequest $req)
    {
        $response = $this->authService->login($req);

        return response()->json($response->toArray());
    }
    public function register(RegisterRequest $req){
        $this->authService->register($req);
    }

    public function logout()
    {
        $this->authService->logout();

        return response()->json(['message' => 'Logged out']);
    }

    public function refresh()
    {
        $token = $this->authService->refresh();

        return response()->json([
            'access_token' => $token,
            'type' => 'Bearer'
        ]);
    }

    public function introspect()
    {
        return response()->json(
            $this->authService->introspect()
        );
    }
}
