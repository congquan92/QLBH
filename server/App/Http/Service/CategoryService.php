<?php

namespace App\Http\Service;
use App\Enums\Status;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Http\Mapper\CategoryMapper;
use App\Http\Requests\Category\CategoryCreationRequest;
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
    $categories = Category::whereNull('parent_id')
        ->where('status', Status::ACTIVE)
        ->with(['childrenRecursive' => function ($query) {
            // Lọc danh mục con phải ACTIVE
            $query->where('status', Status::ACTIVE);
        }])
        ->get();

    return $categories->map(fn(Category $cat) => CategoryMapper::toResponse($cat));
}
    public function findAllWithPagination(int $page, int $size, ?string $keyword, ?string $sort)
    {
        $query = Category::whereNull('parent_id')
            ->where('status', '!=', Status::DISABLED->value);

        if (!empty($keyword)) {
            // Tìm các Category cha MÀ CÓ con thỏa mãn keyword HOẶC chính nó thỏa mãn
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'LIKE', '%' . $keyword . '%')
                    ->orWhereHas('childrenRecursive', function ($childQuery) use ($keyword) {
                        $childQuery->where('name', 'LIKE', '%' . $keyword . '%');
                    });
            });
        }

        // 2. Xử lý sắp xếp (Ví dụ: sort=name_asc hoặc name_desc)
        if (!empty($sort)) {
            $direction = str_contains($sort, '_desc') ? 'desc' : 'asc';
            $column = str_replace(['_asc', '_desc'], '', $sort);
            $query->orderBy($column, $direction);
        } else {
            $query->orderBy('id', 'desc');
        }

        // 3. Load quan hệ (Lưu ý: Bạn chỉ lọc được cấp con trực tiếp)
        $query->with([
            'childrenRecursive' => function ($q) {
                $q->where('status', '!=', Status::DISABLED->value);
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
        $category = Category::where('id', $req->id)
            ->where('status', Status::ACTIVE)
            ->firstOrFail();

        $input = $req->validated();

        $data = [];

        if ($req->has('name'))
            $data['name'] = $input['name'];
        if ($req->has('status'))
            $data['status'] = $input['status'];

        if ($req->has('parentId')) {
            $parentId = $input['parentId'];

            if ($parentId == $category->id) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Danh mục không thể làm con của chính nó.");
            }

            $data['parent_id'] = $parentId;
        }

        $category->update($data);

        return $category;
    }
    public function delete(int $id)
    {
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
        $category = Category::findOrFail($id);

        if ($category->status === Status::ACTIVE) {
            throw new \Exception("Category is already active");
        }

        $this->restoreRecursively($category);
    }

    private function restoreRecursively(Category $category)
    {
        if ($category->parent_id && $category->parent->status === Status::INACTIVE) {
            $this->restoreRecursively($category->parent);
        }
        $category->status = Status::ACTIVE;
        $category->save();
    }
   public function moveCategory(MoveCategoryRequest $req)
{
    $current = Category::where('id', $req['categoryId'])
        ->where('status', Status::ACTIVE)
        ->firstOrFail();

    $newParentId = $req['categoryParentId'] ?? null;

    if ($newParentId !== null) {
        // 1. Kiểm tra không được chọn chính mình làm cha
        if ($newParentId == $current->id) {
            throw new \Exception('Không thể di chuyển danh mục vào chính nó!');
        }

        // 2. Kiểm tra không được chọn con của mình làm cha (Tránh vòng lặp vô hạn)
        $childIds = $current->getAllChildIds(); // Hàm bạn đã có trong Model
        if (in_array($newParentId, $childIds)) {
            throw new \Exception('Không thể di chuyển danh mục vào danh mục con của nó!');
        }

        // 3. Kiểm tra cha phải tồn tại và đang ACTIVE
        Category::where('id', $newParentId)
            ->where('status', Status::ACTIVE)
            ->firstOrFail();
    }

    $current->parent_id = $newParentId;
    $current->save();
}
    public function getCategoryById($id)
    {
        $category = Category::where('id', $id)
            ->where('status', Status::ACTIVE)->firstOrFail();
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
