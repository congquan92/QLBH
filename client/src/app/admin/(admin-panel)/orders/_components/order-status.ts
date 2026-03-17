export const DELIVERY_STATUSES = [
    { value: "PENDING", label: "Chưa xác nhận", color: "yellow" },
    { value: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
    { value: "PACKED", label: "Đã xác nhận - đang đóng gói", color: "purple" },
    { value: "SHIPPED", label: "Đã xác nhận - đang giao", color: "indigo" },
    { value: "DELIVERED", label: "Đã giao", color: "cyan" },
    { value: "COMPLETED", label: "Đã giao thành công", color: "green" },
    { value: "CANCELLED", label: "Đã hủy", color: "red" },
] as const;

export type DeliveryStatusValue = (typeof DELIVERY_STATUSES)[number]["value"];

const STATUS_FLOW: Record<DeliveryStatusValue, DeliveryStatusValue[]> = {
    PENDING: ["CONFIRMED"],
    CONFIRMED: ["PACKED"],
    PACKED: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
};

const STATUS_COLORS: Record<string, string> = {
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function getOrderStatus(status?: string): DeliveryStatusValue {
    const matched = DELIVERY_STATUSES.find((s) => s.value === status);
    return matched?.value ?? "PENDING";
}

export function getStatusLabel(status?: string): string {
    return DELIVERY_STATUSES.find((s) => s.value === status)?.label ?? String(status ?? "Không xác định");
}

export function getStatusColorClass(status?: string): string {
    const color = DELIVERY_STATUSES.find((s) => s.value === status)?.color ?? "gray";
    return STATUS_COLORS[color] ?? STATUS_COLORS.gray;
}

export function getNextStatuses(status?: string): DeliveryStatusValue[] {
    const current = getOrderStatus(status);
    return STATUS_FLOW[current] ?? [];
}
