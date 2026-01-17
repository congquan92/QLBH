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
            $table->string('urlVideo');
            $table->longText('description');
            $table->string('urlImageCover');
            $table->string('listPrice');
            $table->string('salePrice');
            $table->string('soldQuantity');
            $table->string('avgRating');
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
