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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('address');
            $table->string('province');
            $table->string('district');
            $table->string('ward');
            $table->string('province_id');
            $table->string('district_id');
             $table->string('phone');
            $table->string('ward_id');
            $table->string('status')->default(Status::ACTIVE);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
