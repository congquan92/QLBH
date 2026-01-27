"use client";

import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Snowfall from "react-snowfall";

export default function NotFound_404() {
    return (
        <div className="relative flex flex-col md:flex-row items-center justify-center h-screen bg-[#0a0a0a] overflow-hidden text-white">
            {/* Hiệu ứng Tuyết rơi */}
            <Snowfall
                color="#ffffff"
                snowflakeCount={250}
                radius={[0.5, 2.5]}
                speed={[0.5, 2.0]}
                wind={[-0.5, 1.5]}
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                }}
            />

            {/* Nội dung text */}
            <div className="z-10 max-w-md text-center md:text-left px-6">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">404 PAGE NOT FOUND</h1>
                <p className="mt-4 text-xl font-medium text-blue-200">Trang Bạn Tìm Có Vẻ Không Tồn Tại</p>
                <p className="mt-2 text-zinc-400">Có vẻ đường dẫn đã bị tuyết vùi lấp. Kiểm tra lại địa chỉ hoặc quay về trang chủ để sưởi ấm nhé.</p>
                <Link href="/">
                    <Button className="mt-8 bg-white text-black hover:bg-zinc-200 transition-transform active:scale-95 cursor-pointer">
                        <Home className="inline-flex mr-2 size-5" /> Về trang chủ
                    </Button>
                </Link>
            </div>

            <div className="mt-10 md:mt-0 md:ml-10">
                <Image src="/not-found.gif" alt="404" className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" width={800} height={800} />
            </div>
        </div>
    );
}
