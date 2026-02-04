"use client";

import Image from "next/image";

export default function ProductLoading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6">
                {/* GIF Animation - Giữ nguyên nếu gif mày đẹp, hoặc thay bằng Lottie */}
                <div className="relative w-60 h-60 grayscale">
                    <Image src="/product-loading.gif" alt="Loading..." fill className="object-contain opacity-80" priority />
                </div>

                {/* Text Loading - Style Modern & Minimal */}
                <div className="relative flex flex-col items-center">
                    <span className="text-sm font-black uppercase tracking-[0.3em] animate-pulse">Loading...</span>
                    {/* Thanh bar chạy dưới chữ cho nó cinematic */}
                    <div className="h-[2px] w-12 bg-black mt-2 overflow-hidden">
                        <div className="h-full bg-black/20 w-full animate-loading-bar"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes loading-bar {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite linear;
                    background: linear-gradient(90deg, transparent, #000, transparent);
                }
            `}</style>
        </div>
    );
}
