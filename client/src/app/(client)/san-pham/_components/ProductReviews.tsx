"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, MessageSquare, UserCircle2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { ReviewApi } from "@/api/review.api";
import type { Review } from "@/types/review";
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

function extractVariantSummary(variant: unknown): { color?: string; size?: string } {
    if (!variant) return {};

    const toObj = (value: unknown): Record<string, unknown> | null => {
        if (!value) return null;
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value) as unknown;
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    return parsed as Record<string, unknown>;
                }
            } catch {
                return null;
            }
            return null;
        }
        if (typeof value === "object" && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }
        return null;
    };

    const normalized = toObj(variant);
    if (!normalized) {
        return {};
    }

    const variantAttributes = Array.isArray(normalized.variantAttributes) ? (normalized.variantAttributes as Array<Record<string, unknown>>) : Array.isArray(variant) ? (variant as Array<Record<string, unknown>>) : [];

    let color = "";
    let size = "";

    for (const attribute of variantAttributes) {
        const name = String(attribute.attribute ?? attribute.name ?? "").toLowerCase();
        const value = String(attribute.value ?? "");
        if (!value) continue;

        if (!color && (name.includes("mau") || name.includes("màu") || name.includes("color"))) {
            color = value;
            continue;
        }

        if (!size && (name.includes("kich") || name.includes("kích") || name.includes("size"))) {
            size = value;
        }
    }

    return {
        color: color || undefined,
        size: size || undefined,
    };
}

function formatVariantSummary(variant: unknown): string {
    const info = extractVariantSummary(variant);
    const chunks: string[] = [];
    if (info.color) chunks.push(`Màu sắc: ${info.color}`);
    if (info.size) chunks.push(`Kích thước: ${info.size}`);
    return chunks.join(" · ");
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
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right text-gray-500 text-xs">{count}</span>
        </div>
    );
}

function ReviewCard({ review, highlighted = false }: { review: Review; highlighted?: boolean }) {
    const avatar = getUserAvatar(review);
    const name = getUserName(review);
    const variantSummary = formatVariantSummary(review.variant);

    return (
        <div className={`border p-4 space-y-2 ${highlighted ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200 bg-white"}`}>
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
                <div className="flex items-center gap-1">{Helper2.renderStars(review.rating)}</div>
            </div>

            {/* Variant tag */}
            {variantSummary && <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded inline-block">{variantSummary}</p>}

            {highlighted && <p className="text-xs text-emerald-700">Bạn đã mua sản phẩm này với biến thể: {variantSummary || "Không có biến thể"}</p>}

            {/* Comment */}
            {review.comment && <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>}

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
    const [reviews, setReviews] = useState<Review[]>([]);
    const [myReviews, setMyReviews] = useState<Review[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [starFilter, setStarFilter] = useState<number | "ALL">("ALL");

    const fetchReviews = useCallback(
        async (p: number) => {
            setLoading(true);
            setError(null);
            try {
                const [res, myRes] = await Promise.all([ReviewApi.getByProduct(productId, p, PAGE_SIZE), ReviewApi.getMyReviewByProduct(productId).catch(() => ({ data: [] }))]);

                interface PageLike {
                    data?: Review[];
                    totalElements?: number;
                    totalPages?: number;
                }
                const raw = res as unknown as PageLike & { data?: PageLike };
                const pageRes: PageLike = raw?.totalElements !== undefined ? raw : raw?.data?.totalElements !== undefined ? (raw.data as PageLike) : ((raw?.data ?? raw) as PageLike);

                const allFromPage: Review[] = pageRes?.data ?? [];
                const currentUserReviews = Array.isArray((myRes as { data?: Review[] })?.data) ? ((myRes as { data: Review[] }).data ?? []) : [];
                const myReviewIds = new Set(currentUserReviews.map((r) => r.id));
                const newReviews = allFromPage.filter((r) => !myReviewIds.has(r.id));
                const total: number = pageRes?.totalElements ?? 0;
                const pages: number = pageRes?.totalPages ?? 1;

                setReviews(newReviews);
                setMyReviews(currentUserReviews);
                setTotalElements(total);
                setTotalPages(pages);
            } catch {
                setError("Không thể tải danh sách đánh giá. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        },
        [productId],
    );

    // Load first page on mount
    useEffect(() => {
        setPage(1);
        setReviews([]);
        fetchReviews(1);
    }, [fetchReviews]);

    const goPrev = () => {
        if (page <= 1) return;
        const next = page - 1;
        setPage(next);
        fetchReviews(next);
    };

    const goNext = () => {
        if (page >= totalPages) return;
        const next = page + 1;
        setPage(next);
        fetchReviews(next);
    };

    const displayTotal = Math.max(totalElements, reviews.length + myReviews.length);
    const filteredMyReviews = myReviews.filter((r) => (starFilter === "ALL" ? true : Math.round(r.rating) === starFilter));
    const filteredReviews = reviews.filter((r) => (starFilter === "ALL" ? true : Math.round(r.rating) === starFilter));

    // Compute rating distribution from current page and my highlighted reviews
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    [...myReviews, ...reviews].forEach((r) => {
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
                            <p className="text-xs text-gray-400">{displayTotal > 0 ? `${displayTotal} đánh giá` : "Chưa có đánh giá"}</p>
                        </div>
                    </div>
                    {/* Rating distribution */}
                    {[...myReviews, ...reviews].length > 0 && (
                        <div className="pt-2 space-y-1">
                            {[5, 4, 3, 2, 1].map((s) => (
                                <RatingBar key={s} star={s} count={distribution[s]} total={[...myReviews, ...reviews].length} />
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
                    {displayTotal > 0 && <span className="ml-1 text-xs font-normal text-gray-400">({displayTotal})</span>}
                </h4>

                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setStarFilter("ALL")} className={`rounded-full border px-3 py-1.5 text-xs ${starFilter === "ALL" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300 text-gray-600"}`}>
                        Tất cả
                    </button>
                    {[5, 4, 3, 2, 1].map((star) => (
                        <button key={star} type="button" onClick={() => setStarFilter(star)} className={`rounded-full border px-3 py-1.5 text-xs ${starFilter === star ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300 text-gray-600"}`}>
                            {star} sao
                        </button>
                    ))}
                </div>

                {/* Loading state (initial load) */}
                {loading && (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <ReviewSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error state */}
                {!loading && error && <div className="border border-red-200 bg-red-50 rounded p-4 text-sm text-red-600">{error}</div>}

                {/* Empty state */}
                {!loading && !error && filteredMyReviews.length === 0 && filteredReviews.length === 0 && (
                    <div className="border border-dashed border-gray-300 bg-gray-50 rounded p-8 text-center">
                        <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-500">Không có đánh giá phù hợp với bộ lọc sao.</p>
                        <p className="text-xs text-gray-400 mt-1">Hãy thử đổi bộ lọc để xem thêm đánh giá khác.</p>
                    </div>
                )}

                {/* Reviews */}
                {!loading && !error && (filteredMyReviews.length > 0 || filteredReviews.length > 0) && (
                    <div className="space-y-3">
                        {filteredMyReviews.map((review) => (
                            <ReviewCard key={`mine-${review.id}`} review={review} highlighted />
                        ))}
                        {filteredReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 ? (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <button type="button" onClick={goPrev} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                            <ChevronLeft className="h-4 w-4" />
                            Trước
                        </button>
                        <span className="text-sm text-gray-600">
                            Trang {page}/{totalPages}
                        </span>
                        <button type="button" onClick={goNext} disabled={page >= totalPages} className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                            Sau
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
