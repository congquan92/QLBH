"use client";

import React, { useEffect, useState } from "react";
import { PhoneCall, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const CONTACT_METHODS = [
    {
        id: "zalo",
        icon: <MessageCircle className="size-7" />,
        label: "Chat Zalo",
        href: "https://zalo.me/0xxxxxxxxx", // Thay số của Quân vào
        color: "bg-blue-500 hover:bg-blue-600",
    },
    {
        id: "phone",
        icon: <PhoneCall className="size-6" />,
        label: "Gọi điện",
        href: "tel:0xxxxxxxxx",
        color: "bg-green-500 hover:bg-green-600",
    },
];

export default function PhoneContact() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 200);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={cn("fixed left-6 bottom-10 z-50 flex flex-col gap-4 transition-all duration-500 ease-in-out", isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none")}>
            <TooltipProvider delayDuration={100}>
                {CONTACT_METHODS.map((method) => (
                    <Tooltip key={method.id}>
                        <TooltipTrigger asChild>
                            <a href={method.href} target="_blank" rel="noopener noreferrer" className="relative group">
                                {/* Hiệu ứng sóng (Ping) chỉ cho nút Gọi điện */}
                                {method.id === "phone" && <span className="absolute inset-0 rounded-full bg-green-500/40 animate-ping" />}

                                <Button size="icon" className={cn("size-15 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 active:scale-95", method.color, "text-white border-none")}>
                                    {method.icon}
                                </Button>
                            </a>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                            {method.label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    );
}
