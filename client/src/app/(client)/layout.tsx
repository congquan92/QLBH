import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";
import Topbar from "@/components/feature/page/topbar";

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Topbar />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
