import { AuthApi } from "@/api/auth";
import { UserApi } from "@/api/user.api";
import { UserAuthUtil, type UserSession } from "@/lib/user-auth";
import { useEffect, useMemo } from "react";
import { create } from "zustand";

const USER_STORAGE_PREFIX = "qlbh_user";
const USER_LOGIN_PATH = "/dang-nhap";

export interface ClientAuthValue {
    session: UserSession | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

interface ClientAuthState {
    session: UserSession | null;
    isLoading: boolean;
    hasHydrated: boolean;
    hydrateSession: () => Promise<void>;
    ensureHydrated: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

let hydrateInFlight: Promise<void> | null = null;
let isHandlingClientAuthFailure = false;

function isBrowser() {
    return typeof window !== "undefined";
}

function clearStorageByPrefix(storage: Storage, prefix: string) {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }

    for (const key of keysToRemove) {
        storage.removeItem(key);
    }
}

async function clearBrowserCaches() {
    if (typeof caches === "undefined") return;

    try {
        const keys = await caches.keys();
        await Promise.allSettled(keys.map((key) => caches.delete(key)));
    } catch {
        // Best effort only.
    }
}

function buildProfilePatch(profile: unknown): Partial<UserSession> {
    const payload = (profile ?? {}) as { id?: unknown; email?: unknown; fullName?: unknown; phone?: unknown };

    return {
        userId: typeof payload.id === "number" ? payload.id : undefined,
        email: typeof payload.email === "string" ? payload.email : undefined,
        fullName: typeof payload.fullName === "string" ? payload.fullName : undefined,
        phone: typeof payload.phone === "string" ? payload.phone : undefined,
    };
}

const useClientAuthStore = create<ClientAuthState>((set, get) => ({
    session: null,
    isLoading: true,
    hasHydrated: false,

    hydrateSession: async () => {
        const localSession = UserAuthUtil.getSession();

        if (!localSession || !UserAuthUtil.isSessionValid(localSession)) {
            UserAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
            return;
        }

        set({ session: localSession, isLoading: true });

        try {
            const profileResponse = await UserApi.getMyInfo();
            const nextSession: UserSession = {
                ...localSession,
                ...buildProfilePatch(profileResponse?.data),
            };

            UserAuthUtil.persistSession(nextSession);
            set({ session: nextSession, isLoading: false, hasHydrated: true });
        } catch {
            UserAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
        }
    },

    ensureHydrated: async () => {
        if (get().hasHydrated) return;
        if (!hydrateInFlight) {
            hydrateInFlight = get()
                .hydrateSession()
                .finally(() => {
                    hydrateInFlight = null;
                });
        }

        await hydrateInFlight;
    },

    refreshProfile: async () => {
        const currentSession = get().session;
        if (!currentSession) return;

        const profileResponse = await UserApi.getMyInfo();
        const nextSession: UserSession = {
            ...currentSession,
            ...buildProfilePatch(profileResponse?.data),
        };

        UserAuthUtil.persistSession(nextSession);
        set({ session: nextSession });
    },

    login: async (username: string, password: string) => {
        const loginResponse = await AuthApi.login(username, password);
        const nextSession = UserAuthUtil.buildSession(loginResponse);

        if (!UserAuthUtil.isSessionValid(nextSession)) {
            UserAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
            throw new Error("Tai khoan khong hop le.");
        }

        UserAuthUtil.persistSession(nextSession);
        set({ session: nextSession, isLoading: false, hasHydrated: true });

        try {
            const profileResponse = await UserApi.getMyInfo();
            const enrichedSession: UserSession = {
                ...nextSession,
                ...buildProfilePatch(profileResponse?.data),
            };

            UserAuthUtil.persistSession(enrichedSession);
            set({ session: enrichedSession, isLoading: false, hasHydrated: true });
        } catch {
            // Token is already stored. Profile sync can retry later.
        }
    },

    logout: async () => {
        const token = get().session?.token;

        try {
            await AuthApi.logout(token);
        } finally {
            UserAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
        }
    },
}));

if (isBrowser()) {
    void useClientAuthStore.getState().ensureHydrated();
}

export function handleClientAuthFailure() {
    if (!isBrowser() || isHandlingClientAuthFailure) return;

    isHandlingClientAuthFailure = true;
    UserAuthUtil.clearSession();
    useClientAuthStore.setState({ session: null, isLoading: false, hasHydrated: true });
    clearStorageByPrefix(window.localStorage, USER_STORAGE_PREFIX);
    clearStorageByPrefix(window.sessionStorage, USER_STORAGE_PREFIX);

    void clearBrowserCaches().finally(() => {
        window.location.replace(USER_LOGIN_PATH);
    });
}

export function useClientAuth() {
    const session = useClientAuthStore((state) => state.session);
    const isLoading = useClientAuthStore((state) => state.isLoading);

    useEffect(() => {
        void useClientAuthStore.getState().ensureHydrated();
    }, []);

    return useMemo(
        () =>
            ({
                session,
                isLoading,
                isAuthenticated: UserAuthUtil.isSessionValid(session),
                login: useClientAuthStore.getState().login,
                logout: useClientAuthStore.getState().logout,
                refreshProfile: useClientAuthStore.getState().refreshProfile,
            }) satisfies ClientAuthValue,
        [isLoading, session],
    );
}

export const UserAuthStore = {
    useStore: useClientAuthStore,
    actions: {
        login: (username: string, password: string) => useClientAuthStore.getState().login(username, password),
        logout: () => useClientAuthStore.getState().logout(),
        refreshProfile: () => useClientAuthStore.getState().refreshProfile(),
        ensureHydrated: () => useClientAuthStore.getState().ensureHydrated(),
    },
};
