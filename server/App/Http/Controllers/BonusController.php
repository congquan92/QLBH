<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Models\Bonus;
use Illuminate\Http\Request;

class BonusController extends Controller
{
    use ApiResponse;

    /**
     * Lấy danh sách bonus của 1 nhân viên theo tháng/năm
     * GET /api/bonuses?user_id=1&month=3&year=2026
     * hoặc lấy tất cả bonus của 1 tháng:
     * GET /api/bonuses?month=3&year=2026
     */
    public function index(Request $request)
    {
        $query = Bonus::with(['user:id,full_name,email', 'creator:id,full_name']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('month')) {
            $query->where('month', $request->month);
        }
        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        $bonuses = $query->orderBy('created_at', 'desc')->get();

        return $this->success($bonuses);
    }

    /**
     * Tạo bonus mới cho nhân viên
     * POST /api/bonuses
     * Body: { user_id, month, year, amount, reason, type }
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'month'   => 'required|integer|between:1,12',
            'year'    => 'required|integer|min:2020',
            'amount'  => 'required|numeric|min:0',
            'reason'  => 'nullable|string|max:500',
            'type'    => 'nullable|string|in:OVERTIME,BONUS,ALLOWANCE',
        ]);

        $bonus = Bonus::create([
            'user_id'    => $request->user_id,
            'month'      => $request->month,
            'year'       => $request->year,
            'amount'     => $request->amount,
            'reason'     => $request->reason,
            'type'       => $request->type ?? 'OVERTIME',
            'created_by' => auth()->id(),
        ]);

        $bonus->load(['user:id,full_name,email', 'creator:id,full_name']);

        return $this->success($bonus, 'Thêm tiền thưởng thành công.', 201);
    }

    /**
     * Cập nhật bonus
     * PUT /api/bonuses/{id}
     */
    public function update(Request $request, $id)
    {
        $bonus = Bonus::findOrFail($id);

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'reason' => 'nullable|string|max:500',
            'type'   => 'nullable|string|in:OVERTIME,BONUS,ALLOWANCE',
        ]);

        $bonus->update([
            'amount' => $request->amount,
            'reason' => $request->reason ?? $bonus->reason,
            'type'   => $request->type ?? $bonus->type,
        ]);

        $bonus->load(['user:id,full_name,email', 'creator:id,full_name']);

        return $this->success($bonus, 'Cập nhật tiền thưởng thành công.');
    }

    /**
     * Xóa bonus
     * DELETE /api/bonuses/{id}
     */
    public function destroy($id)
    {
        $bonus = Bonus::findOrFail($id);
        $bonus->delete();

        return $this->success(null, 'Đã xóa tiền thưởng.');
    }

    /**
     * Lấy tổng bonus theo user và tháng/năm
     * GET /api/bonuses/summary?month=3&year=2026
     */
    public function summary(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year'  => 'required|integer|min:2020',
        ]);

        $summaries = Bonus::where('month', $request->month)
            ->where('year', $request->year)
            ->selectRaw('user_id, SUM(amount) as total_bonus')
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        return $this->success($summaries);
    }
}
