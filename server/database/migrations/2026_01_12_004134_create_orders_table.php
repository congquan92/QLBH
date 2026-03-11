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

            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('delivery_ward_name');
            $table->string('delivery_ward_code');
            $table->unsignedInteger('delivery_district_id');
            $table->unsignedInteger('delivery_province_id');
            $table->string('delivery_district_name');
            $table->string('delivery_province_name');
            $table->string('delivery_address');
            $table->unsignedInteger('service_type_id');
            $table->decimal('original_order_amount',15,2);
            $table->unsignedInteger('weight');
            $table->unsignedInteger('length');
            $table->unsignedInteger('width');
            $table->unsignedInteger('height');
            $table->decimal('total_fee_for_ship',15,2);
            $table->string('order_tracking_code')->nullable();
            $table->string('note')->nullable();
            $table->decimal('total_amount',15,2);
            $table->decimal('voucher_discount_value',15,2)->nullable();
            $table->string('order_status')
                ->default(DeliveryStatus::PENDING->value);
            $table->string(column: 'payment_type');
            $table->string('payment_status')
                ->default(PaymentStatus::UNPAID->value);
            $table->dateTime('delivered_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('payment_at')->nullable();
            $table->boolean('is_confirmed')->default(false);

            $table->foreignId('user_id')->nullable()->constrained();
            $table->unsignedBigInteger('voucher_id')->nullable();
            $table->json('voucher_snapshot')->nullable();
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
