import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const Utils = {
    cn: (...inputs: ClassValue[]) => twMerge(clsx(inputs)),
};

// Keep old named function for existing imports.
export const cn = (...inputs: ClassValue[]) => Utils.cn(...inputs);
