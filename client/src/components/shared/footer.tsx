import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FOOTER_DATA } from "@/data/footer";

export default function Footer() {
    const { content, social, payments, shipping } = FOOTER_DATA;

    return (
        <footer className="bg-gray-50 border-t border-border mt-auto">
            <div className="mx-auto px-4 lg:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-red-600 uppercase">{content.about.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{content.about.description}</p>

                        <div className="flex items-center gap-2 pt-2">
                            {social.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.name} href={item.href} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 hover:border-red-500 transition-colors" aria-label={item.name}>
                                        <Icon className="w-4 h-4 text-gray-600" />
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="space-y-3 pt-4">
                            <h4 className="text-sm font-semibold text-gray-800">Phương thức thanh toán</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                {payments.map((method) => (
                                    <div key={method.name} className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                                        <span className="text-xs text-gray-600 font-medium">{method.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-800">{content.contact.title}</h3>
                        <div className="space-y-3">
                            {content.contact.items.map((item) => (
                                <div key={item.label} className="text-sm">
                                    <span className="font-semibold text-gray-800">{item.label}:</span>
                                    <span className="text-gray-600 ml-1">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4">
                            <h4 className="text-sm font-semibold text-gray-800">Phương thức vận chuyển</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                {shipping.map((partner) => (
                                    <div key={partner.name} className="h-8 px-3 bg-white border border-gray-200 rounded flex items-center">
                                        <span className="text-xs text-gray-600 font-medium">{partner.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-800">{content.quickLinks.title}</h3>
                        <ul className="space-y-2.5">
                            {content.quickLinks.items.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1">
                                        <span className="text-red-500">•</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-800">{content.newsletter.title}</h3>
                        <p className="text-sm text-gray-600">{content.newsletter.description}</p>
                        <div className="flex gap-2">
                            <Input type="email" placeholder="Nhập email của bạn" className="h-10 text-sm rounded-none focus:outline-none " />
                            <Button variant="default" className="h-10 px-4 bg-red-600 hover:bg-red-700 rounded-none">
                                Gửi
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-border">
                <div className="mx-auto px-4 lg:px-6 py-4">
                    <p className="text-sm text-center text-gray-600">© 2024 ARES CLUB. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
