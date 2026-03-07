import { AdminAuthProvider } from "@/components/feature/admin-auth-provider";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAuthProvider>
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">{children}</div>
        </AdminAuthProvider>
    );
}
