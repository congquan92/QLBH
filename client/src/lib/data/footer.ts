import { Facebook, Instagram, Mail, Twitter, Youtube } from "lucide-react";
import {
    FooterContent,
    SocialLink,
    PaymentMethod,
    ShippingPartner,
} from "@/types/footer";

export const FOOTER_DATA: {
    content: FooterContent;
    social: SocialLink[];
    payments: PaymentMethod[];
    shipping: ShippingPartner[];
} = {
    content: {
        about: {
            title: "Thời trang nam TORANO",
            description:
                "Hệ thống thời trang cho phái mạnh hàng đầu Việt Nam, hướng tới sự phong cách, lịch lãm và trẻ trung.",
        },
        contact: {
            title: "Thông tin liên hệ",
            items: [
                {
                    label: "Địa chỉ",
                    value: "Tầng 16, Tòa nhà Rainbow Linh Đàm, Quận Hoàng Mai, Hà Nội",
                },
                { label: "Điện thoại", value: "0964247171" },
                { label: "Fax", value: "0904534739" },
                { label: "Email", value: "quan@torano.vn" },
            ],
        },
        quickLinks: {
            title: "Nhóm liên kết",
            items: [
                { label: "Tin tức", href: "/tin-tuc" },
                { label: "Giới thiệu", href: "/gioi-thieu" },
                { label: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
                { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
                { label: "Tuyển dụng", href: "/tuyen-dung" },
                { label: "Liên hệ", href: "/lien-he" },
            ],
        },
        newsletter: {
            title: "Đăng ký nhận tin",
            description:
                "Để cập nhật những sản phẩm mới, nhận thông tin ưu đãi đặc biệt và thông tin giảm giá khác.",
        },
    },
    social: [
        { name: "Facebook", icon: Facebook, href: "#" },
        { name: "Twitter", icon: Twitter, href: "#" },
        { name: "Instagram", icon: Instagram, href: "#" },
        { name: "Youtube", icon: Youtube, href: "#" },
        { name: "Mail", icon: Mail, href: "#" },
    ],
    payments: [
        { name: "VNPay" },
        { name: "Zalopay" },
        { name: "Moca" },
        { name: "VTC Pay" },
        { name: "JCB" },
        { name: "Visa" },
    ],
    shipping: [
        { name: "GHN" },
        { name: "Giao hàng nhanh" },
        { name: "Ahamove" },
        { name: "J&T Express" },
    ],
};
