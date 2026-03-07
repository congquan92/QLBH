"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
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
import { ChevronRight, LogOut, Settings, User2 } from "lucide-react";
import { adminDashboardItem, adminMenuSections, type AdminMenuItem } from "@/data/admin";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

function canRenderMenuItem(item: AdminMenuItem, canAccessPath: (path: string) => boolean, hasAnyPermission: (permissionList: string[]) => boolean) {
    const canByPath = canAccessPath(item.url);
    if (!canByPath) return false;

    if (!item.permissions || item.permissions.length === 0) return true;
    return hasAnyPermission(item.permissions);
}

export function AppSidebar() {
    const pathname = usePathname();
    const { session, canAccessPath, hasAnyPermission, logout } = useAdminAuth();

    const visibleDashboard = canRenderMenuItem(adminDashboardItem, canAccessPath, hasAnyPermission);
    const visibleSections = adminMenuSections
        .map((section) => ({
            ...section,
            groups: section.groups
                .map((group) => ({
                    ...group,
                    items: group.items.filter((item) => canRenderMenuItem(item, canAccessPath, hasAnyPermission)),
                }))
                .filter((group) => group.items.length > 0),
        }))
        .filter((section) => section.groups.length > 0);

    const profileName = session?.email ? session.email.split("@")[0] : "Admin";
    const profileEmail = session?.email ?? "Chưa có thông tin email";
    const profileRole = session?.roleName ?? "ADMIN";

    return (
        <Sidebar collapsible="icon" suppressHydrationWarning>
            <SidebarHeader className="border-b border-sidebar-border">
                <Link href="/admin/dashboard" className="flex items-center gap-1">
                    <Avatar className="size-16 rounded-none">
                        <AvatarImage src="/ARES_CLUB.png" alt="AresClub" className="object-contain" />
                        <AvatarFallback className="bg-transparent font-bold">ARES</AvatarFallback>
                    </Avatar>
                    <span className="text-lg font-semibold">Ares Club</span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {visibleDashboard && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip={adminDashboardItem.title} isActive={pathname === adminDashboardItem.url}>
                                        <Link href={adminDashboardItem.url}>
                                            <adminDashboardItem.icon />
                                            <span>{adminDashboardItem.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {visibleSections.map((section) => (
                    <SidebarGroup key={section.label}>
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.groups.map((group) => (
                                    <Collapsible className="group/collapsible" key={group.title} defaultOpen>
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={group.title}>
                                                    <group.icon />
                                                    <span className="cursor-pointer">{group.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {group.items.map((item) => (
                                                        <SidebarMenuSubItem key={item.url}>
                                                            <SidebarMenuSubButton asChild isActive={pathname === item.url}>
                                                                <Link href={item.url}>
                                                                    <item.icon className="h-4 w-4" />
                                                                    <span>{item.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
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
                                <DropdownMenuItem className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Cài đặt</span>
                                </DropdownMenuItem>
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
