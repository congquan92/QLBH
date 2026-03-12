"use client";

import { AdminRouteGate } from "@/components/feature/admin-route-gate";
import { MobileBlocker } from "@/components/feature/mobile-blocker";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRouteGate>
            <MobileBlocker>
                <SidebarProvider defaultOpen={true}>
                    <AppSidebar />
                    <SidebarInset>
                        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
                    </SidebarInset>
                </SidebarProvider>
            </MobileBlocker>
        </AdminRouteGate>
    );
}
