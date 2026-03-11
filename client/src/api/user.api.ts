import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { ChangePasswordPayload, UserAddress, UserProfile } from "@/types/user";

const WARNING_PREFIX = "[WARNING][UserApi]";

function createEmptyUserListResponse(page: number, size: number): ApiResponse<PageResponse<UserProfile>> {
    return {
        status: 200,
        message: "No user data",
        data: {
            data: [],
            pageNumber: page,
            pageSize: size,
            totalPages: 0,
            totalElements: 0,
        },
    };
}

function createEmptyAddressListResponse(page: number, size: number): ApiResponse<PageResponse<UserAddress>> {
    return {
        status: 200,
        message: "No address data",
        data: {
            data: [],
            pageNumber: page,
            pageSize: size,
            totalPages: 0,
            totalElements: 0,
        },
    };
}

function createEmptyUserDetailResponse(message: string): ApiResponse<UserProfile> {
    return {
        status: 404,
        message,
        data: null as unknown as UserProfile,
    };
}

function isPageUser(value: unknown): value is PageResponse<UserProfile> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<UserProfile>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function isPageAddress(value: unknown): value is PageResponse<UserAddress> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<UserAddress>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function isWrapped<T>(value: unknown): value is ApiResponse<T> {
    return !!value && typeof value === "object" && "data" in (value as Record<string, unknown>);
}

export const UserApi = {
    getUserByEmail: async (email: string) => {
        try {
            const res = await axiosInstance.get("/user/email", { params: { email } });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/email failed.`, error);
            return { status: 500, message: "Get user by email failed", data: null };
        }
    },

    getMyInfo: async (): Promise<ApiResponse<UserProfile>> => {
        try {
            const res = await axiosInstance.get("/user/me");
            if (isWrapped<UserProfile>(res.data) && res.data.data) {
                return res.data as ApiResponse<UserProfile>;
            }
            if (res.data && typeof res.data === "object" && "id" in (res.data as Record<string, unknown>)) {
                return { status: 200, message: "My info", data: res.data as UserProfile };
            }
            console.warn(`${WARNING_PREFIX} Invalid /user/me response shape.`);
            return createEmptyUserDetailResponse("My info not available");
        } catch (error) {
            console.error(`${WARNING_PREFIX} /user/me failed.`, error);
            return createEmptyUserDetailResponse("My info not available");
        }
    },

    // WARNING: Backend route maps `/user/list` to `UserController::list`,
    // while controller currently defines `findAll`. This mismatch may return server error.
    getUsers: async (query?: { keyword?: string; sort?: string; page?: number; size?: number; hasUserRole?: boolean }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/user/list", { params: { ...query, page, size } });
            if (isWrapped<PageResponse<UserProfile>>(res.data) && isPageUser((res.data as ApiResponse<PageResponse<UserProfile>>).data)) {
                return res.data as ApiResponse<PageResponse<UserProfile>>;
            }
            if (isPageUser(res.data)) {
                return { status: 200, message: "User list", data: res.data };
            }
            console.warn(`${WARNING_PREFIX} Invalid /user/list response shape.`);
            return createEmptyUserListResponse(page, size);
        } catch (error) {
            console.error(`${WARNING_PREFIX} /user/list failed.`, error);
            return createEmptyUserListResponse(page, size);
        }
    },

    getUserDetail: async (userId: number): Promise<ApiResponse<UserProfile>> => {
        try {
            const res = await axiosInstance.get(`/user/${userId}`);
            if (isWrapped<UserProfile>(res.data)) return res.data as ApiResponse<UserProfile>;
            if (res.data && typeof res.data === "object" && "id" in (res.data as Record<string, unknown>)) {
                return { status: 200, message: "User detail", data: res.data as UserProfile };
            }
            console.warn(`${WARNING_PREFIX} Invalid /user/{userId} response shape.`);
            return createEmptyUserDetailResponse("User detail not found");
        } catch (error) {
            console.error(`${WARNING_PREFIX} /user/{userId} failed.`, error);
            return createEmptyUserDetailResponse("User detail not found");
        }
    },

    getMyAddresses: async (query?: { sort?: string; page?: number; size?: number }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/user/address/list", { params: { ...query, page, size } });
            if (isWrapped<PageResponse<UserAddress>>(res.data) && isPageAddress((res.data as ApiResponse<PageResponse<UserAddress>>).data)) {
                return res.data as ApiResponse<PageResponse<UserAddress>>;
            }
            if (isPageAddress(res.data)) {
                return { status: 200, message: "Address list", data: res.data };
            }
            console.warn(`${WARNING_PREFIX} Invalid /user/address/list response shape.`);
            return createEmptyAddressListResponse(page, size);
        } catch (error) {
            console.error(`${WARNING_PREFIX} /user/address/list failed.`, error);
            return createEmptyAddressListResponse(page, size);
        }
    },

    addAddress: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/user/add/address", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/add/address failed.`, error);
            return { status: 500, message: "Add address failed", data: null };
        }
    },

    setDefaultAddress: async (addressId: number) => {
        try {
            const res = await axiosInstance.put(`/user/address/default/${addressId}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/address/default/{addressId} failed.`, error);
            return { status: 500, message: "Set default address failed", data: null };
        }
    },

    updateAddress: async (addressId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/user/address/update/${addressId}`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/address/update/{addressId} failed.`, error);
            return { status: 500, message: "Update address failed", data: null };
        }
    },

    deleteAddress: async (addressId: number) => {
        try {
            const res = await axiosInstance.delete(`/user/address/delete/${addressId}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/address/delete/{addressId} failed.`, error);
            return { status: 500, message: "Delete address failed", data: null };
        }
    },

    updateProfile: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put("/user/update", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/update failed.`, error);
            return { status: 500, message: "Update profile failed", data: null };
        }
    },

    changePassword: async (payload: ChangePasswordPayload) => {
        try {
            const res = await axiosInstance.put("/user/change-password", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/change-password failed.`, error);
            return { status: 500, message: "Change password failed", data: null };
        }
    },

    changeEmail: async (payload: { newEmail: string; otp: string }) => {
        try {
            const res = await axiosInstance.put("/user/change-email", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/change-email failed.`, error);
            return { status: 500, message: "Change email failed", data: null };
        }
    },

    changePhone: async (payload: { newPhone: string; otp: string }) => {
        try {
            const res = await axiosInstance.put("/user/change-phone", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/change-phone failed.`, error);
            return { status: 500, message: "Change phone failed", data: null };
        }
    },

    forgotPassword: async (payload: { email: string; otp: string; newPassword: string; confirmPassword: string }) => {
        try {
            const res = await axiosInstance.post("/user/forgot-password", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/forgot-password failed.`, error);
            return { status: 500, message: "Forgot password failed", data: null };
        }
    },

    verifyAccount: async (userId: number, payload: { otp: string; email?: string }) => {
        try {
            const res = await axiosInstance.post(`/user/${userId}/verify-account`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/{userId}/verify-account failed.`, error);
            return { status: 500, message: "Verify account failed", data: null };
        }
    },

    /** POST /user/add — Create new user (Admin) */
    createUser: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/user/add", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/add failed.`, error);
            throw error;
        }
    },

    /** PUT /user/{userId}/update/role — Update user role (Admin) */
    updateRoleUser: async (userId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/user/${userId}/update/role`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/{userId}/update/role failed.`, error);
            throw error;
        }
    },

    /** PUT /user/{userId}/status — Update user status (Admin) */
    updateUserStatus: async (userId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/user/${userId}/status`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/{userId}/status failed.`, error);
            throw error;
        }
    },

    /** GET /user/username — Find user by username (Admin) */
    findByUsername: async (username: string) => {
        try {
            const res = await axiosInstance.get("/user/username", { params: { username } });
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/username failed.`, error);
            throw error;
        }
    },
};
