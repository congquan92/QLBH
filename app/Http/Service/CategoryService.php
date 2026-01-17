<?php

namespace App\Http\Service;
use App\Enums\Status;
use App\Http\Requests\category\CategoryCreationRequest;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
class CategoryService
{
    public function create(CategoryCreationRequest $requests): void
    {
        // Gate::authorize('CREATE_CATEGORIES');
        DB::transaction(function () use ($requests) {
            $requests = $requests->validated();
            foreach ($requests as $req) {
                $parent = null;
                if (!empty($item['parentId'])) {
                    $parent = Category::where('id', $req['parentId'])
                        ->where('status', Status::ACTIVE)
                        ->firstOrFail();
                }

                $this->saveChildrenCategory($req, $parent);
            }
        });
    }
    private function saveChildrenCategory($item, $parent)
    {
        $category = Category::create([
            'name' => $item['name'],
            'parent_id' => $parent?->id,
            'status' => Status::ACTIVE,
        ]);

        foreach ($item['childCategories'] ?? [] as $child) {
            $this->saveChildrenCategory($child, $category);
        }
    }
}
