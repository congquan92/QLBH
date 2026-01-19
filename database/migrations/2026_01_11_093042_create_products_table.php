<?php

use App\Enums\Status;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('url_video');
            $table->longText('description');
            $table->string('url_image_cover');
            $table->string('list_price');
            $table->string('sale_price');
            $table->string('sold_quantity');
            $table->string('avg_rating');
            $table->string('status')->default(Status::ACTIVE);
            $table->foreignId('supplier_id')->constrained();
            $table->foreignId('category_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
