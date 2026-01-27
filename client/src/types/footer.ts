import { LucideIcon } from "lucide-react";

export interface FooterLink {
    label: string;
    href: string;
}

export interface ContactItem {
    label: string;
    value: string;
}

export interface SocialLink {
    name: string;
    icon: LucideIcon;
    href: string;
}

export interface PaymentMethod {
    name: string;
    icon?: string;
}

export interface ShippingPartner {
    name: string;
    icon?: string;
}

export interface FooterContent {
    about: {
        title: string;
        description: string;
    };
    contact: {
        title: string;
        items: ContactItem[];
    };
    quickLinks: {
        title: string;
        items: FooterLink[];
    };
    newsletter: {
        title: string;
        description: string;
    };
}
