import { Helper } from "@/lib/helper";
import { Category, CategoryChild } from "@/types/navbar";

export type ResolvedCategoryPath = {
    parent: Category;
    child?: CategoryChild;
};

export function findRootCategoryBySlug(categories: Category[], slug: string) {
    return categories.find((category) => category.status === "ACTIVE" && Helper.generateSlug(category.name) === slug);
}

export function findChildCategoryBySlugs(categories: Category[], parentSlug: string, childSlug: string): ResolvedCategoryPath | null {
    const parent = findRootCategoryBySlug(categories, parentSlug);
    if (!parent) {
        return null;
    }

    const child = parent.childCategory.find((item) => item.status === "ACTIVE" && Helper.generateSlug(item.name) === childSlug);
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
