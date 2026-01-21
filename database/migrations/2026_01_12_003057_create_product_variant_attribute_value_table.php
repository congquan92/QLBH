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
        Schema::create('product_variant_attribute_value', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_variant_id')
                ->constrained()
                ->cascadeOnDelete()
                ->name('fk_pvav_pv');

            $table->foreignId('product_attribute_value_id')
                ->constrained()
                ->cascadeOnDelete()
                ->name('fk_pvav_pav');    

            
            $table->unique(
                ['product_variant_id', 'product_attribute_value_id'],
                'uq_pvav_pv_pav'
            );

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variant_attribute_value');
    }
};
