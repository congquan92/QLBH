import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        qualities: [75, 95],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.pinimg.com",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "cdn.hstatic.net",
            },
            {
                protocol: "https",
                hostname: "ui-avatars.com",
            },
        ],
    },
};

export default nextConfig;
