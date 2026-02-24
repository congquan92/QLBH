<?php
namespace App\Http\Controllers;

use App\Http\Service\BrevoService;
class BrevoController extends Controller{
     protected BrevoService $brevoService;

    public function __construct(BrevoService $brevoService)
    {
        $this->brevoService = $brevoService;
    }
}