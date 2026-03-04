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
       Schema::create('group_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->nullable()->constrained('pages')->cascadeOnDelete(); // Quan hệ 1-N với Page
            $table->string('name'); // VD: "Nhân viên"
            $table->string('url')->nullable(); // VD: "/admin/employees"
            $table->string('icon')->nullable(); // VD: "Users"
            $table->string('status')->default('ACTIVE');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_permissions');
    }
};
