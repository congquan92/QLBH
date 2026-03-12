import type { LoginResponse } from "@/types/auth";

export interface GoogleLoginPayload {
    idToken: string;
}

export type GoogleLoginResponse = LoginResponse;
