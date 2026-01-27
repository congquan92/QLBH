import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Shop ARES CLUB - Trang mua sắm trực tuyến",
    description: "Cửa hàng trực tuyến ARES CLUB cung cấp đa dạng sản phẩm chất lượng cao với giá cả hợp lý. Mua sắm dễ dàng và nhanh chóng ngay hôm nay!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
