"use client";

import { FileUploadApi } from "@/api/admin/file-upload.api";
import { ReviewApi } from "@/api/review.api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Helper } from "@/lib/helper";
import { OrderItem } from "@/types/order";
import { Loader2, Star, Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type SelectedMedia = {
  file: File;
  previewUrl: string;
  kind: "image" | "video";
};

interface ReviewCreateModalProps {
  open: boolean;
  orderItem: OrderItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewCreateModal({ open, orderItem, onClose, onSuccess }: ReviewCreateModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<SelectedMedia[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const productName = String(orderItem?.nameProductSnapshot ?? orderItem?.nameProductSnapShot ?? "Sản phẩm");
  const orderItemId = Number(orderItem?.orderItemId ?? orderItem?.id ?? 0);

  const canSubmit = orderItemId > 0 && rating >= 1 && rating <= 5 && !submitting;

  const selectedCountText = useMemo(() => {
    if (mediaFiles.length === 0) return "Chưa chọn tệp đính kèm";
    return `${mediaFiles.length} tệp đã chọn`;
  }, [mediaFiles.length]);

  function resetState() {
    for (const media of mediaFiles) {
      URL.revokeObjectURL(media.previewUrl);
    }
    setRating(5);
    setComment("");
    setMediaFiles([]);
  }

  function handleDialogChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState();
      onClose();
    }
  }

  function handleSelectFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const picked = Array.from(files);
    const mapped: SelectedMedia[] = [];

    for (const file of picked) {
      const mime = file.type.toLowerCase();
      const isImage = mime.startsWith("image/");
      const isVideo = mime.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error(`Tệp ${file.name} không phải ảnh hoặc video.`);
        continue;
      }

      mapped.push({
        file,
        previewUrl: URL.createObjectURL(file),
        kind: isVideo ? "video" : "image",
      });
    }

    setMediaFiles((current) => [...current, ...mapped].slice(0, 10));
  }

  function removeMedia(index: number) {
    setMediaFiles((current) => {
      const item = current[index];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];

      // Chi upload len server khi nguoi dung bam gui danh gia.
      for (const media of mediaFiles) {
        const uploaded = await FileUploadApi.upload(media.file);
        uploadedUrls.push(String(uploaded.url));
      }

      await ReviewApi.create({
        order_item_id: orderItemId,
        rating,
        comment: comment.trim(),
        image_url: uploadedUrls,
      });

      toast.success("Đánh giá đã được gửi. Cảm ơn bạn!");
      resetState();
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể gửi đánh giá.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-3xl border border-gray-200 p-0" showCloseButton={false}>
        <DialogHeader className="border-b border-gray-200 bg-linear-to-r from-rose-50 to-orange-50 px-6 py-5 text-left">
          <DialogTitle className="text-xl font-bold text-gray-900">Viết đánh giá sản phẩm</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Đánh giá cho <span className="font-semibold text-gray-900">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Chọn số sao</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="rounded-md p-1 transition hover:scale-105"
                    aria-label={`Chọn ${star} sao`}
                  >
                    <Star className={`h-7 w-7 ${active ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-300"}`} />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Bình luận</p>
            <textarea
              value={comment}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setComment(event.target.value)}
              placeholder="Trải nghiệm thực tế của bạn về sản phẩm này..."
              className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">{comment.length}/1000 ký tự</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-700">Ảnh / Video đính kèm</p>
              <span className="text-xs text-gray-500">{selectedCountText}</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => handleSelectFiles(event.target.files)}
            />

            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Chọn ảnh hoặc video
            </Button>

            {mediaFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {mediaFiles.map((media, index) => (
                  <div key={`${media.file.name}-${index}`} className="relative overflow-hidden border border-gray-200 bg-gray-50">
                    {media.kind === "image" ? (
                      <div className="relative aspect-square w-full">
                        <Image src={media.previewUrl} alt={media.file.name} fill className="object-cover" sizes="220px" />
                      </div>
                    ) : (
                      <video src={media.previewUrl} controls className="aspect-square w-full object-cover" />
                    )}

                    <button
                      type="button"
                      className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                      onClick={() => removeMedia(index)}
                      aria-label="Xóa tệp"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 px-6 py-4">
          <Button type="button" variant="outline" className="rounded-none" onClick={() => handleDialogChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button type="button" className="rounded-none bg-red-600 hover:bg-red-700" onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Gửi đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
