<?php
namespace App\Http\Service;

use App\Enums\Status;
use App\Enums\VoucherType;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Http\Mapper\VoucherMapper;
use App\Http\Requests\Voucher\VoucherCreationRequest;
use App\Http\Responses\PageResponse;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use DB;
use Illuminate\Support\Carbon;
class VoucherService
{
    public function findAll(?string $sort, int $page, int $size)
    {
        $user = auth()->user();

        // 1. Chặn Guest ngay lập tức
        if (!$user) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Vui lòng đăng nhập để hiển thị voucher khả dụng!");
        }

        $query = Voucher::query();

        // 2. Logic "getAvailableVouchersForUser" viết thẳng vào đây:
        // Lấy mức chi tiêu tối thiểu của hạng hiện tại mà User đang đạt được
        $userMinSpent = $user->userRank->min_spent ?? 0;

        $query->where('status', 'ACTIVE')
            ->where('remaining_quantity', '>', 0)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->where(function ($q) use ($userMinSpent) {
                $q->whereHas('userRank', function ($sub) use ($userMinSpent) {
                    // Lấy các Voucher có yêu cầu chi tiêu thấp hơn hoặc bằng mức của User
                    $sub->where('min_spent', '<=', $userMinSpent);
                })
                    ->orWhereNull('user_rank_id'); // Bao gồm cả voucher không yêu cầu hạng (Public)
            });

        // 3. Xử lý Sắp xếp (Sort)
        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        }

        // 4. Phân trang
        $paginator = $query->orderBy($column, $direction)
            ->paginate($size, ['*'], 'page', $page);

        // 5. Mapping dữ liệu (Truyền $user vào nếu Mapper của bạn cần check thêm logic)
        $dtoItems = $paginator->getCollection()->map(function ($voucher) use ($user) {
            return VoucherMapper::toVoucherResponse($voucher, $user);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
    public function findAllByAdmin(
        ?string $keyword,
        ?string $rank,
        ?string $sort,
        ?string $timeStatus,
        ?string $startDate,
        ?string $endDate,
        int $page,
        int $size
    ) {
        $query = Voucher::with(['userRank']); // Eager load để tránh N+1 query

        // 1. Xử lý Sort
        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }

        // 2. Filter theo timeStatus "valid" (Ưu tiên số 1)
        if (strtolower($timeStatus) === 'valid') {
            $query->where('start_date', '<=', now())
                ->where('end_date', '>=', now());
        }

        // 3. Filter theo khoảng thời gian (startDate & endDate)
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($startDate),
                Carbon::parse($endDate)
            ]);
        }

        // 4. Filter theo Keyword
        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('description', 'like', "%{$keyword}%")
                    ->orWhere('name', 'like', "%{$keyword}%"); // Giả định có cột name
            });
        }

        // 5. Filter theo Rank Name
        if (!empty($rank)) {
            $query->whereHas('userRank', function ($q) use ($rank) {
                $q->where('name', $rank)
                    ->where('status', 'ACTIVE');
            });
        }

        // 6. Thực thi Query & Mapping
        $paginator = $query->orderBy($column, $direction)
            ->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($voucher) {
            return VoucherMapper::toVoucherResponse($voucher);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function add(VoucherCreationRequest $request)
    {
        $data = $request->validated();
        $data['remaining_quantity'] = $data['total_quantity'];
        $data['used_quantity'] = 0;
        return Voucher::create($data);
    }
    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data): void {
            $voucher = Voucher::where('id', $id)->firstOrFail();
            $voucher->update($data);
        });
    }
    public function getVoucherById($id)
    {
        $voucher = Voucher::where('id', $id)
            ->where('status', Status::ACTIVE)->firstOrFail();
        return VoucherMapper::toVoucherResponse($voucher);
    }
    public function validateVoucherWithOrderAmount(Voucher $voucher, $orderAmount)
    {
        $now = Carbon::now();

        if ($orderAmount < $voucher->min_discount_value) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng không đủ điều kiện áp dụng voucher");
        }

        if ($now->lt($voucher->start_date) || $now->gt($voucher->end_date)) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Voucher đã hết hạn");
        }

        if ($voucher->remaining_quantity <= 0) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Voucher đã hết lượt sử dụng");
        }

        return true;
    }

    /**
     * Kiểm tra điều kiện sử dụng của User (Rank, Giới hạn sử dụng)
     */
    public function validateVoucherUsageUser(Voucher $voucher, ?User $user)
    {

        if (!$user) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Bạn cần đăng nhập để sử dụng voucher này");
        }

        if ($voucher->user_rank_id) {
            $voucherRank = $voucher->userRank;
            $userRank = $user->userRank;

            if (!$userRank) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Bạn chưa có hạng thành viên để dùng voucher này");
            }

            if ($userRank->min_spent < $voucherRank->min_spent) {
                throw new BusinessException(
                    ErrorCode::BAD_REQUEST,
                    "Hạng '{$userRank->name}' không thể dùng voucher dành cho thành viên '{$voucherRank->name}'"
                );
            }
        }

        $usedCount = VoucherUsage::where('voucher_id', $voucher->id)
            ->where('user_id', $user->id)
            ->count();

        if ($usedCount >= $voucher->usage_limit_per_user) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Bạn đã sử dụng hết lượt cho phép của voucher này");
        }

        return true;
    }

    /**
     * Tính toán giá trị giảm giá
     */
    public function calculateDiscountValue($orderAmount, Voucher $voucher)
    {
        $discount = 0;

        if ($voucher->type === VoucherType::PERCENTAGE) {
            $percent = $voucher->discount_value / 100;
            $discount = $orderAmount * $percent;
        } else {
            $discount = $voucher->discount_value;
        }

        if ($voucher->max_discount_value !== null) {
            $discount = min($discount, $voucher->max_discount_value);
        }

        return $discount;
    }

    /**
     * Giảm số lượng voucher khi sử dụng thành công
     */
    public function decreaseVoucherQuantity(Voucher $voucher)
    {
        $voucher->increment('used_quantity', 1);
        $voucher->decrement('remaining_quantity', 1);
    }
}