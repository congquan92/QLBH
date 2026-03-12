import { Helper } from "@/lib/helper";
import { Category, CategoryChild } from "@/types/navbar";

export type ResolvedCategoryPath = {
    parent: Category;
    child?: CategoryChild;
};

function isActive(status: string) {
    return status === "ACTIVE";
}

export function findRootCategoryBySlug(categories: Category[], slug: string) {
    return categories.find((category) => isActive(category.status) && Helper.generateSlug(category.name) === slug);
}

export function findChildCategoryBySlugs(categories: Category[], parentSlug: string, childSlug: string): ResolvedCategoryPath | null {
    const parent = findRootCategoryBySlug(categories, parentSlug);
    if (!parent) {
        return null;
    }

    const child = parent.childCategory.find((item) => isActive(item.status) && Helper.generateSlug(item.name) === childSlug);
    if (!child) {
        return null;
    }

    return { parent, child };
}

export function getCategoryHref(path: ResolvedCategoryPath) {
    const parentSlug = Helper.generateSlug(path.parent.name);
    if (!path.child) {
        return `/${parentSlug}`;
    }

    return `/${parentSlug}/${Helper.generateSlug(path.child.name)}`;
}

export function getCategoryDisplayName(path: ResolvedCategoryPath) {
    return path.child ? `${path.parent.name} / ${path.child.name}` : path.parent.name;
}
