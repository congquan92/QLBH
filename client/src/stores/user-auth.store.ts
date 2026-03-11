import { AuthApi } from "@/api/auth";
import { UserApi } from "@/api/user.api";
import { UserAuthUtil, type UserSession } from "@/lib/user-auth";
import { create } from "zustand";

interface UserAuthState {
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

function isUserRole(roleName?: string) {
    return String(roleName ?? "").toUpperCase() === "USER";
}

async function enrichUserSession(session: UserSession) {
    const [introspect, profile] = await Promise.allSettled([AuthApi.introspect(), UserApi.getMyInfo()]);

    return {
        ...session,
        userId: introspect.status === "fulfilled" ? introspect.value.id : session.userId,
        email: introspect.status === "fulfilled" ? introspect.value.email : profile.status === "fulfilled" ? profile.value.data?.email : session.email,
        roles: introspect.status === "fulfilled" ? introspect.value.roles : session.roles,
        fullName: profile.status === "fulfilled" ? String(profile.value.data?.fullName ?? session.fullName ?? "") || undefined : session.fullName,
        phone: profile.status === "fulfilled" ? String(profile.value.data?.phone ?? session.phone ?? "") || undefined : session.phone,
    };
}

const useUserAuthStore = create<UserAuthState>((set, get) => ({
    session: null,
    isLoading: true,
    hasHydrated: false,

    hydrateSession: async () => {
        const local = UserAuthUtil.getSession();

        if (!local || !UserAuthUtil.isSessionValid(local)) {
            UserAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
            return;
        }

        set({ session: local, isLoading: true });

        try {
            const next = await enrichUserSession(local);
            UserAuthUtil.persistSession(next);
            set({ session: next });
        } catch {
            UserAuthUtil.clearSession();
            set({ session: null });
        } finally {
            set({ isLoading: false, hasHydrated: true });
        }
    },

    ensureHydrated: async () => {
        if (get().hasHydrated) return;
        if (hydrateInFlight) {
            await hydrateInFlight;
            return;
        }

        hydrateInFlight = get()
            .hydrateSession()
            .finally(() => {
                hydrateInFlight = null;
            });

        await hydrateInFlight;
    },

    refreshProfile: async () => {
        const session = get().session;
        if (!session) return;

        const next = await enrichUserSession(session);
        UserAuthUtil.persistSession(next);
        set({ session: next });
    },

    login: async (username: string, password: string) => {
        const response = await AuthApi.login(username, password);
        const nextSession = UserAuthUtil.buildSession(response);

        if (!UserAuthUtil.isSessionValid(nextSession) || !isUserRole(nextSession.roleName)) {
            UserAuthUtil.clearSession();
            set({ session: null });
            throw new Error("Tài khoản này không thuộc khu vực khách hàng.");
        }

        UserAuthUtil.persistSession(nextSession);
        set({ session: nextSession, isLoading: false, hasHydrated: true });

        try {
            const enriched = await enrichUserSession(nextSession);
            UserAuthUtil.persistSession(enriched);
            set({ session: enriched });
        } catch {
            // Token is already stored; storefront can continue and refresh later.
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

export const UserAuthStore = {
    useStore: useUserAuthStore,
    getState: useUserAuthStore.getState,
    actions: {
        hydrateSession: () => useUserAuthStore.getState().hydrateSession(),
        ensureHydrated: () => useUserAuthStore.getState().ensureHydrated(),
        refreshProfile: () => useUserAuthStore.getState().refreshProfile(),
        login: (username: string, password: string) => useUserAuthStore.getState().login(username, password),
        logout: () => useUserAuthStore.getState().logout(),
    },
};

if (typeof window !== "undefined") {
    queueMicrotask(() => {
        void UserAuthStore.actions.ensureHydrated();
    });
}
