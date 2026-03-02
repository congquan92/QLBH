<?php
namespace App\Http\Service;

use App\Http\Requests\Product\PositionCreationRequest;
use App\Models\Position;
class HRMService{
  public function createPosition(PositionCreationRequest $request){
    $position = Position::create($request->all());
  }
}