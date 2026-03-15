import { LucideIcon } from "lucide-react";

export type AccountSection = "profile" | "orders" | "addresses" | "security";

interface AccountSectionItem {
    id: AccountSection;
    label: string;
    icon: LucideIcon;
}

interface AccountSidebarProps {
    sections: AccountSectionItem[];
    activeSection: AccountSection;
    onSelect: (section: AccountSection) => void;
}

export function AccountSidebar({ sections, activeSection, onSelect }: AccountSidebarProps) {
    return (
        <aside className="h-fit border border-gray-200 bg-[#fafafa] p-4 lg:sticky lg:top-24">
            <div className="space-y-2">
                {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSelect(section.id)}
                            className={`flex w-full items-center gap-3 border px-4 py-3 text-left text-sm font-medium transition-colors ${isActive ? "border-red-600 bg-red-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900"}`}
                        >
                            <Icon className="h-4 w-4" />
                            {section.label}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
