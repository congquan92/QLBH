<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
           
            $table->id();

            $table->string('username', 100)->nullable()->unique();
            $table->string('email', 100)->nullable();
            $table->string('phone', 100)->nullable();
            $table->string('password');

            $table->string('full_name');

            $table->string('provider', 20)->nullable();
            $table->string('provider_id', 100)->nullable();

            $table->string('gender');
            $table->string('avatar')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('status')->default('ACTIVE');

   
            $table->boolean('email_verified')->default(false);
            $table->boolean('phone_verified')->default(false);

    
            $table->decimal('total_spent', 15, 2)->default(0);
            $table->integer('point')->default(0);


            $table->foreignId('user_rank_id')->constrained();
            $table->foreignId('role_id')->constrained('roles');

            $table->integer('token_version')->default(1);
            $table->foreignId('position_id')->nullable()->constrained('positions');
           
            $table->rememberToken();
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
