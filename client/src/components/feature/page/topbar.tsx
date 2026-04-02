"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Topbar() {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible)
        return (
            <div className="bg-black">
                <div className="hidden md:block relative h-20 overflow-hidden">
                    <Image src="/topbar_img.jpg" alt="Sale banner" fill className="object-fill" priority />
                </div>
            </div>
        );
    return (
        <div className="bg-black">
            <div className="hidden md:block relative h-20 overflow-hidden">
                <Image src="/topbar_img.jpg" alt="Sale banner" fill className="object-fill" priority />
            </div>

            <div className="bg-black text-white text-sm p-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span>09:00-21:00. Tất cả các ngày trong tuần!</span>
                        <Link href="/gioi-thieu" className=" hover:text-yellow-300 hover:underline">
                            Tìm hiểu
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* <Link href="/huong-dan" className="hover:text-yellow-300 hover:underline">
                            <span>Hướng dẫn cách đổi</span>
                        </Link> */}
                        <Link href="/cloth-size" className="hover:text-yellow-300 hover:underline">
                            <span>Hướng dẫn chọn kích thước</span>
                        </Link>
                        <button onClick={() => setIsVisible(false)} className="p-0.5 hover:bg-white/20 rounded cursor-pointer" aria-label="Close banner">
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
