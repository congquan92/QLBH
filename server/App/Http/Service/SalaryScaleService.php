<?php
namespace App\Http\Service;

use App\Http\Requests\SalaryScale\SalaryScaleRequest;
use App\Models\SalaryScale;
use Illuminate\Support\Facades\DB;
class SalaryScaleService
{
    public function create(SalaryScaleRequest $req)
    {
        return DB::transaction(function () use ($req) {
            SalaryScale::create($req->validated());
        });
    }
    public function update(SalaryScaleRequest $request, $id)
    {
        $scale = SalaryScale::findOrFail($id);
        $scale->update($request->validated());
    }
    public function delete($id)
    {
        $scale = SalaryScale::findOrFail($id);
        $scale->delete();
    }
}