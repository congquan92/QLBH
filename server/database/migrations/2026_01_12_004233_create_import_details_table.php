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
        Schema::create('import_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('quantity');
            $table->decimal('unitPrice', 15, 2);

            // Lưu ID variant nhưng KHÔNG dùng constrained() để có thể xóa cứng Variant thoải mái
            $table->unsignedBigInteger('product_variant_id')->nullable();

            // Sửa lại kiểu dữ liệu cho Snapshot (Phải là String/Text)
            $table->string('nameProductSnapShot');
            $table->string('urlImageSnapShot')->nullable();
            $table->text('variantAttributesSnapshot')->nullable();

            // Khóa ngoại tới phiếu nhập (Xóa phiếu nhập thì xóa luôn chi tiết)
            $table->foreignId('import_product_id')->constrained('import_products')->onDelete('cascade');

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
