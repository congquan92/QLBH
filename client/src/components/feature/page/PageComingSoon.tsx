"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Snowfall from "react-snowfall";

export default function PageComingSoon() {
    return (
        <div className="relative flex flex-col md:flex-row items-center justify-center h-screen bg-[#050505] overflow-hidden text-white font-sans">
            {/* Hiệu ứng Tuyết rơi */}
            <Snowfall
                color="#ffffff"
                snowflakeCount={150}
                radius={[0.5, 2.0]}
                speed={[0.5, 1.5]}
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                }}
            />

            <div className="z-10 max-w-2xl text-center md:text-left px-6">
                {/* Chữ Neon */}
                <h1
                    className="text-5xl md:text-7xl font-black tracking-tighter italic leading-[1.1] animate-pulse"
                    style={{
                        color: "#fff",
                        textShadow: "0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px #0fa, 0 0 82px #0fa, 0 0 92px #0fa, 0 0 102px #0fa, 0 0 151px #0fa",
                    }}
                >
                    WE ARE <br />
                    <span style={{ textShadow: "0 0 7px #fff, 0 0 10px #fff, 0 0 42px #f0f, 0 0 82px #f0f" }}>&quot;COOKING&quot;</span>
                </h1>

                <p className="mt-2 text-white leading-[1.1] font-[550] text-3xl font-mono italic ">Trang bạn kiếm hiện đang được chúng mình xây xựng .</p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link href="/">
                        <Button className="relative cursor-pointer group overflow-hidden bg-transparent border-2 border-cyan-500 text-cyan-400 hover:text-black transition-all duration-300 px-8 py-6 rounded-none">
                            <span className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            <span className="relative z-10 flex items-center text-lg font-bold">
                                <ArrowLeft className="mr-2 size-6" /> QUAY LẠI
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Hình ảnh minh họa với Glow nền */}
            <div className="relative z-10 mt-16 md:mt-0 md:ml-10">
                <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full"></div>
                <Image src="/coming-soon.gif" alt="Coming Soon" className="relative object-contain drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]" width={800} height={800} priority />
            </div>
        </div>
    );
}
