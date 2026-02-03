import { NavbarApi } from "@/api/navbar";
import { Category, NavigationItem } from "@/types/navbar";
import { Helper } from "@/lib/helper";
import NavbarClient from "./navbar-client";

// Transform API categories to NavigationItem format
function transformCategoriesToNavItems(categories: Category[]): NavigationItem[] {
    return categories
        .filter((cat) => cat.status === "ACTIVE")
        .map((category) => {
            const slug = Helper.generateSlug(category.name);
            const hasChildren = category.childCategory && category.childCategory.length > 0;

            return {
                label: category.name,
                href: `/${slug}`,
                hasDropdown: hasChildren,
                dropdownItems: hasChildren
                    ? category.childCategory
                          .filter((child) => child.status === "ACTIVE")
                          .map((child) => ({
                              label: child.name,
                              href: `/${slug}/${Helper.generateSlug(child.name)}`,
                          }))
                    : undefined,
            };
        });
}

async function getCategoryAll() {
    try {
        const response = await NavbarApi.getCategoryAll();
        const categories = response.data?.data?.data || [];
        const apiNavItems = transformCategoriesToNavItems(categories);
        return apiNavItems;
    } catch (err) {
        console.error(err);
    }
}

export default async function Navbar() {
    const data: NavigationItem[] | undefined = await getCategoryAll();

    const navT: NavigationItem[] = [
        { label: "Sản phẩm", href: "/san-pham" },
        ...(data ?? []),
        { label: "Hệ thống cửa hàng", href: "/he-thong-cua-hang" },
        {
            label: "CẢNH BÁO LỪA ĐẢO",
            href: "/canh-bao",
            badge: "Hot",
            isWarning: true,
        },
    ];

    return <NavbarClient navItems={navT} />;
}
