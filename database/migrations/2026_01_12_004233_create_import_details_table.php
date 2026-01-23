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
        Schema::create('import_details', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('quantity');
            $table->unsignedBigInteger('nameProductSnapShot');
            $table->unsignedBigInteger('urlImageSnapShot');
            $table->unsignedBigInteger('variantAttributesSnapshot');
            $table->decimal('unitPrice', 15, 2);

            $table->foreignId('import_product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_details');
    }
};
