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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('quantity');
            $table->boolean('is_reviewed')->default(false);
            $table->decimal('final_price', 15, 2);
            $table->decimal('list_price_snapShot', 15, 2);
            $table->string('name_product_snapshot');
            $table->string('url_image_snapShot');
            $table->json('variant_attributes_snapshot');
            $table->unsignedBigInteger('product_variant_id');
            $table->foreignId('order_id')->constrained();
            $table->foreignId('product_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
