<?php

use App\Enums\AddressType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();


            $table->string('customer_name');
            $table->string('phone_number', 20);


            $table->string('address');
            $table->string('ward');
            $table->string('district');
            $table->string('province');


            $table->unsignedInteger('province_id');
            $table->unsignedInteger('district_id');
            $table->unsignedInteger('ward_id');



            $table->string('address_type')
                ->default(AddressType::HOME->value);

            $table->boolean('is_default')->default(false);
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('address');
    }
};
