<?php

namespace App\Http\Service;

use App\Enums\DeliveryStatus;
use App\Enums\Status;
use App\Http\Mapper\ProductVariantMapper;
use App\Http\Responses\PageResponse;
use App\Models\ImportProduct;
use App\Models\ImportDetail;
use App\Models\ProductVariant;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class ImportService
{
    /**
     * Lấy danh sách phiếu nhập (Phân trang + Lọc + Search)
     */
    public function findAll(
        ?string $keyword,
        ?string $sort,
        int $page,
        int $size,
        ?string $timeRange,
        $startDate,
        $endDate,
        ?int $supplierId,
        ?string $deliveryStatus
    ) {
        // Eager load: ImportProduct -> Product (để lấy supplier) -> ImportDetail
        $query = ImportProduct::with(['product.supplier', 'importDetail']);
        $query->where('view_status', Status::ACTIVE->value);

        // 1. Lọc theo thời gian
        $this->applyTimeRangeFilter($query, $timeRange, $startDate, $endDate);

        // 2. Lọc theo Supplier (Supplier nằm trong Product)
        if ($supplierId) {
            $query->whereHas('product', function ($q) use ($supplierId) {
                $q->where('supplier_id', $supplierId);
            });
        }

        // 3. Lọc theo Trạng thái phiếu nhập
        if ($deliveryStatus) {
            $query->where('status', $deliveryStatus);
        }

        // 4. Tìm kiếm theo Từ khóa (Tên sản phẩm hoặc Mô tả phiếu)
        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('description', 'like', "%$keyword%")
                    ->orWhereHas('product', function ($sq) use ($keyword) {
                        $sq->where('name', 'like', "%$keyword%");
                    });
            });
        }

        // 5. Sắp xếp
        $column = 'id';
        $direction = 'desc';
        if ($sort && str_contains($sort, ':')) {
            [$column, $dir] = explode(':', $sort);
            $direction = strtolower($dir) === 'desc' ? 'desc' : 'asc';
        }

        $paginator = $query->orderBy($column, $direction)->paginate($size, ['*'], 'page', $page);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    // Trong App\Http\Service\ImportProductService.php

    public function getById(int $id)
    {
        // Sử dụng 'with' để nạp sẵn chi tiết phiếu nhập
        return ImportProduct::with('importDetail','product.supplier')
            ->findOrFail($id);
    }

    /**
     * Tạo mới phiếu nhập và các chi tiết (Snapshot)
     */
    public function save(array $request)
    {
        return DB::transaction(function () use ($request) {
            // Tạo phiếu nhập
            $importProduct = ImportProduct::create([
                'product_id' => $request['product_id'],
                'description' => $request['description'] ?? '',
                'totalAmount' => 0,
                'status' => DeliveryStatus::PENDING,
            ]);

            $totalAmount = 0;

            foreach ($request['import_details'] as $detailReq) {
                // 1. Lấy thông tin Variant và thông tin Product cha
                $variant = ProductVariant::with(['product', 'attributeValues.productAttribute.attribute'])
                    ->findOrFail($detailReq['product_variant_id']);

                // Kiểm tra xem variant có thuộc đúng product không
                if ($variant->product_id != $request['product_id']) {
                    throw new \Exception("Biến thể không thuộc sản phẩm này.");
                }

                // 2. Chuyển đổi Variant sang Response (để lấy format chuẩn)
                $variantResponse = ProductVariantMapper::toVariantResponse($variant);

                // 3. Tạo snapshot
                $detail = $importProduct->importDetail()->create([
                    'quantity' => $detailReq['quantity'],
                    'unitPrice' => $detailReq['unitPrice'],
                    'product_variant_id' => $variant->id,
                    'nameProductSnapShot' => $variant->product->name . ' - ' . $variant->sku,
                    // Lấy ảnh từ thuộc tính đầu tiên có ảnh, hoặc ảnh cover của sản phẩm
                    'urlImageSnapShot' => $variant->product->url_image_cover,

                    // Chuyển toàn bộ thông tin attribute thành JSON
                    'variantAttributesSnapshot' => json_encode($variantResponse),
                ]);

                $totalAmount += ($detail->quantity * $detail->unitPrice);
            }
            $importProduct->update(['totalAmount' => $totalAmount]);

            return $importProduct;
        });
    }

    /**
     * Xóa chi tiết (XÓA CỨNG)
     */
    public function removeDetailFromPendingImport(int $importId, int $detailId)
    {
        return DB::transaction(function () use ($importId, $detailId) {
            $importProduct = ImportProduct::findOrFail($importId);

            if ($importProduct->status !== DeliveryStatus::PENDING) {
                throw new Exception("Chỉ có thể chỉnh sửa phiếu ở trạng thái PENDING.");
            }

            $detailToRemove = ImportDetail::where('id', $detailId)
                ->where('import_product_id', $importId)
                ->firstOrFail();

            // Xóa cứng record khỏi DB
            $detailToRemove->delete();

            // Tính lại tổng tiền cho phiếu nhập
            $this->recalculateImportTotalAmount($importProduct);
        });
    }

    /**
     * Cập nhật số lượng hàng loạt cho chi tiết phiếu
     */
    public function updateQuantityDetailFromPendingImport(array $requestItems, int $importId)
    {
        return DB::transaction(function () use ($requestItems, $importId) {
            $importProduct = ImportProduct::findOrFail($importId);

            if ($importProduct->status !== DeliveryStatus::PENDING) {
                throw new \Exception("Phiếu nhập không ở trạng thái PENDING, không thể cập nhật.");
            }

            foreach ($requestItems as $item) {
                // Kiểm tra tồn tại và quyền sở hữu trong cùng 1 query
                $detail = ImportDetail::where('id', $item['importDetailId'])
                    ->where('import_product_id', $importId)
                    ->first();

                // Nếu không tìm thấy, nghĩa là ID sai hoặc không thuộc phiếu nhập này
                if (!$detail) {
                    throw new \Exception("Chi tiết phiếu nhập ID {$item['importDetailId']} không tồn tại hoặc không thuộc phiếu nhập này.");
                }

                $detail->update(['quantity' => $item['quantity']]);
            }

            $this->recalculateImportTotalAmount($importProduct);
        });
    }

    /**
     * Xác nhận nhập kho (Confirm) - Cập nhật số lượng Variant thực tế
     */
    public function confirmImport(int $importId)
    {
        return DB::transaction(function () use ($importId) {
            $importProduct = ImportProduct::with('importDetail')->findOrFail($importId);

            if ($importProduct->status !== DeliveryStatus::PENDING) {
                throw new Exception("Phiếu nhập không ở trạng thái PENDING.");
            }

            foreach ($importProduct->importDetail as $detail) {
                // Tìm Variant dựa trên ID đã lưu trong snapshot
                $variant = ProductVariant::find($detail->product_variant_id);

                if ($variant) {
                    // Tăng số lượng tồn kho
                    $variant->increment('quantity', $detail->quantity);
                } else {
                    throw new Exception("Sản phẩm biến thể (ID: {$detail->product_variant_id}) không tồn tại hoặc đã bị xóa. Không thể nhập kho.");
                }
            }

            // Chuyển sang trạng thái hoàn thành
            $importProduct->update(['status' => DeliveryStatus::COMPLETED]);
        });
    }

    /**
     * Hủy phiếu nhập
     */
    public function cancelImport(int $importId)
    {
        $importProduct = ImportProduct::findOrFail($importId);

        if ($importProduct->status !== DeliveryStatus::PENDING) {
            throw new Exception("Chỉ có thể hủy phiếu đang ở trạng thái PENDING.");
        }

        $importProduct->update(['status' => DeliveryStatus::CANCELLED]);
    }

    /**
     * Tính lại tổng tiền (Dựa trên các detail hiện có)
     */
    private function recalculateImportTotalAmount(ImportProduct $importProduct)
    {
        // Làm mới dữ liệu quan hệ để tính toán chính xác sau khi xóa/sửa
        $newTotal = $importProduct->importDetail()
            ->get()
            ->sum(fn($detail) => $detail->quantity * $detail->unitPrice);

        $importProduct->update(['totalAmount' => $newTotal]);
    }

    /**
     * Helper lọc theo thời gian
     */
    private function applyTimeRangeFilter($query, $timeRange, $startDate, $endDate)
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : null;
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : null;

        if ($timeRange) {
            $now = Carbon::now();
            switch (strtoupper($timeRange)) {
                case 'TODAY':
                    $start = $now->startOfDay();
                    $end = $now->endOfDay();
                    break;
                case 'YESTERDAY':
                    $start = $now->subDay()->startOfDay();
                    $end = $now->subDay()->endOfDay();
                    break;
                case 'LASTWEEK':
                    $start = $now->subWeek()->startOfWeek();
                    $end = $now->subWeek()->endOfWeek();
                    break;
                case 'LASTMONTH':
                    $start = $now->subMonth()->startOfMonth();
                    $end = $now->subMonth()->endOfMonth();
                    break;
            }
        }

        if ($start)
            $query->where('created_at', '>=', $start);
        if ($end)
            $query->where('created_at', '<=', $end);
    }

    public function delete(int $importId)
    {
        return DB::transaction(function () use ($importId) {
            // 1. Tìm phiếu nhập
            $importProduct = ImportProduct::findOrFail($importId);

            // 2. Chỉ cho phép xóa khi đang PENDING
            if ($importProduct->status !== DeliveryStatus::PENDING) {
                throw new \Exception("Chỉ có thể xóa phiếu nhập khi ở trạng thái PENDING.");
            }

            // 3. Xóa các chi tiết trước (để đảm bảo tính toàn vẹn)
            // Nếu database của bạn đã có "ON DELETE CASCADE", dòng này có thể bỏ qua
            $importProduct->importDetail()->delete();

            // 4. Xóa phiếu nhập
            $importProduct->delete();

            return true;
        });
    }
}