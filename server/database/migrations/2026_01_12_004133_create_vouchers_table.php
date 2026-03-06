<?php

use App\Enums\VoucherStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();

            $table->string('description');
            $table->string('type');
            $table->double('discount_value'); // Sửa: discountValue -> discount_value
            $table->double('max_discount_value'); // Sửa: maxDiscountValue -> max_discount_value
            $table->double('min_discount_value')->default(0.0); // Sửa: minDiscountValue -> min_discount_value
            $table->unsignedBigInteger('total_quantity'); // Sửa: totalQuantity -> total_quantity
            $table->boolean('is_shipping'); // Sửa: isShipping -> is_shipping
            $table->string('status')->default(VoucherStatus::ACTIVE->value);
            $table->unsignedBigInteger('used_quantity')->default(0); // Sửa: usedQuantity
            $table->unsignedBigInteger('remaining_quantity'); // Sửa: remainingQuantity
            $table->dateTime('start_date'); // Sửa: startDate -> start_date
            $table->dateTime('end_date'); // Sửa: endDate -> end_date
            $table->unsignedBigInteger('usage_limit_per_user')->nullable(); // Sửa: usageLimitPerUser
            
            $table->foreignId('user_rank_id')->constrained('user_ranks');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};