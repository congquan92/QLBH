<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    protected User $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }
}
