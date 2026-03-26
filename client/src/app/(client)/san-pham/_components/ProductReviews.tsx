"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, MessageSquare, UserCircle2, ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import { ReviewApi } from "@/api/review.api";
import type { Review } from "@/types/review";
import type { PageResponse } from "@/types/api";
import { Helper2 } from "@/lib/helper2";

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
function formatDate(dateStr?: string): string {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function getUserName(review: Review): string {
    const user = review.userResponse;
    if (!user) return "Khách hàng";
    return user.fullName || user.username || "Khách hàng";
}

function getUserAvatar(review: Review): string | null {
    return review.userResponse?.avatar ?? null;
}

// ────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-4 text-right text-gray-600 font-medium">{star}</span>
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-8 text-right text-gray-500 text-xs">{count}</span>
        </div>
    );
}

function ReviewCard({ review }: { review: Review }) {
    const avatar = getUserAvatar(review);
    const name = getUserName(review);

    return (
        <div className="border border-gray-200 bg-white p-4 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-3">
                {avatar ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200">
                        <Image src={avatar} alt={name} fill className="object-cover" sizes="36px" />
                    </div>
                ) : (
                    <UserCircle2 className="w-9 h-9 text-gray-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                    {Helper2.renderStars(review.rating)}
                </div>
            </div>

            {/* Variant tag */}
            {review.variant && (
                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded inline-block">
                    {typeof review.variant === "string"
                        ? review.variant
                        : Object.entries(review.variant as Record<string, string>)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                </p>
            )}

            {/* Comment */}
            {review.comment && (
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
            )}

            {/* Images */}
            {review.imageResponse && review.imageResponse.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {review.imageResponse.map((img) => (
                        <div key={img.id} className="relative w-16 h-16 border border-gray-200 overflow-hidden rounded">
                            <Image src={img.url} alt="review image" fill className="object-cover" sizes="64px" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewSkeleton() {
    return (
        <div className="border border-gray-200 bg-white p-4 space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-2 bg-gray-100 rounded w-1/5" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
    );
}

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────
interface ProductReviewsProps {
    productId: number;
    avgRating: number;
    soldQuantity: number;
}

export default function ProductReviews({ productId, avgRating, soldQuantity }: ProductReviewsProps) {
    const PAGE_SIZE = 5;

    const [page, setPage] = useState(1);
    const [allReviews, setAllReviews] = useState<Review[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async (p: number, append: boolean) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const res = await ReviewApi.getByProduct(productId, p, PAGE_SIZE);
            // Determine the actual PageResponse object.
            // Case 1: Server returns PageResponse directly → ReviewApi returns it as-is (has totalElements at top level)
            // Case 2: Wrapped in ApiResponse { status, message, data: PageResponse }
            let pageRes: any;
            if ((res as any)?.totalElements !== undefined) {
                pageRes = res;
            } else if ((res as any)?.data?.totalElements !== undefined) {
                pageRes = (res as any).data;
            } else {
                pageRes = (res as any)?.data ?? res;
            }
            const newReviews: Review[] = pageRes?.data ?? [];
            const total: number = pageRes?.totalElements ?? 0;
            const pages: number = pageRes?.totalPages ?? 1;

            if (append) {
                setAllReviews((prev) => [...prev, ...newReviews]);
            } else {
                setAllReviews(newReviews);
            }
            setTotalElements(total);
            setTotalPages(pages);
        } catch {
            setError("Không thể tải danh sách đánh giá. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [productId]);

    // Load first page on mount
    useEffect(() => {
        setPage(1);
        setAllReviews([]);
        fetchReviews(1, false);
    }, [fetchReviews]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage, true);
    };

    const hasMore = page < totalPages;

    // Compute rating distribution from all loaded reviews
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
        const star = Math.round(r.rating);
        if (star >= 1 && star <= 5) distribution[star]++;
    });

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Average Rating Card */}
                <div className="rounded border border-gray-200 bg-white p-4 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Điểm trung bình</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                        <div className="space-y-1">
                            {Helper2.renderStars(avgRating)}
                            <p className="text-xs text-gray-400">{totalElements > 0 ? `${totalElements} đánh giá` : "Chưa có đánh giá"}</p>
                        </div>
                    </div>
                    {/* Rating distribution */}
                    {allReviews.length > 0 && (
                        <div className="pt-2 space-y-1">
                            {[5, 4, 3, 2, 1].map((s) => (
                                <RatingBar key={s} star={s} count={distribution[s]} total={allReviews.length} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sold Quantity Card */}
                <div className="rounded border border-gray-200 bg-white p-4 flex flex-col justify-between">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Đã bán</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{soldQuantity.toLocaleString("vi-VN")}</p>
                    <p className="text-sm text-gray-500 mt-1">sản phẩm</p>
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Danh sách đánh giá
                    {totalElements > 0 && (
                        <span className="ml-1 text-xs font-normal text-gray-400">({totalElements})</span>
                    )}
                </h4>

                {/* Loading state (initial load) */}
                {loading && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)}
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="border border-red-200 bg-red-50 rounded p-4 text-sm text-red-600">{error}</div>
                )}

                {/* Empty state */}
                {!loading && !error && allReviews.length === 0 && (
                    <div className="border border-dashed border-gray-300 bg-gray-50 rounded p-8 text-center">
                        <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-500">Sản phẩm chưa có đánh giá nào.</p>
                        <p className="text-xs text-gray-400 mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                    </div>
                )}

                {/* Reviews */}
                {!loading && !error && allReviews.length > 0 && (
                    <div className="space-y-3">
                        {allReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                )}

                {/* Load More Button */}
                {!loading && !error && hasMore && (
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang tải...
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    Xem thêm đánh giá
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
