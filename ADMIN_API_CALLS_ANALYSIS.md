# Admin Client API Calls Analysis

## Overview

This document provides a comprehensive analysis of all API calls made by admin pages in the QLBH (Quản Lý Bán Hàng) client application.

---

## Admin Pages API Mapping

### 1. **Dashboard** (`/admin/dashboard`)

Main admin overview page with statistics and key metrics.

| API Function                         | Endpoint                        | Method | Query Parameters            | Response Type              | Purpose                      |
| ------------------------------------ | ------------------------------- | ------ | --------------------------- | -------------------------- | ---------------------------- |
| `OrderApi.getAdminOrders()`          | `/order/admin/list`             | GET    | page, size, sort            | PageResponse<OrderSummary> | Fetch recent orders          |
| `ProductApi.getAllProducts()`        | `/product/list`                 | GET    | page, size                  | PageResponse<Product>      | Fetch products list          |
| `UserApi.getUsers()`                 | `/user/list`                    | GET    | page, size, keyword, sort   | PageResponse<UserProfile>  | Fetch users list             |
| `StatisticsApi.getActiveUsers()`     | `/statistical/users`            | GET    | period (1-7d, 2-30d, 3-90d) | ActiveUserStats            | Active user statistics       |
| `StatisticsApi.getOrders()`          | `/statistical/orders`           | GET    | period (1-7d, 2-30d, 3-90d) | OrderStats                 | Order statistics             |
| `StatisticsApi.getRevenue12Months()` | `/statistical/revenue-12months` | GET    | -                           | MonthlyRevenue[]           | 12-month revenue/cost/profit |
| `StatisticsApi.getTopProducts()`     | `/statistical/top-products`     | GET    | period, top (default: 5)    | TopProduct[]               | Top selling products         |

**Issues/Notes:**

- Dashboard uses permission-based conditional rendering with `VIEW_ORDERS_ADMIN`, `VIEW_PRODUCTS_ADMIN`, `VIEW_USERS`, `VIEW_STATISTICAL` permissions

---

### 2. **Orders** (`/admin/orders`)

Order management page.

| API Function                | Endpoint                            | Method | Query Parameters                                              | Response Type              | Purpose                      |
| --------------------------- | ----------------------------------- | ------ | ------------------------------------------------------------- | -------------------------- | ---------------------------- |
| `OrderApi.getAdminOrders()` | `/order/admin/list`                 | GET    | page, size, sort, keyword, startDate, endDate, deliveryStatus | PageResponse<OrderSummary> | Fetch admin orders           |
| `OrderApi.changeStatus()`   | `/order/changestatus/{id}/{status}` | POST   | -                                                             | ApiResponse                | Change order delivery status |
| `OrderApi.complete()`       | `/complete/{id}`                    | PUT    | -                                                             | ApiResponse                | Mark order as completed      |
| `OrderApi.cancel()`         | `/order/cancel/{id}`                | DELETE | -                                                             | ApiResponse                | Cancel order                 |

**Issues/Notes:**

- Permission checks: `VIEW_ORDERS_ADMIN`, `UPDATE_ORDER_STATUS`
- All order state changes go through POST/PUT/DELETE operations
- Complex order status enums (PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED, COMPLETED, CANCELLED)

---

### 3. **Products** (`/admin/products`)

Product management page.

| API Function                  | Endpoint        | Method | Query Parameters | Response Type         | Purpose            |
| ----------------------------- | --------------- | ------ | ---------------- | --------------------- | ------------------ |
| `ProductApi.getAllProducts()` | `/product/list` | GET    | page=1, size=20  | PageResponse<Product> | Fetch product list |

**Issues/Notes:**

- Permission: `VIEW_PRODUCTS_ADMIN`
- Limited functionality shown (no create/edit/delete implemented in UI yet)

---

### 4. **Employees** (`/admin/employees`)

Placeholder - Coming soon page.

| API Function         | Endpoint | Method | Query Parameters | Response Type | Purpose |
| -------------------- | -------- | ------ | ---------------- | ------------- | ------- |
| _None - Coming Soon_ | -        | -      | -                | -             | -       |

**Issues/Notes:**

- Not implemented yet; marked for reusing user list API
- Requires: `VIEW_USERS` permission

---

### 5. **Attendance** (`/admin/attendance`)

Employee check-in/check-out tracking.

| API Function                 | Endpoint                 | Method | Query Parameters                     | Response Type                  | Purpose                   |
| ---------------------------- | ------------------------ | ------ | ------------------------------------ | ------------------------------ | ------------------------- |
| `AttendanceApi.record()`     | `/attendance/record`     | POST   | -                                    | AttendanceRecord               | Record check-in/check-out |
| `AttendanceApi.getHistory()` | `/attendance/my-history` | GET    | startDate, endDate, page, size, sort | ApiResponse<AttendanceHistory> | Fetch attendance history  |

**Issues/Notes:**

- Fetches history with 30 records per page by default
- Auto-detects check-in vs check-out based on presence of check_out time

---

### 6. **Salary** (`/admin/salary`)

Salary configuration management (configs and scales).

| API Function                        | Endpoint               | Method | Query Parameters | Response Type              | Purpose                  |
| ----------------------------------- | ---------------------- | ------ | ---------------- | -------------------------- | ------------------------ |
| `AdminCrudApi.getSalaryConfigs()`   | `/salary-configs/list` | GET    | page, size, sort | PageResponse<SalaryConfig> | Fetch salary configs     |
| `AdminCrudApi.createSalaryConfig()` | `/salary-configs`      | POST   | -                | -                          | Create new salary config |
| `AdminCrudApi.updateSalaryConfig()` | `/salary-configs/{id}` | PUT    | -                | -                          | Update salary config     |
| `AdminCrudApi.deleteSalaryConfig()` | `/salary-configs/{id}` | DELETE | -                | -                          | Delete salary config     |
| `AdminCrudApi.getSalaryScales()`    | `/salary-scales/list`  | GET    | page, size, sort | PageResponse<SalaryScale>  | Fetch salary scales      |
| `AdminCrudApi.createSalaryScale()`  | `/salary-scales`       | POST   | -                | -                          | Create new salary scale  |
| `AdminCrudApi.updateSalaryScale()`  | `/salary-scales/{id}`  | PUT    | -                | -                          | Update salary scale      |
| `AdminCrudApi.deleteSalaryScale()`  | `/salary-scales/{id}`  | DELETE | -                | -                          | Delete salary scale      |

**Payload Examples:**

- SalaryConfig: `{ rule_name, employee_type, multiplier, is_holiday }`
- SalaryScale: `{ name, years_of_experience, coefficient }`

**Issues/Notes:**

- Batch operations for SalaryConfigs available via `createSalaryConfig({ configs: [...] })`

---

### 7. **Leave Requests** (`/admin/leave-requests`)

Employee leave request management.

| API Function               | Endpoint                      | Method | Query Parameters                  | Response Type              | Purpose                             |
| -------------------------- | ----------------------------- | ------ | --------------------------------- | -------------------------- | ----------------------------------- |
| `LeaveApi.getAll()`        | `/leave-requests/list`        | GET    | page, size, sort, keyword, status | PageResponse<LeaveRequest> | Fetch all leave requests (admin)    |
| `LeaveApi.getMyLeaves()`   | `/leave-requests/me`          | GET    | page, size, sort, keyword, status | PageResponse<LeaveRequest> | Fetch employee's own leave requests |
| `AdminCrudApi.getShifts()` | `/shifts/list`                | GET    | page, size, sort                  | PageResponse<Shift>        | Fetch shifts for form dropdown      |
| `LeaveApi.create()`        | `/leave-requests/`            | POST   | -                                 | LeaveRequest               | Create leave request                |
| `LeaveApi.updateStatus()`  | `/leave-requests/{id}/status` | POST   | -                                 | LeaveRequest               | Approve/reject leave request        |
| `LeaveApi.delete()`        | `/leave-requests/{id}`        | DELETE | -                                 | -                          | Delete leave request                |

**Request Payload:**

- Create: `{ leave_date, shift_id, reason? }`
- Update Status: `{ status: "APPROVED" \| "REJECTED" }`

**Issues/Notes:**

- Permissions: `VIEW_LEAVE_LIST`, `APPROVE_LEAVE`
- Status field conditionally determined by `hasPermission`

---

### 8. **Positions** (`/admin/positions`)

Job position/role management.

| API Function                    | Endpoint          | Method | Query Parameters          | Response Type          | Purpose              |
| ------------------------------- | ----------------- | ------ | ------------------------- | ---------------------- | -------------------- |
| `AdminCrudApi.getPositions()`   | `/positions`      | GET    | page, size, sort, keyword | PageResponse<Position> | Fetch positions list |
| `AdminCrudApi.createPosition()` | `/positions`      | POST   | -                         | -                      | Create new position  |
| `AdminCrudApi.updatePosition()` | `/positions/{id}` | PUT    | -                         | -                      | Update position      |
| `AdminCrudApi.deletePosition()` | `/positions/{id}` | DELETE | -                         | -                      | Delete position      |

**Request Payload:**

- Create/Update: `{ name, base_salary, salary_type }`

**Issues/Notes:**

- Full CRUD operations with form-based UI
- Validates non-empty name and base_salary fields

---

### 9. **Shifts** (`/admin/shifts`)

Work shift management.

| API Function                 | Endpoint       | Method | Query Parameters          | Response Type       | Purpose           |
| ---------------------------- | -------------- | ------ | ------------------------- | ------------------- | ----------------- |
| `AdminCrudApi.getShifts()`   | `/shifts/list` | GET    | page, size, sort, keyword | PageResponse<Shift> | Fetch shifts list |
| `AdminCrudApi.createShift()` | `/shifts`      | POST   | -                         | -                   | Create new shift  |
| `AdminCrudApi.updateShift()` | `/shifts/{id}` | PUT    | -                         | -                   | Update shift      |
| `AdminCrudApi.deleteShift()` | `/shifts/{id}` | DELETE | -                         | -                   | Delete shift      |

**Request Payload:**

- Create/Update: `{ name, start_time, end_time, grace_period }`
- Time format: HH:MM:SS

**Issues/Notes:**

- Time parsing converts HH:MM to HH:MM:00 for API submission
- Grace period for late arrival tolerance

---

### 10. **Holidays** (`/admin/holidays`)

Holiday and special days management.

| API Function                   | Endpoint         | Method | Query Parameters          | Response Type         | Purpose             |
| ------------------------------ | ---------------- | ------ | ------------------------- | --------------------- | ------------------- |
| `AdminCrudApi.getHolidays()`   | `/holidays/list` | GET    | page, size, sort, keyword | PageResponse<Holiday> | Fetch holidays list |
| `AdminCrudApi.createHoliday()` | `/holidays`      | POST   | -                         | -                     | Create new holiday  |
| `AdminCrudApi.updateHoliday()` | `/holidays/{id}` | PUT    | -                         | -                     | Update holiday      |
| `AdminCrudApi.deleteHoliday()` | `/holidays/{id}` | DELETE | -                         | -                     | Delete holiday      |

**Request Payload:**

- Create/Update: `{ name, holiday_date }`

---

### 11. **Reviews** (`/admin/reviews`)

Customer reviews management.

| API Function                  | Endpoint   | Method | Query Parameters          | Response Type        | Purpose                 |
| ----------------------------- | ---------- | ------ | ------------------------- | -------------------- | ----------------------- |
| `ReviewApi.getAdminReviews()` | `/reviews` | GET    | page, size, sort, keyword | PageResponse<Review> | Fetch reviews for admin |

**Issues/Notes:**

- Permission: `VIEW_REVIEWS_ADMIN`
- Read-only display mode (no edit/delete in current UI)

---

### 12. **Vouchers** (`/admin/vouchers`)

Discount voucher management.

| API Function                    | Endpoint               | Method | Query Parameters          | Response Type          | Purpose                     |
| ------------------------------- | ---------------------- | ------ | ------------------------- | ---------------------- | --------------------------- |
| `VoucherApi.getAdminVouchers()` | `/voucher/admin/list`  | GET    | page, size, sort, keyword | PageResponse<Voucher>  | Fetch vouchers for admin    |
| `AdminCrudApi.getUserRanks()`   | `/user-rank/list`      | GET    | page, size                | PageResponse<UserRank> | Fetch user ranks (for form) |
| `VoucherApi.create()`           | `/voucher/add`         | POST   | -                         | -                      | Create new voucher          |
| `VoucherApi.update()`           | `/voucher/update/{id}` | PUT    | -                         | -                      | Update voucher              |

**Request Payload:**

```
{
  description,
  type: "PERCENTAGE" | "FIXED",
  discount_value,
  max_discount_value?,
  min_discount_value,
  total_quantity,
  start_date,
  end_date,
  usage_limit_per_user?,
  user_rank_id,
  is_shipping
}
```

---

### 13. **Categories** (`/admin/categories`)

Product category management.

| API Function                       | Endpoint         | Method | Query Parameters          | Response Type          | Purpose                    |
| ---------------------------------- | ---------------- | ------ | ------------------------- | ---------------------- | -------------------------- |
| `CategoryApi.getAdminCategories()` | `/category/list` | GET    | page, size, sort, keyword | PageResponse<Category> | Fetch categories for admin |

**Issues/Notes:**

- Read-only display mode currently
- Shows category count and parent-child relationships

---

### 14. **Suppliers** (`/admin/suppliers`)

Supplier/vendor management.

| API Function                    | Endpoint          | Method | Query Parameters                  | Response Type          | Purpose              |
| ------------------------------- | ----------------- | ------ | --------------------------------- | ---------------------- | -------------------- |
| `AdminCrudApi.getSuppliers()`   | `/suppliers`      | GET    | page, size, sort, keyword, status | PageResponse<Supplier> | Fetch suppliers list |
| `AdminCrudApi.createSupplier()` | `/suppliers`      | POST   | -                                 | -                      | Create new supplier  |
| `AdminCrudApi.updateSupplier()` | `/suppliers/{id}` | PUT    | -                                 | -                      | Update supplier      |
| `AdminCrudApi.deleteSupplier()` | `/suppliers/{id}` | DELETE | -                                 | -                      | Delete supplier      |

**Request Payload:**

- Create/Update: `{ name, phone, address, province, district, ward, provinceId, districtId, wardId, status }`

**Issues/Notes:**

- Full address hierarchy support (province/district/ward)
- Status: "ACTIVE" or "INACTIVE"

---

### 15. **Imports** (`/admin/imports`)

Product import/stock management.

| API Function                            | Endpoint                           | Method | Query Parameters          | Response Type               | Purpose                  |
| --------------------------------------- | ---------------------------------- | ------ | ------------------------- | --------------------------- | ------------------------ |
| `AdminCrudApi.getImportProducts()`      | `/import-products`                 | GET    | page, size, sort, keyword | PageResponse<ImportProduct> | Fetch import records     |
| `AdminCrudApi.createImportProduct()`    | `/import-products`                 | POST   | -                         | -                           | Create new import record |
| `AdminCrudApi.confirmImportProduct()`   | `/import-products/{id}/confirm`    | POST   | -                         | -                           | Confirm import receipt   |
| `AdminCrudApi.cancelImportProduct()`    | `/import-products/{id}/cancel`     | POST   | -                         | -                           | Cancel import record     |
| `AdminCrudApi.updateImportQuantities()` | `/import-products/{id}/quantities` | PUT    | -                         | -                           | Update import quantities |
| `AdminCrudApi.deleteImportProduct()`    | `/import-products/{id}`            | DELETE | -                         | -                           | Delete import record     |

**Request Payload:**

- Create:

```
{
  product_id,
  import_details: [
    { product_variant_id, quantity, unitPrice }
  ]
}
```

- Update Quantities:

```
{
  items: [
    { importDetailId, quantity }
  ]
}
```

**Issues/Notes:**

- Import details must be valid JSON array format
- Supports variant-level quantity tracking

---

### 16. **Schedules** (`/admin/schedules`)

Employee work schedule management.

| API Function                    | Endpoint                   | Method | Query Parameters  | Response Type | Purpose                    |
| ------------------------------- | -------------------------- | ------ | ----------------- | ------------- | -------------------------- |
| `ScheduleApi.getWeeklyReport()` | `/schedules/weekly-report` | GET    | date (YYYY-MM-DD) | WeeklyReport  | Get weekly schedule report |
| `ScheduleApi.getDailyStaff()`   | `/schedules/daily`         | GET    | date (YYYY-MM-DD) | DailyStaff    | Get daily staff schedule   |
| `ScheduleApi.getMySchedule()`   | `/schedules/my-schedule`   | GET    | date (YYYY-MM-DD) | MySchedule    | Get personal schedule      |

**Issues/Notes:**

- Permissions: `VIEW_SCHEDULE_REPORT`, `VIEW_DAILY_SCHEDULE`
- Date defaults to current date if not provided
- Three view modes: weekly report, daily staff, personal schedule
- Date navigation with +/- day increments

---

### 17. **Salary Calculation** (`/admin/salary-calculation`)

Employee salary calculation tool.

| API Function                  | Endpoint                       | Method | Query Parameters | Response Type             | Purpose                   |
| ----------------------------- | ------------------------------ | ------ | ---------------- | ------------------------- | ------------------------- |
| `UserApi.getUsers()`          | `/user/list`                   | GET    | page, size       | PageResponse<UserProfile> | Fetch users for selection |
| `SalaryApi.calculateSalary()` | `/salaries/calculate/{userId}` | GET    | month, year      | SalaryCalculation         | Calculate monthly salary  |

**Issues/Notes:**

- Permission: `CALCULATE_SALARY`
- Returns detailed salary breakdown including: base salary, hours worked, overtime, deductions, bonus
- Requires month and year parameters

---

## API Endpoints Summary

### Base URL

All endpoints are relative to the backend API base (configured via axiosInstance in `/lib/axios`)

### Common Query Parameters

| Parameter   | Type   | Description                                | Default |
| ----------- | ------ | ------------------------------------------ | ------- |
| `page`      | number | Pagination page number                     | 1       |
| `size`      | number | Items per page                             | 10-100  |
| `sort`      | string | Sort field and direction (e.g., "id:desc") | -       |
| `keyword`   | string | Search keyword                             | -       |
| `startDate` | string | Filter start date (YYYY-MM-DD)             | -       |
| `endDate`   | string | Filter end date (YYYY-MM-DD)               | -       |

### Response Structure

**Success Response:**

```typescript
{
  status: number (200, 201, etc),
  message: string,
  data: T | PageResponse<T>
}
```

**PageResponse Structure:**

```typescript
{
  data: T[],
  pageNumber: number,
  pageSize: number,
  totalElements: number,
  totalPages: number
}
```

---

## Permission Matrix

### Required Permissions by Admin Page

| Page               | Permissions Required                                                 |
| ------------------ | -------------------------------------------------------------------- |
| Dashboard          | VIEW_ORDERS_ADMIN, VIEW_PRODUCTS_ADMIN, VIEW_USERS, VIEW_STATISTICAL |
| Orders             | VIEW_ORDERS_ADMIN, UPDATE_ORDER_STATUS                               |
| Products           | VIEW_PRODUCTS_ADMIN                                                  |
| Employees          | VIEW_USERS                                                           |
| Attendance         | (implicit - current user)                                            |
| Salary             | (any role can access)                                                |
| Leave Requests     | VIEW_LEAVE_LIST, APPROVE_LEAVE                                       |
| Positions          | (any role can access)                                                |
| Shifts             | (any role can access)                                                |
| Holidays           | (any role can access)                                                |
| Reviews            | VIEW_REVIEWS_ADMIN                                                   |
| Vouchers           | (any role can access)                                                |
| Categories         | (any role can access)                                                |
| Suppliers          | (any role can access)                                                |
| Imports            | (any role can access)                                                |
| Schedules          | VIEW_SCHEDULE_REPORT, VIEW_DAILY_SCHEDULE                            |
| Salary Calculation | CALCULATE_SALARY                                                     |

---

## Error Handling

### Common Error Patterns

1. **Fallback Data**: Many endpoints use static fallback data if API calls fail
2. **Error Messages**: Extracted from `error.response?.data?.message` or generic "Thao tác thất bại"
3. **Toast Notifications**: Used for user feedback on success/failure
4. **Warning Logs**: Prefixed with [WARNING] for API failures

### Notable Issues Observed

1. **User List Endpoint Mismatch**: Backend route `/user/list` maps to `UserController::list` but controller defines `findAll` - potential server error
2. **Order Complete Endpoint**: Uses `/complete/{id}` (PUT) instead of `/order/complete/{id}` - inconsistent naming
3. **Import Details Format**: Requires strict JSON array format parsing
4. **Time Format Conversion**: Shifts need HH:MM:SS format but UI uses HH:MM

---

## Data Types

### Key Interfaces (from types)

**OrderSummary:**

```typescript
{
  id: number,
  totalAmount: number,
  orderStatus: string,
  deliveryStatus: string,
  // ... other fields
}
```

**Product:**

```typescript
{
  id: number,
  name: string,
  description: string,
  salePrice: number,
  soldQuantity: number,
  status: "ACTIVE" | "INACTIVE"
}
```

**UserProfile:**

```typescript
{
  id: number,
  name?: string,
  fullName?: string,
  email?: string,
  // ... other fields
}
```

**AttendanceRecord:**

```typescript
{
  id: number,
  date: string,
  check_in?: string,
  check_out?: string,
  status: "PRESENT" | "LATE" | "ABSENT"
}
```

**SalaryCalculation:**

```typescript
{
  user_id: number,
  full_name: string,
  month: number,
  year: number,
  base_salary: number,
  total_hours: number,
  total_days_worked: number,
  overtime_hours: number,
  late_deductions: number,
  bonus: number,
  total_salary: number
}
```

---

## Notes & Observations

1. **Admin Auth Wrapper**: All pages use `useAdminAuth()` hook for permission checking
2. **Coming Soon Pages**: Employee page is placeholder for future implementation
3. **Async Operations**: Most operations use proper React cleanup patterns with mounted state
4. **Error Toast Notifications**: User feedback via "sonner" toast library
5. **Pagination**: Most list endpoints support pagination with page/size parameters
6. **Search/Filter**: Most endpoints support keyword search and basic sorting
7. **Date Handling**: Uses ISO 8601 format (YYYY-MM-DD) for all date parameters
8. **Currency Formatting**: `Helper.formatPrice()` used for display
9. **Status Enums**: Uses uppercase status strings (ACTIVE, PENDING, APPROVED, etc)
10. **Static Fallback Data**: For resilience, many endpoints have fallback responses defined in `/data/static-fallback`

---

**Generated**: Analysis of QLBH Admin Client API Calls
**Total Admin Pages**: 17
**Total API Endpoints**: 60+
**Total CRUD Operations**: 30+
