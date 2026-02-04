"use client";

import Image from "next/image";

export default function ProductProMax() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white overflow-hidden relative">
            <div className="flex flex-col items-center gap-8 z-10">
                <div className="relative w-64 h-64 md:w-80 md:h-80 drop-shadow-[0_10px_20px_rgba(239,68,68,0.2)]">
                    <Image src="/loading.gif" alt="Samurai Loading" fill className="object-contain animate-glitch-subtle" priority />
                </div>

                {/* Text & Loading Bar - Style Cyberpunk trên nền sáng */}
                <div className="relative flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-red-600 font-mono text-xl font-black tracking-[0.4em] uppercase">Loading</span>
                        <span className="w-2 h-6 bg-red-600 animate-blink"></span>
                    </div>

                    {/* Thanh progress bar chia ô (Segmented) giống trong ảnh */}
                    <div className="flex gap-1 border-2 border-black p-1 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-4 h-6 bg-black opacity-10 animate-cyber-steps" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>

                    <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-tighter">Secure connection established // Protocol 77</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes cyber-steps {
                    0%,
                    20% {
                        opacity: 0.1;
                        background-color: #000;
                    }
                    40%,
                    60% {
                        opacity: 1;
                        background-color: #ef4444;
                    } /* Chuyển đỏ khi chạy qua */
                    80%,
                    100% {
                        opacity: 0.1;
                        background-color: #000;
                    }
                }
                .animate-cyber-steps {
                    animation: cyber-steps 2s infinite;
                }
                @keyframes blink {
                    0%,
                    100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0;
                    }
                }
                .animate-blink {
                    animation: blink 0.8s infinite;
                }
                @keyframes glitch-subtle {
                    0% {
                        transform: translate(0);
                    }
                    5% {
                        transform: translate(-1px, 1px);
                    }
                    10% {
                        transform: translate(1px, -1px);
                    }
                    15% {
                        transform: translate(0);
                    }
                }
                .animate-glitch-subtle {
                    animation: glitch-subtle 4s infinite;
                }
            `}</style>
        </div>
    );
}
