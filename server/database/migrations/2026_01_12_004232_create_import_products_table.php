<?php

use App\Enums\DeliveryStatus;
use App\Enums\Status;
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
        Schema::create('import_products', function (Blueprint $table) {
            $table->id();

            $table->string('description');
            $table->decimal('totalAmount',15,2);
            $table->string('status')
                  ->default(DeliveryStatus::PENDING->value);
            $table->string('view_status')->default(Status::ACTIVE->value);      
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_products');
    }
};
