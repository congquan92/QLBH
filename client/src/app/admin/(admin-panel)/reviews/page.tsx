"use client";

import { ReviewApi } from "@/api/review.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import type { Review } from "@/types/review";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchReviews() {
            setIsLoading(true);
            const response = await ReviewApi.getAdminReviews({ page: 1, size: 30, sort: "id:desc" });
            if (!mounted) return;
            setReviews(response.data.data);
            setIsLoading(false);
        }

        void fetchReviews();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <AdminPageShell title="Đánh giá" description="Giám sát phản hồi khách hàng và xử lý nội dung vi phạm">
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đánh giá</CardTitle>
                    <CardDescription>{reviews.length} đánh giá gần nhất</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải đánh giá...
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <div key={review.id} className="rounded-md border p-3">
                                    <div className="flex items-center gap-2 font-medium">
                                        <MessageSquare className="h-4 w-4" />
                                        Review #{review.id} - Rating: {String(review.rating ?? "-")}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{String(review.comment ?? "Không có bình luận")}</p>
                                </div>
                            ))}
                            {reviews.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu đánh giá.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageShell>
    );
}
