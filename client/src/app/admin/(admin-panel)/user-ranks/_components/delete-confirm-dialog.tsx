"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rankName?: string;
    onConfirm: () => void;
    isLoading: boolean;
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    rankName,
    onConfirm,
    isLoading,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Xác nhận vô hiệu hóa</DialogTitle>
                            <DialogDescription className="mt-0.5">
                                Bạn có chắc muốn vô hiệu hóa hạng{" "}
                                <span className="font-semibold text-foreground">
                                    &quot;{rankName}&quot;
                                </span>
                                ? Hành động này sẽ đánh dấu hạng là DISABLED.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Vô hiệu hóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
