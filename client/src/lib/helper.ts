export const Helper = {
    formatPrice: (price: string) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(parseFloat(price));
    },

    generateSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");
    },
};
