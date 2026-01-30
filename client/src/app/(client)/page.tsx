import BannerCarousel, { Banner } from "@/components/feature/bannerCarousel";

export default function Home() {
    const datatest: Banner[] = [
        {
            id: "1",
            imageUrl: "https://i.pinimg.com/1200x/26/ba/59/26ba594f5be8d2f6eedcac9c9fca429e.jpg",
            name: "Banner",
        },
        {
            id: "2",
            imageUrl: "https://i.pinimg.com/736x/77/5d/e5/775de521373d82ab08b4d4b95259e389.jpg",
            name: "Banner",
        },
    ];

    return (
        <>
            <BannerCarousel autoplay banners={datatest} />
        </>
    );
}
