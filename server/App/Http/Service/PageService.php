<?php
namespace App\Http\Service;

use App\Http\Mapper\PageMapper;
use App\Http\Responses\PageResponse;
use App\Models\GroupPermission;
use App\Models\Page;
use Illuminate\Support\Facades\DB;

class PageService
{
    /**
     * Tìm kiếm và phân trang
     */
    public function findAll(?string $keyword, ?string $sort, int $page, int $size)
    {
        // Khởi tạo query với các quan hệ: Page -> GroupPermissions -> Permissions
        $query = Page::with(['groupPermissions.permissions', 'roles']);

        // Logic sắp xếp
        $column = 'sort_order'; // Mặc định sắp xếp theo sort_order của Page
        $direction = 'asc';

        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }

        // Tìm kiếm theo title của Page
        if (!empty($keyword)) {
            $query->where('title', 'like', "%{$keyword}%");
        }

        // Thực hiện phân trang
        $paginator = $query->orderBy($column, $direction)
            ->paginate($size, ['*'], 'page', $page);

        // Map sang DTO Response (nếu bạn sử dụng Mapper)
        $dtoItems = $paginator->getCollection()->map(function ($pageItem) {
            // Thay đổi sang PageMapper tương ứng của bạn
            return PageMapper::toPageResponse($pageItem);
        });

        $paginator->setCollection($dtoItems);

        // Trả về theo cấu trúc chung của dự án bạn
        return PageResponse::fromLaravelPaginator($paginator);
    }
    /**
     * Lấy chi tiết một Page theo ID
     */
    public function findById($id)
    {
        $page = Page::with(['groupPermissions.permissions'])->findOrFail($id);

        return PageMapper::toPageResponse($page);
    }
    public function createPage(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Tạo Page mới
            $page = Page::create([
                'title' => $data['title'],
                'icon' => $data['icon'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
            ]);

            // 2. Gán các GroupPermission vào Page này
            if (!empty($data['group_permission_ids'])) {
                GroupPermission::whereIn('id', $data['group_permission_ids'])
                    ->update(['page_id' => $page->id]);
            }

            return $page->load('groupPermissions');
        });
    }

    public function updatePage($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $page = Page::findOrFail($id);

            // Cập nhật thông tin Page
            $page->update([
                'title' => $data['title'],
                'icon' => $data['icon'] ?? $page->icon,
                'sort_order' => $data['sort_order'] ?? $page->sort_order,
            ]);

            // Cập nhật lại danh sách GroupPermissions
            if (isset($data['group_permission_ids'])) {
                // B1: Gỡ bỏ page_id cũ của những group cũ (set null)
                GroupPermission::where('page_id', $page->id)->update(['page_id' => null]);

                // B2: Gán page_id mới cho những group được gửi lên
                GroupPermission::whereIn('id', $data['group_permission_ids'])
                    ->update(['page_id' => $page->id]);
            }

            return $page->load('groupPermissions');
        });
    }

    public function deletePage($id)
    {
        return DB::transaction(function () use ($id) {
            $page = Page::findOrFail($id);

            // 1. Giải phóng các GroupPermission (set page_id = null)
            // Vì là quan hệ 1-N, nếu xóa Page mà không xử lý Group thì sẽ bị lỗi FK hoặc mồ côi
            GroupPermission::where('page_id', $page->id)->update(['page_id' => null]);

            // 2. Xóa liên kết Many-to-Many với Roles (bảng roles_pages)
            $page->roles()->detach();

            // 3. Xóa Page
            return $page->delete();
        });
    }

    public function detachGroupPermissions($pageId, array $groupPermissionIds)
    {
        return DB::transaction(function () use ($pageId, $groupPermissionIds) {
            $page = Page::findOrFail($pageId);

            // 1. Kiểm tra xem các Group truyền lên có thực sự thuộc Page này không
            $validCount = GroupPermission::where('page_id', $page->id)
                ->whereIn('id', $groupPermissionIds)
                ->count();

            // Nếu số lượng tìm thấy ít hơn số lượng gửi lên -> có ID sai hoặc thuộc Page khác
            if ($validCount !== count($groupPermissionIds)) {
                throw new \Exception("Một hoặc nhiều nhóm quyền không thuộc trang này, không thể gỡ bỏ.");
            }

            // 2. Thực hiện gỡ bỏ
            GroupPermission::where('page_id', $page->id)
                ->whereIn('id', $groupPermissionIds)
                ->update(['page_id' => null]);

            // 3. Trả về dữ liệu
            return PageMapper::toPageResponse($page->load('groupPermissions.permissions'));
        });
    }
}