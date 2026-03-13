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
    Schema::create('roles_group_permissions', function (Blueprint $table) {
        $table->foreignId('role_id')->constrained()->onDelete('cascade');
        // Đổi group_id thành group_permission_id
        $table->foreignId('group_permission_id')->constrained('group_permissions')->onDelete('cascade');
        $table->primary(['role_id', 'group_permission_id']);
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
