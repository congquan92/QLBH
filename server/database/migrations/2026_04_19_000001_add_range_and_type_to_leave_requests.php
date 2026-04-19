<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->string('leave_type')->default('ANNUAL')->after('shift_id');
            $table->date('start_date')->nullable()->after('leave_type');
            $table->date('end_date')->nullable()->after('start_date');

            $table->index(['user_id', 'start_date', 'end_date'], 'user_leave_range_index');
            $table->index('leave_type');
        });
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropIndex('user_leave_range_index');
            $table->dropIndex(['leave_type']);
            $table->dropColumn(['leave_type', 'start_date', 'end_date']);
        });
    }
};
