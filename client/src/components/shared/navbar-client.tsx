"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingCart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAuthUtil } from "@/lib/user-auth";

import { NavigationItem } from "@/types/navbar";
import { useRouter } from "next/navigation";
import { UserAuthStore } from "@/hooks/useClientAuth";

interface NavbarClientProps {
    navItems: NavigationItem[];
}

export default function NavbarClient({ navItems }: NavbarClientProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");
    const router = useRouter();
    const session = UserAuthStore.useStore((state) => state.session);
    const isLoading = UserAuthStore.useStore((state) => state.isLoading);

    const isAuthenticated = UserAuthUtil.isSessionValid(session);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = keyword.trim();
        router.push(query ? `/san-pham?keyword=${encodeURIComponent(query)}` : "/san-pham");
    };

    return (
        <nav className="bg-white border-b border-border sticky top-0 z-50">
            <div className="mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center justify-center gap-3">
                        <Link href="/">
                            <Avatar className="size-16 md:size-20 rounded-none">
                                <AvatarImage alt="ARES CLUB" src="/ARES_CLUB.png" className="object-contain" />
                                <AvatarFallback className="bg-transparent font-bold">ARES</AvatarFallback>
                            </Avatar>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
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
                                        <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-border shadow-lg rounded-none overflow-hidden p-2">
                                            {item.dropdownItems.map((dropItem) => (
                                                <Link key={dropItem.label} href={dropItem.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-black hover:underline transition-colors">
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
                        <form onSubmit={handleSearch} className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </form>
                        <button onClick={() => router.push(keyword.trim() ? `/san-pham?keyword=${encodeURIComponent(keyword.trim())}` : "/san-pham")} className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                            <Search className="size-5 text-gray-700" />
                        </button>
                        <Link href={isAuthenticated ? "/tai-khoan" : "/dang-nhap"} className="inline-flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                            <User className="size-5 text-gray-700" />
                            <span className="hidden xl:inline text-sm text-gray-700">{isLoading ? "Tài khoản" : isAuthenticated ? session?.fullName?.split(" ").slice(-1)[0] || "Tài khoản" : "Đăng nhập"}</span>
                        </Link>
                        <Link href="/gio-hang" className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer relative inline-flex">
                            <ShoppingCart className="size-5 text-gray-700" />
                        </Link>

                        {/* Mobile Menu */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Menu className="w-6 h-6 text-gray-700" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-75 sm:w-100">
                                <SheetHeader>
                                    <SheetTitle className="text-left">
                                        <div className="text-2xl font-bold">
                                            <span className="text-black">✓</span>
                                            <span className="text-black">ARES CLUB</span>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 flex flex-col space-y-3">
                                    <Link
                                        href={isAuthenticated ? "/tai-khoan" : "/dang-nhap"}
                                        className="rounded-md border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {isAuthenticated ? "Tài khoản của tôi" : "Đăng nhập khách hàng"}
                                    </Link>
                                    {navItems.map((item) => (
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
