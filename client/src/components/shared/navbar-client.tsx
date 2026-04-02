"use client";

import { ProductApi } from "@/api/product.api";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAuthUtil } from "@/lib/UserAuth-util";
import { Helper } from "@/lib/helper";

import { NavigationItem } from "@/types/navbar";
import { useRouter } from "next/navigation";
import { UserAuthStore } from "@/hooks/useClientAuth";
import { toast } from "sonner";
import type { Product } from "@/types/product";

interface NavbarClientProps {
    navItems: NavigationItem[];
}

const MIN_SEARCH_KEYWORD_LENGTH = 2;
const SEARCH_SUGGEST_DEBOUNCE_MS = 350;
const SEARCH_SUGGEST_LIMIT = 6;

export default function NavbarClient({ navItems }: NavbarClientProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const desktopSearchRef = useRef<HTMLFormElement>(null);
    const activeSearchRequestId = useRef(0);
    const router = useRouter();
    const session = UserAuthStore.useStore((state) => state.session);
    const isLoading = UserAuthStore.useStore((state) => state.isLoading);

    const isAuthenticated = UserAuthUtil.isSessionValid(session);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (desktopSearchRef.current?.contains(target)) {
                return;
            }

            setShowSuggestions(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        const q = keyword.trim();

        if (q.length < MIN_SEARCH_KEYWORD_LENGTH) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }

        const timer = window.setTimeout(async () => {
            const requestId = activeSearchRequestId.current + 1;
            activeSearchRequestId.current = requestId;
            setIsSearching(true);

            try {
                const response = await ProductApi.getAllProducts({
                    page: 1,
                    size: SEARCH_SUGGEST_LIMIT,
                    keyword: q,
                });

                if (activeSearchRequestId.current !== requestId) {
                    return;
                }

                setSuggestions(response.data.data ?? []);
            } catch {
                if (activeSearchRequestId.current === requestId) {
                    setSuggestions([]);
                }
            } finally {
                if (activeSearchRequestId.current === requestId) {
                    setIsSearching(false);
                }
            }
        }, SEARCH_SUGGEST_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [keyword]);

    const buildProductSearchPath = (rawKeyword: string) => {
        const query = rawKeyword.trim();
        if (!query) {
            return "/san-pham#product-results";
        }

        if (query.length < MIN_SEARCH_KEYWORD_LENGTH) {
            toast.info(`Nhập ít nhất ${MIN_SEARCH_KEYWORD_LENGTH} ký tự để tìm sản phẩm.`);
            return null;
        }

        return `/san-pham?keyword=${encodeURIComponent(query)}#product-results`;
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const path = buildProductSearchPath(keyword);
        if (!path) return;
        setShowSuggestions(false);
        router.push(path);
    };

    const handleMobileSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const path = buildProductSearchPath(keyword);
        if (!path) return;
        setMobileSearchOpen(false);
        setShowSuggestions(false);
        router.push(path);
    };

    const handleSuggestionClick = (product: Product) => {
        setShowSuggestions(false);
        setKeyword(product.name);
        router.push(`/san-pham/${product.id}/${encodeURIComponent(product.name)}`);
    };

    const openMobileSearch = () => {
        setMobileSearchOpen(true);
        // focus vào input sau khi render
        setTimeout(() => mobileInputRef.current?.focus(), 50);
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
                        {/* Desktop search */}
                        <form ref={desktopSearchRef} onSubmit={handleSearch} className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                value={keyword}
                                onChange={(event) => {
                                    setKeyword(event.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-56 border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 lg:w-64 xl:w-72"
                            />

                            {showSuggestions && (
                                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 border border-gray-200 bg-white shadow-lg">
                                    {keyword.trim().length < MIN_SEARCH_KEYWORD_LENGTH ? (
                                        <div className="px-3 py-2 text-xs text-gray-500">Nhập ít nhất {MIN_SEARCH_KEYWORD_LENGTH} ký tự để tìm sản phẩm.</div>
                                    ) : isSearching ? (
                                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                                            <Loader2 className="size-4 animate-spin" />
                                            Đang tìm sản phẩm...
                                        </div>
                                    ) : suggestions.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-gray-600">Không có sản phẩm phù hợp.</div>
                                    ) : (
                                        <div className="max-h-96 overflow-y-auto">
                                            {suggestions.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(product)}
                                                    className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2 text-left transition hover:bg-gray-50 last:border-b-0"
                                                >
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden border border-gray-200 bg-gray-100">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={product.urlImageCover} alt={product.name} className="h-full w-full object-cover" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="line-clamp-1 text-sm font-medium text-gray-900">{product.name}</p>
                                                        <p className="mt-0.5 text-sm font-semibold text-red-600">{Helper.formatCurrency(product.salePrice)}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>

                        {/* Mobile search icon */}
                        <button onClick={openMobileSearch} className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" aria-label="Mở tìm kiếm">
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

            {/* Mobile search bar */}
            {mobileSearchOpen && (
                <div className="animate-in slide-in-from-top-2 border-t border-gray-200 bg-white px-4 py-3 duration-200 md:hidden">
                    <form onSubmit={handleMobileSearch} className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                ref={mobileInputRef}
                                value={keyword}
                                onChange={(e) => {
                                    setKeyword(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            </div>
                            <button type="submit" className="bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700">
                                Tìm
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileSearchOpen(false);
                                    setShowSuggestions(false);
                                    setKeyword("");
                                }}
                                className="rounded-full p-2 transition-colors hover:bg-gray-100"
                                aria-label="Đóng tìm kiếm"
                            >
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        {showSuggestions && (
                            <div className="max-h-80 overflow-y-auto border border-gray-200 bg-white shadow-sm">
                                {keyword.trim().length < MIN_SEARCH_KEYWORD_LENGTH ? (
                                    <div className="px-3 py-2 text-xs text-gray-500">Nhập ít nhất {MIN_SEARCH_KEYWORD_LENGTH} ký tự để tìm sản phẩm.</div>
                                ) : isSearching ? (
                                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                                        <Loader2 className="size-4 animate-spin" />
                                        Đang tìm sản phẩm...
                                    </div>
                                ) : suggestions.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-gray-600">Không có sản phẩm phù hợp.</div>
                                ) : (
                                    <div>
                                        {suggestions.map((product) => (
                                            <button
                                                key={`mobile-${product.id}`}
                                                type="button"
                                                onClick={() => {
                                                    handleSuggestionClick(product);
                                                    setMobileSearchOpen(false);
                                                }}
                                                className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2 text-left transition hover:bg-gray-50 last:border-b-0"
                                            >
                                                <div className="h-12 w-12 shrink-0 overflow-hidden border border-gray-200 bg-gray-100">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={product.urlImageCover} alt={product.name} className="h-full w-full object-cover" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-1 text-sm font-medium text-gray-900">{product.name}</p>
                                                    <p className="mt-0.5 text-sm font-semibold text-red-600">{Helper.formatCurrency(product.salePrice)}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            )}
        </nav>
    );
}
