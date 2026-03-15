import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { ChangePasswordPayload, UserAddress, UserProfile } from "@/types/user";

const WARNING_PREFIX = "[WARNING][UserApi]";

function normalizeAddress(address: UserAddress): UserAddress {
    const normalizedIsDefault = typeof address.isDefault === "boolean" ? address.isDefault : address.is_default === 1 || address.is_default === true;

    return {
        ...address,
        customerName: address.customerName ?? address.customer_name,
        phoneNumber: address.phoneNumber ?? address.phone_number,
        address: address.address ?? address.detail,
        province: address.province ?? address.provinceName,
        district: address.district ?? address.districtName,
        ward: address.ward ?? address.wardName,
        provinceId: address.provinceId ?? address.province_id,
        districtId: address.districtId ?? address.district_id,
        wardId: address.wardId ?? address.ward_id,
        addressType: address.addressType ?? address.address_type,
        isDefault: normalizedIsDefault,
        fullName: address.fullName ?? address.customer_name,
        phone: address.phone ?? address.phone_number,
        detail: address.detail ?? address.address,
    };
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

            return res.data as ApiResponse<UserProfile>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /user/me failed.`, error);
            throw error;
        }
    },

    getUsers: async (query?: { keyword?: string; sort?: string; page?: number; size?: number; hasUserRole?: boolean }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/user/list", { params: { ...query, page, size } });

            console.warn(`${WARNING_PREFIX} Invalid /user/list response shape.`);
            return res.data as ApiResponse<PageResponse<UserProfile>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /user/list failed.`, error);
            throw error;
        }
    },

    getUserDetail: async (userId: number): Promise<ApiResponse<UserProfile>> => {
        try {
            const res = await axiosInstance.get(`/user/${userId}`);
            return res.data as ApiResponse<UserProfile>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /user/{userId} failed.`, error);
            throw error;
        }
    },

    getMyAddresses: async (query?: { sort?: string; page?: number; size?: number }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/user/address/list", { params: { ...query, page, size } });
            const response = res.data as ApiResponse<PageResponse<UserAddress>>;
            const items = response.data?.data ?? [];

            return {
                ...response,
                data: {
                    ...response.data,
                    data: items.map(normalizeAddress),
                },
            } as ApiResponse<PageResponse<UserAddress>>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /user/address/list failed.`, error);
            throw error;
        }
    },

    addAddress: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/user/add/address", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/add/address failed.`, error);
            throw error;
        }
    },

    setDefaultAddress: async (addressId: number) => {
        try {
            const res = await axiosInstance.put(`/user/address/default/${addressId}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/address/default/{addressId} failed.`, error);
            throw error;
        }
    },

    updateAddress: async (addressId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/user/address/update/${addressId}`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/address/update/{addressId} failed.`, error);
            throw error;
        }
    },

    deleteAddress: async (addressId: number) => {
        try {
            const res = await axiosInstance.delete(`/user/address/delete/${addressId}`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/address/delete/{addressId} failed.`, error);
            throw error;
        }
    },

    updateProfile: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put("/user/update", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/update failed.`, error);
            throw error;
        }
    },

    updateUserById: async (userId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/user/${userId}/update`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/{userId}/update failed.`, error);
            throw error;
        }
    },

    changePassword: async (payload: ChangePasswordPayload) => {
        try {
            const res = await axiosInstance.put("/user/change-password", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/change-password failed.`, error);
            throw error;
        }
    },

    changeEmail: async (payload: { newEmail: string; otp: string }) => {
        try {
            const res = await axiosInstance.put("/user/change-email", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/change-email failed.`, error);
            throw error;
        }
    },

    changePhone: async (payload: { newPhone: string; otp: string }) => {
        try {
            const res = await axiosInstance.put("/user/change-phone", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/change-phone failed.`, error);
            throw error;
        }
    },

    forgotPassword: async (payload: { email: string; otp: string; newPassword: string; confirmPassword: string }) => {
        try {
            const res = await axiosInstance.post("/user/forgot-password", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/forgot-password failed.`, error);
            throw error;
        }
    },

    verifyAccount: async (userId: number, payload: { otp: string; email?: string }) => {
        try {
            const res = await axiosInstance.post(`/user/${userId}/verify-account`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/{userId}/verify-account failed.`, error);
            throw error;
        }
    },

    // Admin

    createUser: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/user/add", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/add failed.`, error);
            throw error;
        }
    },

    updateRoleUser: async (userId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/user/${userId}/update/role`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/{userId}/update/role failed.`, error);
            throw error;
        }
    },

    updateUserStatus: async (userId: number, payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put(`/user/${userId}/status`, payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /user/{userId}/status failed.`, error);
            throw error;
        }
    },

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
