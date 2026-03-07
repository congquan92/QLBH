import axios from "axios";

export const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
export const API_TOKEN = process.env.API_TOKEN || "";

export const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
});

export function authHeader(token = API_TOKEN) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function printSection(title) {
    console.log("\n==============================");
    console.log(title);
    console.log("==============================");
}

export function printResult(name, response) {
    const payload = response?.data;
    const snippet = JSON.stringify(payload, null, 2)?.slice(0, 1200) ?? "<empty>";
    console.log(`\n[${name}] status=${response?.status ?? "N/A"}`);
    console.log(snippet);
}

export function printError(name, error) {
    const status = error?.response?.status;
    const payload = error?.response?.data;
    console.error(`\n[${name}] ERROR status=${status ?? "N/A"}`);
    console.error(JSON.stringify(payload ?? error?.message ?? "Unknown error", null, 2));
}

export async function runRequest(name, requestFn) {
    try {
        const res = await requestFn();
        printResult(name, res);
        return res;
    } catch (error) {
        printError(name, error);
        return null;
    }
}
