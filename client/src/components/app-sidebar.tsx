"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { AdminAuthUtil } from "@/lib/admin-auth";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    BadgeDollarSign,
    Briefcase,
    CalendarDays,
    ChevronRight,
    Clock3,
    FileText,
    Folder,
    ImageIcon,
    KeyRound,
    LayoutDashboard,
    LogOut,
    LucideIcon,
    MapPin,
    Package,
    ShieldCheck,
    ShoppingCart,
    Star,
    Tags,
    Truck,
    User2,
    UserCog,
    Users,
    Wallet,
    Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

type SidebarApiItem = {
    title: string;
    url: string;
    permissions: string[];
    icon: LucideIcon;
};

type SidebarApiSection = {
    title: string;
    icon: LucideIcon;
    items: SidebarApiItem[];
};

function normalizeIconKey(value?: string) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");
}

function resolveMenuIcon(iconRaw?: string, title?: string, url?: string): LucideIcon {
    const tokens = [normalizeIconKey(iconRaw), normalizeIconKey(title), normalizeIconKey(url)].filter(Boolean);

    const iconChecks: Array<{ matcher: RegExp; icon: LucideIcon }> = [
        { matcher: /(dashboard|home|tong-quan)/, icon: LayoutDashboard },
        { matcher: /(user|users|customer|employee|nhan-vien|khach-hang)/, icon: Users },
        { matcher: /(role|permission|rbac|group|phan-quyen)/, icon: ShieldCheck },
        { matcher: /(address|dia-chi)/, icon: MapPin },
        { matcher: /(product|san-pham)/, icon: Package },
        { matcher: /(category|danh-muc|tag)/, icon: Tags },
        { matcher: /(order|don-hang|cart|gio-hang)/, icon: ShoppingCart },
        { matcher: /(supplier|nha-cung-cap|import|nhap)/, icon: Truck },
        { matcher: /(shift|ca-lam|schedule|lich)/, icon: CalendarDays },
        { matcher: /(attendance|cham-cong|time|clock)/, icon: Clock3 },
        { matcher: /(salary|luong|payment|thanh-toan)/, icon: Wallet },
        { matcher: /(rank|voucher|promotion|khuyen-mai)/, icon: Star },
        { matcher: /(review|danh-gia|post|bai-viet|content)/, icon: FileText },
        { matcher: /(image|media|photo|hinh-anh|upload)/, icon: ImageIcon },
        { matcher: /(position|job|nghe-nghiep|career)/, icon: Briefcase },
        { matcher: /(setting|config|cai-dat)/, icon: Settings },
        { matcher: /(otp|security|auth|bao-mat)/, icon: KeyRound },
        { matcher: /(stat|report|thong-ke|revenue)/, icon: BadgeDollarSign },
        { matcher: /(profile|account|tai-khoan)/, icon: UserCog },
    ];

    for (const token of tokens) {
        const matched = iconChecks.find((entry) => entry.matcher.test(token));
        if (matched) return matched.icon;
    }

    return Folder;
}

function normalizeAdminUrl(raw?: string) {
    const value = String(raw ?? "").trim();
    if (!value) return "";
    if (value.startsWith("/admin")) return value;
    if (value.startsWith("/")) return `/admin${value}`;
    return `/admin/${value}`;
}

function canRenderApiItem(item: SidebarApiItem, canAccessPath: (path: string) => boolean, hasAnyPermission: (permissionList: string[]) => boolean) {
    if (!item.url) return false;
    if (!canAccessPath(item.url)) return false;
    if (item.permissions.length === 0) return true;
    return hasAnyPermission(item.permissions);
}

export function AppSidebar() {
    const pathname = usePathname();
    const { session, canAccessPath, hasAnyPermission, logout } = useAdminAuth();
    const defaultAdminPath = AdminAuthUtil.resolveDefaultAdminPath(session);

    const sections: SidebarApiSection[] = (session?.role?.page ?? [])
        .map((page) => {
            const items: SidebarApiItem[] = (page.items ?? [])
                .map((item) => {
                    const permissions = (item.permissions ?? [])
                        .map((permission) =>
                            String(permission?.name ?? "")
                                .trim()
                                .toUpperCase(),
                        )
                        .filter((permission) => permission.length > 0);

                    return {
                        title: String(item.name ?? item.url ?? "Untitled"),
                        url: normalizeAdminUrl(item.url),
                        permissions,
                        icon: resolveMenuIcon(item.icon, item.name, item.url),
                    };
                })
                .filter((item) => canRenderApiItem(item, canAccessPath, hasAnyPermission));

            return {
                title: String(page.title ?? "Menu"),
                icon: resolveMenuIcon(page.icon, page.title),
                items,
            };
        })
        .filter((section) => section.items.length > 0);

    const fallbackItems: SidebarApiItem[] = (session?.allowedUrls ?? [])
        .map((url) => normalizeAdminUrl(url))
        .filter((url) => url.startsWith("/admin"))
        .map((url) => ({
            title: url.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? url,
            url,
            permissions: [],
            icon: resolveMenuIcon(undefined, undefined, url),
        }))
        .filter((item, index, arr) => arr.findIndex((candidate) => candidate.url === item.url) === index)
        .filter((item) => canRenderApiItem(item, canAccessPath, hasAnyPermission));

    const visibleSections = sections.length > 0 ? sections : fallbackItems.length > 0 ? [{ title: "Menu", icon: Folder, items: fallbackItems }] : [];

    const profileName = session?.email ? session.email.split("@")[0] : "Admin";
    const profileEmail = session?.email ?? "Chưa có thông tin email";
    const profileRole = session?.roleName ?? "UNKNOWN_ROLE";

    return (
        <Sidebar collapsible="icon" suppressHydrationWarning>
            <SidebarHeader className="border-b border-sidebar-border">
                <Link href={defaultAdminPath} className="flex items-center gap-1">
                    <Avatar className="size-16 rounded-none">
                        <AvatarImage src="/ARES_CLUB.png" alt="AresClub" className="object-contain" />
                        <AvatarFallback className="bg-transparent font-bold">ARES</AvatarFallback>
                    </Avatar>
                    <span className="text-lg font-semibold">Ares Club</span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {visibleSections.map((section) => (
                    <SidebarGroup key={section.title}>
                        <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <Collapsible className="group/collapsible" key={section.title} defaultOpen>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={section.title}>
                                                <section.icon />
                                                <span className="cursor-pointer">{section.title}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {section.items.map((item) => {
                                                    const active = pathname === item.url || pathname.startsWith(`${item.url}/`);
                                                    return (
                                                        <SidebarMenuSubItem key={item.url}>
                                                            <SidebarMenuSubButton asChild isActive={active}>
                                                                <Link href={item.url}>
                                                                    <item.icon className="h-4 w-4" />
                                                                    <span>{item.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                {visibleSections.length === 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Menu</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <Folder />
                                        <span>Không có mục truy cập</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer">
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarImage src="/avatars/admin.png" alt="Admin" />
                                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">AD</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{profileName}</span>
                                        <span className="truncate text-xs text-muted-foreground">{profileEmail}</span>
                                        <span className="truncate text-[11px] text-primary/80">{profileRole}</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <User2 className="mr-2 h-4 w-4" />
                                    <span>Thông tin cá nhân</span>
                                </DropdownMenuItem>
                                {/* {canAccessPath("/admin/settings") && (
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/admin/settings">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Cài đặt</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )} */}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={async () => {
                                        await logout();
                                        toast.success("Đăng xuất thành công.");
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
