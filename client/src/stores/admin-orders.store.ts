import { OrderApi } from "@/api/order.api";
import type { OrderSummary } from "@/types/order";
import { create } from "zustand";

interface LoadOrdersOptions {
    canViewOrders: boolean;
    page?: number;
    size?: number;
    sort?: string;
}

interface AdminOrdersState {
    orders: OrderSummary[];
    isLoading: boolean;
    updatingOrderId: number | null;
    loadOrders: (options: LoadOrdersOptions) => Promise<void>;
    changeStatus: (orderId: number, status: string) => Promise<{ status: number; message?: string }>;
    completeOrder: (orderId: number) => Promise<{ status: number; message?: string }>;
    cancelOrder: (orderId: number) => Promise<{ status: number; message?: string }>;
}

const useAdminOrdersStore = create<AdminOrdersState>((set, get) => ({
    orders: [],
    isLoading: false,
    updatingOrderId: null,

    loadOrders: async ({ canViewOrders, page = 1, size = 100, sort = "id:desc" }) => {
        if (!canViewOrders) {
            set({ orders: [], isLoading: false });
            return;
        }

        set({ isLoading: true });
        try {
            const response = await OrderApi.getAdminOrders({ page, size, sort });
            set({ orders: response.data.data, isLoading: false });
        } catch {
            set({ orders: [], isLoading: false });
        }
    },

    changeStatus: async (orderId: number, status: string) => {
        set({ updatingOrderId: orderId });
        try {
            const response = await OrderApi.changeStatus(orderId, status);
            if (response?.status === 200) {
                await get().loadOrders({ canViewOrders: true });
            }
            return {
                status: Number(response?.status ?? 500),
                message: response?.message,
            };
        } finally {
            set({ updatingOrderId: null });
        }
    },

    completeOrder: async (orderId: number) => {
        set({ updatingOrderId: orderId });
        try {
            const response = await OrderApi.complete(orderId);
            if (response?.status === 200) {
                await get().loadOrders({ canViewOrders: true });
            }
            return {
                status: Number(response?.status ?? 500),
                message: response?.message,
            };
        } finally {
            set({ updatingOrderId: null });
        }
    },

    cancelOrder: async (orderId: number) => {
        set({ updatingOrderId: orderId });
        try {
            const response = await OrderApi.cancel(orderId);
            if (response?.status === 200) {
                await get().loadOrders({ canViewOrders: true });
            }
            return {
                status: Number(response?.status ?? 500),
                message: response?.message,
            };
        } finally {
            set({ updatingOrderId: null });
        }
    },
}));

export const AdminOrdersStore = {
    useStore: useAdminOrdersStore,
    getState: useAdminOrdersStore.getState,
    actions: {
        loadOrders: (options: LoadOrdersOptions) => useAdminOrdersStore.getState().loadOrders(options),
        changeStatus: (orderId: number, status: string) => useAdminOrdersStore.getState().changeStatus(orderId, status),
        completeOrder: (orderId: number) => useAdminOrdersStore.getState().completeOrder(orderId),
        cancelOrder: (orderId: number) => useAdminOrdersStore.getState().cancelOrder(orderId),
    },
};
