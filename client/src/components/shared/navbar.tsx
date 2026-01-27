"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAVBAR_DATA } from "@/lib/data/navbar";

export default function Navbar() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
    const [cartCount] = useState(2);

    return (
        <nav className="bg-white border-b border-border sticky top-0 z-50">
            <div className="mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="text-2xl font-bold">
                                <span className="text-black">✓</span>
                                <span className="text-black">TORANO</span>
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1">
                            {NAVBAR_DATA.items.map((item) => (
                                <div key={item.label} className="relative" onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)} onMouseLeave={() => setOpenDropdown(null)}>
                                    <Link
                                        href={item.href}
                                        className={`px-3 py-2 text-sm font-medium transition-colors relative group inline-flex items-center gap-1.5 ${item.isWarning ? "text-red-600 hover:text-red-700" : "text-gray-700 hover:text-black"}`}
                                    >
                                        {item.label}
                                        {item.badge && (
                                            <Badge variant="destructive" className="h-4 px-1.5 text-[10px] font-semibold">
                                                {item.badge}
                                            </Badge>
                                        )}
                                        {item.hasDropdown && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />}
                                    </Link>

                                    {item.hasDropdown && openDropdown === item.label && item.dropdownItems && (
                                        <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-border shadow-lg rounded-md overflow-hidden">
                                            {item.dropdownItems.map((dropItem) => (
                                                <Link key={dropItem.label} href={dropItem.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                                                    {dropItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input type="text" placeholder="Tìm kiếm sản phẩm..." className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                        </div>
                        <button className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                            <Search className="size-5 text-gray-700" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                            <User className="size-5 text-gray-700" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer relative">
                            <ShoppingCart className="size-5 text-gray-700" />
                            {cartCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                    {cartCount}
                                </Badge>
                            )}
                        </button>

                        {/* Mobile Menu */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Menu className="w-6 h-6 text-gray-700" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left">
                                        <div className="text-2xl font-bold">
                                            <span className="text-black">✓</span>
                                            <span className="text-black">TORANO</span>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 flex flex-col space-y-3">
                                    {NAVBAR_DATA.items.map((item) => (
                                        <div key={item.label}>
                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={item.href}
                                                    className={`flex-1 py-2 px-3 text-base font-medium rounded-md transition-colors ${item.isWarning ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"}`}
                                                    onClick={() => !item.hasDropdown && setMobileOpen(false)}
                                                >
                                                    <span>{item.label}</span>
                                                    {item.badge && (
                                                        <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-[10px] font-semibold">
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                </Link>
                                                {item.hasDropdown && (
                                                    <button onClick={() => setMobileDropdown(mobileDropdown === item.label ? null : item.label)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                                                        <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${mobileDropdown === item.label ? "rotate-180" : ""}`} />
                                                    </button>
                                                )}
                                            </div>
                                            {item.hasDropdown && mobileDropdown === item.label && item.dropdownItems && (
                                                <div className="ml-4 mt-2 space-y-1">
                                                    {item.dropdownItems.map((dropItem) => (
                                                        <Link
                                                            key={dropItem.label}
                                                            href={dropItem.href}
                                                            className="block py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-black rounded-md transition-colors"
                                                            onClick={() => setMobileOpen(false)}
                                                        >
                                                            {dropItem.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
