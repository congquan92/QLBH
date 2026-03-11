<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('quantity');

            // Vẫn giữ khóa ngoại cho User (vì User thường không xóa cứng)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // CHỈ LƯU ID, KHÔNG RÀNG BUỘC (Bo khóa ngoại)
            $table->unsignedBigInteger('product_variant_id');

            // BẮT BUỘC phải thêm các cột Snapshot này để khi xóa Variant 
            // thì trong giỏ hàng vẫn còn thông tin để hiển thị
            $table->double('list_price_snapshot')->nullable();
            $table->string('url_image_snapshot')->nullable();
            $table->string('name_product_snapshot')->nullable();
            $table->json('variant_attributes_snapshot')->nullable();

            $table->string('status')->default('ACTIVE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
