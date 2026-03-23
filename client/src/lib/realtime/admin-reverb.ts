import Echo from "laravel-echo";
import Pusher from "pusher-js";

type EchoInstance = InstanceType<typeof Echo>;

let echoInstance: EchoInstance | null = null;

function isBrowser() {
    return typeof window !== "undefined";
}

function toNumber(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getAdminRealtimeClient(): EchoInstance | null {
    if (!isBrowser()) return null;
    if (echoInstance) return echoInstance;

    const key = String(process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "").trim();
    if (!key) {
        return null;
    }

    const wsHost = String(process.env.NEXT_PUBLIC_REVERB_HOST ?? window.location.hostname).trim();
    const wsPort = toNumber(process.env.NEXT_PUBLIC_REVERB_PORT, 8080);
    const wssPort = toNumber(process.env.NEXT_PUBLIC_REVERB_PORT, 443);
    const scheme = String(process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http").toLowerCase();
    const forceTLS = scheme === "https";

    (window as typeof window & { Pusher?: typeof Pusher }).Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster: "reverb",
        key,
        wsHost,
        wsPort,
        wssPort,
        forceTLS,
        enabledTransports: ["ws", "wss"],
    });

    return echoInstance;
}
