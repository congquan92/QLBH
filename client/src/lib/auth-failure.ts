import { AdminAuthUtil } from "@/lib/admin-auth";
import { UserAuthUtil } from "@/lib/user-auth";

const STORAGE_PREFIX = "qlbh_";
const USER_LOGIN_PATH = "/dang-nhap";
const ADMIN_LOGIN_PATH = "/admin/login";

let isHandlingAuthFailure = false;

function isBrowser() {
    return typeof window !== "undefined";
}

function clearStorageByPrefix(storage: Storage) {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }

    for (const key of keysToRemove) {
        storage.removeItem(key);
    }
}

async function clearBrowserCaches() {
    if (!isBrowser() || typeof caches === "undefined") return;

    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    } catch {
        // Ignore cache cleanup failures and continue logout.
    }
}

function resolveRedirectTarget() {
    if (!isBrowser()) return USER_LOGIN_PATH;

    const { pathname, search } = window.location;

    if (pathname.startsWith("/admin")) {
        return ADMIN_LOGIN_PATH;
    }

    if (pathname === USER_LOGIN_PATH) {
        return USER_LOGIN_PATH;
    }

    const redirectTarget = `${pathname}${search}`;
    return `${USER_LOGIN_PATH}?redirect=${encodeURIComponent(redirectTarget)}`;
}

export function handleAuthFailure() {
    if (!isBrowser() || isHandlingAuthFailure) return;

    isHandlingAuthFailure = true;

    AdminAuthUtil.clearSession();
    UserAuthUtil.clearSession();
    clearStorageByPrefix(window.localStorage);
    clearStorageByPrefix(window.sessionStorage);

    void clearBrowserCaches().finally(() => {
        window.location.replace(resolveRedirectTarget());
    });
}
