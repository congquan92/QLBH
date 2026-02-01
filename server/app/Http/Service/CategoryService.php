<?php

namespace App\Http\Service;
use App\Enums\Status;
use App\Http\Mapper\CategoryMapper;
use App\Http\Requests\category\CategoryCreationRequest;
use App\Http\Requests\Category\CategoryUpdateRequest;
use App\Http\Requests\Category\MoveCategoryRequest;
use App\Http\Responses\PageResponse;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
class CategoryService
{
    public function findAll()
    {
        // Gate::authorize('VIEW_ALL_CATEGORIES');
        $categories = Category::whereNull('parent_id')
            ->with('childrenRecursive')
            ->get();

        return $categories->map(fn(Category $cat) => CategoryMapper::toResponse($cat));
    }
    public function findAllWithPagination(int $page, int $size)
    {
        $query = Category::whereNull('parent_id')
            ->where('status', Status::ACTIVE)
            ->with([
                'childrenRecursive' => function ($q) {
                    $q->where('status', Status::ACTIVE);
                }
            ]);

        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($category) {
            return CategoryMapper::toResponse($category);
        });
        $paginator->setCollection($dtoItems);
        return PageResponse::fromLaravelPaginator($paginator);
    }
    public function update(CategoryUpdateRequest $req)
    {
        Gate::authorize('UPDATE_CATEGORIES');
        $category = Category::where('id', $req['id'])->where('status', Status::ACTIVE)->firstOrFail();

        if (!empty($req['parentId'])) {
            Category::where('id', $req['parent_id'])->where('status', Status::ACTIVE)->firstOrFail();
            $category->parent_id = $req['parentId'];
        }

        $category->name = $req['name'];
        $category->save();
    }
    public function delete(int $id)
    {
        Gate::authorize('DELETE_CATEGORIES');
        DB::transaction(function () use ($id) {
            $category = Category::findOrFail($id);
            $this->updateChildrenStatus($category, Status::INACTIVE);
            $category->status = Status::INACTIVE;
            $category->save();
        });
    }
    private function updateChildrenStatus(Category $parent, Status $status)
    {
        foreach ($parent->children as $child) {
            $child->status = $status;
            $child->save();
            $this->updateChildrenStatus($child, $status);
        }
    }
    public function restore(int $id)
    {
        Gate::authorize('RESTORE_CATEGORIES');
        $category = Category::findOrFail($id);

        if ($category->status === Status::ACTIVE) {
            throw new \Exception("Category is already active");
        }

        $this->restoreRecursively($category);
    }

    private function restoreRecursively(Category $category)
    {
        // Nếu cha tồn tại và đang bị ẩn -> restore cha trước
        if ($category->parent_id && $category->parent->status === Status::INACTIVE) {
            $this->restoreRecursively($category->parent);
        }
        $category->status = Status::ACTIVE;
        $category->save();
    }
    public function moveCategory(MoveCategoryRequest $req)
    {
        Gate::authorize('MOVE_CATEGORIES');
        $current = Category::where('id', $req['categoryId'])->where('status', Status::ACTIVE)->firstOrFail();

        if (empty($req['categoryParentId'])) {
            $current->parent_id = null;
        } else {
            Category::where('id', $req['categoryParentId'])->where('status', Status::ACTIVE)->firstOrFail();
            $current->parent_id = $req['categoryParentId'];
        }
        $current->save();
    }
    public function getCategoryById($id)
    {
        $category = Category::findOrFail($id);
        return CategoryMapper::toResponse($category);
    }

    public function getAllParentCategories(int $categoryId)
    {
        $current = Category::where('id', $categoryId)->where('status', Status::ACTIVE)->firstOrFail();
        $parents = collect([$current]);

        while ($current->parent) {
            $current = $current->parent;
            $parents->prepend($current); // Thêm vào đầu mảng giống add(0, current)
        }

        return $parents;
    }

    public function create(CategoryCreationRequest $requests): void
    {
        Gate::authorize('CREATE_CATEGORIES');
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
