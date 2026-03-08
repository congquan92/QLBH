<?php

namespace App\Http\Mapper;

use App\Models\Category;
use App\Enums\Status;

class CategoryMapper
{

    public static function toResponse($category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'status' => $category->status,
            'createAt' => $category->created_at,
            'childCategory' => $category->childrenRecursive->map(function ($child) {
                return self::toResponse($child);
            })->toArray(),
        ];
    }

    public static function toResponseActiveOnly($category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'status' => $category->status,
            'createAt' => $category->created_at,
            'childCategory' => $category->childrenRecursive
                ->filter(fn($child) => $child->status === Status::ACTIVE)
                ->map(function ($child) {
                    return self::toResponseActiveOnly($child);
                })->values()->toArray(),
        ];
    }

}