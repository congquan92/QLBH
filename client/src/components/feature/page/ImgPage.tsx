import Image from "next/image";

export default function ImgPage({ url }: { url: string }) {
    return (
        <div className="mt-3">
            <div className="w-full max-w-[1600px] mx-auto mb-3">
                <div className="relative w-full aspect-[16/5] md:aspect-[16/4]">
                    <Image
                        src={url}
                        alt="Banner Effect"
                        fill // Tự động lấp đầy div cha
                        priority // Ưu tiên load trước (vì là banner đầu trang)
                        className="object-cover" // Giữ tỉ lệ ảnh không bị méo
                        sizes="(max-width: 1600px) 100vw, 1600px"
                    />
                </div>
            </div>
        </div>
    );
}
