<?php

namespace App\Http\Service;
use App\Enums\Status;
use App\Http\Requests\supplier\SupplierCreationRequest;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class SupplierService{
    public function create(SupplierCreationRequest $request){
        Gate::authorize('ADD_SUPPLIER');
        DB::transaction(function () use ($request){
            return Supplier::create([
                'name' => $request->name,
                'phone'       => $request->phone,
                'address'     => $request->address,
                'ward'        => $request->ward,
                'district'    => $request->district,
                'province'    => $request->province,
                'district_id' => $request->districtId,
                'province_id' => $request->provinceId,
                'ward_id'     => $request->wardId,
                'status'      => Status::ACTIVE,
            ]);
       });
    }
}