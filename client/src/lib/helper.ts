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
    errorMessage(error: unknown) {
        const msg = error instanceof Error ? ((error as Error & { response?: { data?: { message?: string } } }).response?.data?.message ?? error.message) : "Thao tác thất bại";
        return msg;
    },
    formatCurrency(value?: number | string) {
        const num = Number(value ?? 0);
        if (isNaN(num)) return String(value ?? "-");
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(num);
    },
    formatNumber(value: number) {
        return new Intl.NumberFormat("vi-VN").format(Math.max(0, value || 0));
    },
    // formatMoney(value: number) {
    //     return new Intl.NumberFormat("vi-VN", {
    //         style: "currency",
    //         currency: "VND",
    //         maximumFractionDigits: 0,
    //     }).format(value || 0);
    // },
    formatMonth(value: string) {
        const input = String(value || "").trim();
        if (!input) return "--";

        const [year, month] = input.split("-");
        if (!year || !month) return input;
        return `${month}/${year.slice(-2)}`;
    },
    formatPercent(value: number) {
        return `${(value || 0).toFixed(1)}%`;
    },
};
