"use client";

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
}

export default function ProductPagination({ currentPage, totalPages, onPageChange }: ProductPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Không hiển thị pagination nếu chỉ có 1 trang
    // if (totalPages <= 1) {
    //     return null;
    // }

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const showPages = 4; // Số trang tối đa hiển thị
        if (totalPages <= showPages) {
            // hiển thị tất cả nếu <= showPages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Luôn hiển thị trang đầu
            pages.push(1);
            if (currentPage > 3) {
                pages.push("ellipsis");
            }
            // Trang xung quanh trang hiện tại
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) {
                pages.push("ellipsis");
            }
            pages.push(totalPages); // Luôn hiển thị trang cuối
        }

        return pages;
    };

    // Styles : black and white, rounded-none
    const itemBase = "rounded-none border-black h-10 w-10 p-0 flex items-center justify-center transition-colors cursor-pointer";
    const activeStyle = "bg-black text-white hover:bg-black/90 hover:text-white";
    const inactiveStyle = "bg-white text-black hover:bg-black hover:text-white";
    const disabledStyle = "pointer-events-none opacity-20 border-gray-600";

    return (
        <div className="flex flex-col items-center gap-4 py-6">
            <Pagination>
                <PaginationContent className="gap-2">
                    {/*  Previous */}
                    <PaginationItem>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) handlePageChange(currentPage - 1);
                            }}
                            className={cn(itemBase, "border", currentPage <= 1 ? disabledStyle : inactiveStyle)}
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                    </PaginationItem>

                    {/* Các số trang */}
                    {getPageNumbers().map((page, index) =>
                        page === "ellipsis" ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <div className="flex size-10 items-center justify-center">
                                    <PaginationEllipsis />
                                </div>
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page);
                                    }}
                                    isActive={page === currentPage}
                                    className={cn(itemBase, "border", page === currentPage ? activeStyle : inactiveStyle)}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ),
                    )}

                    {/*  Next */}
                    <PaginationItem>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) handlePageChange(currentPage + 1);
                            }}
                            className={cn(itemBase, "border", currentPage >= totalPages ? disabledStyle : inactiveStyle)}
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
