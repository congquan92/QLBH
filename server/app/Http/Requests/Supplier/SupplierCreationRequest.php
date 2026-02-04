<?php
namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;

class SupplierCreationRequest extends FormRequest{
    public function authorize(){
        return true;
    }
// 
    public function rules(){
        return [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'province' => 'required|string',
            'district' => 'required|string',
            'ward' => 'required|string',
            'provinceId' => 'required|integer',
            'districtId' => 'required|integer',
            'wardId' => 'required|integer',
            'phone'      => [
                'required',
                'regex:/^(0[0-9]{9}|\+84[0-9]{9})$/'
            ],
        ];
    }
    public function messages(): array
    {
        return [
            'name.required'       => 'Fullname not blank',
            'address.required'    => 'Address not blank',
            'province.required'   => 'Province not blank',
            'district.required'   => 'District not blank',
            'ward.required'       => 'Ward not blank',
            'provinceId.required' => 'Province ID not null',
            'districtId.required' => 'District ID not null',
            'wardId.required'     => 'Ward ID not blank',
            'phone.required'      => 'Phone number not blank',
            'phone.regex'         => 'Phone number is invalid',
        ];
    }
}