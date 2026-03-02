<?php

return [
    'vnp_TmnCode' => env('VNP_TMN_CODE'),
    'vnp_HashSecret' => env('VNP_HASH_SECRET'),
    'vnp_Url' => "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    'vnp_Returnurl' => env('APP_URL') . "/api/vnpay/return",
    'vnp_apiUrl' => "http://sandbox.vnpayment.vn/merchant_webapi/merchant.html",
    'apiUrl'=>"https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"
];