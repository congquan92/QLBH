"use client";

interface AdminPageShellProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

export function AdminPageShell({ title, description, children }: AdminPageShellProps) {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            {children}
        </div>
    );
}
