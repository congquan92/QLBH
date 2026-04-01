<?php

namespace App\Http\Service;
use App\Enums\Status;
use App\Http\Mapper\SupplierMapper;
use App\Http\Requests\supplier\SupplierCreationRequest;
use App\Http\Responses\PageResponse;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class SupplierService
{
    public function findAll(?string $keyword, ?string $sort, ?string $status, int $page, int $size)
    {

        $query = Supplier::query();

        // 1. Lọc theo trạng thái
        // Nếu truyền status cụ thể (ví dụ: INACTIVE) thì lấy theo đó
        // Nếu không truyền, mặc định chỉ lấy các bản ghi ACTIVE (Giống như xóa mềm)
        if (!empty($status)) {
            $query->where('status', $status);

        } else {
            $query->where('status', '!=', Status::DISABLED->value);
        }

        // 2. Tìm kiếm theo từ khóa
        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('phone', 'like', "%{$keyword}%");
                // Lưu ý: Migration của bạn không có 'email', nên mình bỏ email để tránh lỗi SQL
            });
        }

        // 3. Sắp xếp
        $column = 'id';
        $direction = 'desc'; // Mặc định mới nhất lên đầu
        if ($sort && str_contains($sort, ':')) {
            [$column, $dir] = explode(':', $sort);
            $direction = strtolower($dir) === 'desc' ? 'desc' : 'asc';
        }

        $paginator = $query->orderBy($column, $direction)
            ->paginate($size, ['*'], 'page', $page);
        $dtoItems = $paginator->getCollection()->map(function ($supplier) {
            return SupplierMapper::toResponse($supplier);
        });

        $paginator->setCollection($dtoItems);
        return PageResponse::fromLaravelPaginator($paginator);
    }
    public function update(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $supplier = Supplier::findOrFail($id);

            $location = isset($data['location']) && is_array($data['location']) ? $data['location'] : [];

            $updateData = [
                'name' => $this->resolveStringValue($data, 'name', $supplier->name),
                'phone' => $this->resolveStringValue($data, 'phone', $supplier->phone),
                'address' => $this->resolveStringValue($data, 'address', $supplier->address),
                'ward' => $this->resolveStringValue($data, 'ward', $supplier->ward),
                'district' => $this->resolveStringValue($data, 'district', $supplier->district),
                'province' => $this->resolveStringValue($data, 'province', $supplier->province),
                'province_id' => $this->resolveIdValue($data, $location, 'province_id', 'provinceId', $supplier->province_id),
                'district_id' => $this->resolveIdValue($data, $location, 'district_id', 'districtId', $supplier->district_id),
                'ward_id' => $this->resolveIdValue($data, $location, 'ward_id', 'wardId', $supplier->ward_id),
            ];

            if (array_key_exists('status', $data) && !empty($data['status'])) {
                $updateData['status'] = $data['status'];
            }

            $supplier->update($updateData);

            return SupplierMapper::toResponse($supplier->refresh());
        });
    }
    public function getSupplierById($id)
    {
        $supplier = Supplier::where('id', $id)->firstOrFail();
        return SupplierMapper::toResponse($supplier);
    }
    public function create(SupplierCreationRequest $request)
    {
        DB::transaction(function () use ($request) {
            return Supplier::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'address' => $request->address,
                'ward' => $request->ward,
                'district' => $request->district,
                'province' => $request->province,
                'district_id' => $request->districtId,
                'province_id' => $request->provinceId,
                'ward_id' => $request->wardId,
                'status' => Status::ACTIVE,
            ]);
        });
    }

    private function resolveStringValue(array $data, string $key, $fallback): string
    {
        if (!array_key_exists($key, $data)) {
            return (string) $fallback;
        }

        $value = trim((string) ($data[$key] ?? ''));
        return $value !== '' ? $value : (string) $fallback;
    }

    private function resolveIdValue(array $data, array $location, string $snakeKey, string $camelKey, $fallback)
    {
        if (array_key_exists($snakeKey, $data) && $data[$snakeKey] !== null && $data[$snakeKey] !== '') {
            return $data[$snakeKey];
        }

        if (array_key_exists($camelKey, $data) && $data[$camelKey] !== null && $data[$camelKey] !== '') {
            return $data[$camelKey];
        }

        if (array_key_exists($snakeKey, $location) && $location[$snakeKey] !== null && $location[$snakeKey] !== '') {
            return $location[$snakeKey];
        }

        return $fallback;
    }
}