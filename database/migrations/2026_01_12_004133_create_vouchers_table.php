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
            $table->double('discountValue');
            $table->double('maxDiscountValue');
            $table->double('minDiscountValue')->default(0.0);
            $table->unsignedBigInteger('totalQuantity');
            $table->boolean('isShipping');
            $table->string('status')->default(VoucherStatus::ACTIVE);
            $table->unsignedBigInteger('usedQuantity');
            $table->unsignedBigInteger('remainingQuantity');
            $table->dateTime('startDate');
            $table->dateTime('endDate');
            $table->unsignedBigInteger('usageLimitPerUser');
            
            $table->foreignId('user_rank_id')->constrained();
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
