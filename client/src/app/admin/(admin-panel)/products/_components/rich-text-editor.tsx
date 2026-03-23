"use client";

import { Button } from "@/components/ui/button";
import { AlignCenter, AlignLeft, AlignRight, Bold, ImagePlus, Italic, List, ListOrdered, Loader2, Underline } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
    value: string;
    placeholder?: string;
    onChange: (html: string) => void;
    onUploadImage: (file: File) => Promise<string>;
};

export function RichTextEditor({ value, placeholder, onChange, onUploadImage }: Props) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        if (!editorRef.current) return;
        if (editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    function emitChange() {
        const html = editorRef.current?.innerHTML ?? "";
        onChange(html);
    }

    function exec(command: string, valueArg?: string) {
        editorRef.current?.focus();
        document.execCommand(command, false, valueArg);
        emitChange();
    }

    function saveSelection() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }

    function restoreSelection() {
        const selection = window.getSelection();
        if (!selection || !savedRangeRef.current) return;
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
    }

    async function handleInsertImage(file?: File) {
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const imageUrl = await onUploadImage(file);
            editorRef.current?.focus();
            restoreSelection();
            document.execCommand("insertImage", false, imageUrl);
            emitChange();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload ảnh mô tả thất bại");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    const toolClass = "h-8 w-8";

    return (
        <div className="rounded-md border border-input">
            <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/30">
                <Button type="button" variant="outline" size="icon" className={toolClass} onClick={() => exec("bold")}>
                    <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="outline" size="icon" className={toolClass} onClick={() => exec("italic")}>
                    <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="outline" size="icon" className={toolClass} onClick={() => exec("underline")}>
                    <Underline className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="outline" size="icon" className={toolClass} onClick={() => exec("justifyLeft")}>
                    <AlignLeft className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="outline" size="icon" className={toolClass} onClick={() => exec("justifyCenter")}>
                    <AlignCenter className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="outline" size="icon" className={toolClass} onClick={() => exec("justifyRight")}>
                    <AlignRight className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="outline" size="icon" className={toolClass} onClick={() => exec("insertUnorderedList")}>
                    <List className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="outline" size="icon" className={toolClass} onClick={() => exec("insertOrderedList")}>
                    <ListOrdered className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-2"
                    onMouseDown={saveSelection}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                >
                    {isUploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                    <span className="ml-1 text-xs">Ảnh</span>
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleInsertImage(e.target.files?.[0])}
                />
            </div>

            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-36 p-3 text-sm outline-none [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-md"
                onInput={emitChange}
                onBlur={emitChange}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                data-placeholder={placeholder ?? "Nhập mô tả sản phẩm..."}
            />
        </div>
    );
}
