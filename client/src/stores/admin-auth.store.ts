import { AuthApi } from "@/api/auth";
import { AdminAuthUtil, type AdminSession } from "@/lib/admin-auth";
import { create } from "zustand";

interface AdminAuthState {
    session: AdminSession | null;
    isLoading: boolean;
    hasHydrated: boolean;
    hydrateSession: () => Promise<void>;
    ensureHydrated: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

let hydrateInFlight: Promise<void> | null = null;

const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
    session: null,
    isLoading: true,
    hasHydrated: false,

    hydrateSession: async () => {
        const local = AdminAuthUtil.getSession();

        if (!local || !AdminAuthUtil.isSessionValid(local)) {
            AdminAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
            return;
        }

        set({ session: local, isLoading: true });

        try {
            const profile = await AuthApi.introspect();
            const next = {
                ...local,
                userId: profile.id,
                email: profile.email,
                roles: profile.roles,
            };

            AdminAuthUtil.persistSession(next);
            set({ session: next });
        } catch {
            AdminAuthUtil.clearSession();
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

        const profile = await AuthApi.introspect();
        const next = {
            ...session,
            userId: profile.id,
            email: profile.email,
            roles: profile.roles,
        };

        AdminAuthUtil.patchSession({
            userId: next.userId,
            email: next.email,
            roles: next.roles,
        });

        set({ session: next });
    },

    login: async (username: string, password: string) => {
        const response = await AuthApi.login(username, password);
        const nextSession = AdminAuthUtil.buildSession(response);

        if (!AdminAuthUtil.isSessionValid(nextSession)) {
            AdminAuthUtil.clearSession();
            set({ session: null });
            throw new Error("Tai khoan khong co quyen truy cap admin.");
        }

        AdminAuthUtil.persistSession(nextSession);
        set({ session: nextSession });

        try {
            const profile = await AuthApi.introspect();
            const enriched = {
                ...nextSession,
                userId: profile.id,
                email: profile.email,
                roles: profile.roles,
            };

            AdminAuthUtil.persistSession(enriched);
            set({ session: enriched });
        } catch {
            // Introspect can fail temporarily; token already exists.
        }
    },

    logout: async () => {
        const token = get().session?.token;

        try {
            await AuthApi.logout(token);
        } finally {
            AdminAuthUtil.clearSession();
            set({ session: null, isLoading: false, hasHydrated: true });
        }
    },
}));

export const AdminAuthStore = {
    useStore: useAdminAuthStore,
    getState: useAdminAuthStore.getState,
    actions: {
        hydrateSession: () => useAdminAuthStore.getState().hydrateSession(),
        ensureHydrated: () => useAdminAuthStore.getState().ensureHydrated(),
        refreshProfile: () => useAdminAuthStore.getState().refreshProfile(),
        login: (username: string, password: string) => useAdminAuthStore.getState().login(username, password),
        logout: () => useAdminAuthStore.getState().logout(),
    },
};
