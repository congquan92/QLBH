<?php

use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->string('customerName');
            $table->string('customerPhone');
            $table->string('deliveryWardName');
            $table->string('deliveryWardCode');
            $table->string('deliveryDistrictId');
            $table->string('deliveryProvinceId');
            $table->string('deliveryDistrictName');
            $table->string('deliveryProvinceName');
            $table->string('deliveryAddress');
            $table->string('serviceTypeId');
            $table->string('originalOrderAmount');
            $table->unsignedInteger('weight');
            $table->unsignedInteger('length');
            $table->unsignedInteger('width');
            $table->unsignedInteger('height');
            $table->string('totalFeeForShip');
            $table->string('orderTrackingCode');
            $table->string('note');
            $table->string('isPaidForShip');
            $table->string('orderStatus')
                ->default(DeliveryStatus::PENDING->value);
            $table->string(column: 'paymentType');
            $table->string('paymentStatus')
                ->default(PaymentStatus::UNPAID->value);
            $table->string('deliveredAt');
            $table->string('completedAt');
            $table->string('paymentAt');
            $table->boolean('isConfirmed');

            $table->foreignId('user_id')->constrained();
            $table->foreignId('voucher_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
