<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Pagination\LengthAwarePaginator;

class PageResponse implements Arrayable
{
    public function __construct(
        public mixed $data,
        public int $pageNumber,
        public int $pageSize,
        public int $totalPages,
        public int $totalElements
    ) {}

    /**
     * Chuyển đổi từ Laravel Paginator sang PageResponse (Static Factory Method)
     */
    public static function fromLaravelPaginator(LengthAwarePaginator $paginator): self
    {
        return new self(
            data: $paginator->items(), 
            pageNumber: $paginator->currentPage(),
            pageSize: $paginator->perPage(),
            totalPages: $paginator->lastPage(),
            totalElements: $paginator->total()
        );
    }

    public function toArray(): array
    {
        return [
            'data' => $this->data,
            'pageNumber' => $this->pageNumber,
            'pageSize' => $this->pageSize,
            'totalPages' => $this->totalPages,
            'totalElements' => $this->totalElements,
        ];
    }
}