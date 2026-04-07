export interface ActiveUserStats {
    period: number;
    current: number;
    previous: number;
    percentChange: number;
}

export interface OrderStats {
    period: number;
    current: number;
    previous: number;
    percentChange: number;
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
    cost: number;
    profit: number;
}

export interface TopProduct {
    productId: number;
    name: string;
    soldQuantity: number;
    percentChange: number;
    listPrice: string;
    salePrice: string;
    urlCoverImage: string | null;
}

export interface CategoryStats {
    categoryName: string;
    quantity: number;
    previousQuantity: number;
    percentChange: number;
}

export interface TopCustomerOrder {
    orderId: number;
    totalAmount: number;
    orderStatus: string;
    createdAt: string;
}

export interface TopCustomerStats {
    userId: number | null;
    customerName: string;
    customerPhone: string | null;
    customerEmail: string | null;
    totalPurchase: number;
    orderCount: number;
    orders: TopCustomerOrder[];
}

export type StatsPeriodType = "month" | "quarter" | "year";

export interface StatsFilterParams {
    period_type: StatsPeriodType;
    year?: number;
    month?: number;
    quarter?: number;
}

export interface OverviewStats {
    period_type: StatsPeriodType;
    period_label: string;
    start_date: string;
    end_date: string;
    revenue: number;
    cost: number;
    profit: number;
    orders: number;
    new_users: number;
    top_products: Array<{
        product_id: number;
        product_name: string;
        quantity: number;
        total_revenue: number;
    }>;
    category_breakdown: Array<{
        category_id: number;
        category_name: string;
        sold_quantity: number;
        percentage: number;
    }>;
    top_customers: Array<{
        userId: number | null;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        totalPurchase: number;
        orderCount: number;
        orders: Array<{
            orderId: number;
            totalAmount: number;
            orderStatus: string;
            createdAt: string;
        }>;
    }>;
}

export interface WorkforceStats {
    period_type: StatsPeriodType;
    period_label: string;
    start_date: string;
    end_date: string;
    summary: {
        total_employees: number;
        active_employees: number;
        inactive_employees: number;
        new_employees: number;
        approved_leave_days: number;
    };
    attendance_summary: Array<{
        status: string;
        total: number;
    }>;
    position_breakdown: Array<{
        position_name: string;
        total: number;
    }>;
    employment_breakdown: Array<{
        employment_type: string;
        total: number;
    }>;
}

export interface SalaryStats {
    period_type: StatsPeriodType;
    period_label: string;
    start_date: string;
    end_date: string;
    summary: {
        total_base_salary: number;
        total_holiday_bonus: number;
        total_manual_bonus: number;
        total_final_salary: number;
        average_salary: number;
        record_count: number;
        failed_record_count: number;
        employee_count: number;
    };
    top_employees: Array<{
        user_id: number;
        employee_name: string;
        total_salary: number;
    }>;
    bonus_by_type: Array<{
        type: string;
        total_amount: number;
        recipients: Array<{
            user_id: number;
            employee_name: string;
            total_amount: number;
            bonus_items: Array<{
                id: number;
                amount: number;
                reason: string;
                bonus_type: string;
                month: number;
                year: number;
                created_at: string | null;
            }>;
        }>;
    }>;
}

export interface ProductExportStats {
    period_type: StatsPeriodType;
    period_label: string;
    start_date: string;
    end_date: string;
    summary: {
        total_export_quantity: number;
        total_export_revenue: number;
        product_count: number;
    };
    top_products: Array<{
        product_id: number;
        product_name: string;
        quantity: number;
        revenue: number;
    }>;
    trend: Array<{
        label: string;
        quantity: number;
    }>;
}
