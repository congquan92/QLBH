<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'brevo' => [
        'api_key' => env('BREVO_API_KEY'),
        'sender_name' => env('BREVO_SENDER_NAME'),
        'sender_email' => env('BREVO_SENDER_EMAIL'),
        'otp_valid_minutes' => (int) env('OTP_VALID_MINUTES')
    ],

    'ghn' => [
        'token' => env('GHN_TOKEN'),
        'shop_id' => env('GHN_SHOP_ID'),
        'base_url' => env('GHN_BASE_URL'),
        'from' => [
            'name' => env('GHN_FROM_NAME'),
            'phone' => env('GHN_FROM_PHONE'),
            'address' => env('GHN_FROM_ADDRESS'),
            'ward_code' => env('GHN_FROM_WARD'),
            'district_id' => env('GHN_FROM_DISTRICT'),
            'district_name' => env('FROM_DISTRICT_NAME'),
            'province_name' => env('FROM_PROVINCE_NAME'),
            'ward_name' => env('FROM_WARD_NAME'),

        ]
    ],
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],
    'firebase' => [
        'base_url' => env('FIREBASE_URL'),
    ],

];
