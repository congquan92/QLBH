<?php

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
       Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // VD: "Quản lý nhân sự"
            $table->string('icon')->nullable(); // VD: "Briefcase"
            $table->integer('sort_order')->default(0); // Thứ tự hiển thị
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
