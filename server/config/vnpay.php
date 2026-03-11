<?php

return [
    'vnp_TmnCode' => env('VNPAY_TMN_CODE'),
    'vnp_HashSecret' => env('VNPAY_SECRET_KEY'),
    'vnp_Url' => "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    'vnp_ReturnUrl' => env('APP_URL') . "/api/payment/vnpay-return",
    'vnp_apiUrl' => "http://sandbox.vnpayment.vn/merchant_webapi/merchant.html",
    'apiUrl'=>"https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"
];