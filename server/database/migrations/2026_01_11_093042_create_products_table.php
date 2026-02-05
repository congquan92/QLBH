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
            $table->string('url_video')->nullable();
            $table->longText('description')->nullable();
            $table->string('url_image_cover');
            $table->decimal('list_price',15,2)->default(0);
            $table->decimal('sale_price',15,2)->default(0);
            $table->unsignedBigInteger('sold_quantity');
            $table->double('avg_rating');
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
