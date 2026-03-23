<div align="center">

#  QLBH — Sales Management System

**Hệ thống quản lý bán hàng toàn diện** dành cho doanh nghiệp vừa và nhỏ, bao gồm quản lý sản phẩm, đơn hàng, nhân sự, lương thưởng và thống kê doanh thu.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

</div>

---

##  Giới thiệu dự án

**QLBH** là hệ thống quản lý bán hàng full-stack được xây dựng theo kiến trúc **Client–Server** tách biệt, sử dụng **RESTful API** làm lớp giao tiếp.

Hệ thống bao gồm hai giao diện chính:
- **Storefront (Customer)** — Giao diện mua sắm dành cho khách hàng.
- **Admin Panel** — Bảng điều khiển quản trị toàn bộ hoạt động của cửa hàng và nhân sự.

> Dự án được phát triển trong khuôn khổ học phần **Lập trình Web 2** , hướng đến việc xây dựng một sản phẩm thực tế.

---

##  Tính năng nổi bật

###  Dành cho Khách hàng
| Tính năng | Mô tả |
|---|---|
| **Xác thực & Phân quyền** | Đăng ký, đăng nhập JWT, đăng nhập Google OAuth2 (Socialite), làm mới token |
| **Trang sản phẩm** | Danh sách sản phẩm, filter/tìm kiếm, phân trang, xem theo danh mục |
| **Giỏ hàng** | Thêm, cập nhật số lượng, xóa sản phẩm khỏi giỏ hàng |
| **Đặt hàng & Thanh toán** | Đặt hàng, chọn địa chỉ giao, áp dụng voucher, thanh toán VNPay / COD |
| **Quản lý tài khoản** | Cập nhật thông tin, đổi mật khẩu/email/số điện thoại qua OTP, quản lý địa chỉ |
| **Đánh giá sản phẩm** | Viết & xem đánh giá sao, đính kèm hình ảnh |
| **Hạng khách hàng** | Phân hạng khách hàng theo doanh số (loyalty tier) |

###  Dành cho Quản trị viên
| Tính năng | Mô tả |
|---|---|
| **Dashboard thống kê** | Doanh thu 12 tháng, top sản phẩm bán chạy, top khách hàng, thống kê đơn hàng |
| **Quản lý sản phẩm** | CRUD sản phẩm, biến thể (size, màu, ...), thuộc tính, danh mục cây phân cấp |
| **Quản lý đơn hàng** | Xem & cập nhật trạng thái đơn hàng, xem chi tiết, hủy đơn |
| **Quản lý kho** | Nhập hàng từ nhà cung cấp, xác nhận/hủy phiếu nhập, theo dõi tồn kho |
| **Quản lý nhân sự** | CRUD nhân viên, chấm công check-in/check-out, lịch sử công tác, thăng chức |
| **Quản lý ca làm việc** | Tạo ca, phân công ca, lịch tuần, lịch theo vị trí, ngày lễ |
| **Nghỉ phép** | Nhân viên gửi đơn xin nghỉ, admin duyệt/từ chối |
| **Tính lương** | Tính lương tự động theo ca làm/chấm công, cấu hình lương, bảng lương, thưởng |
| **Voucher & Khuyến mãi** | Tạo và quản lý mã giảm giá, theo dõi lượt sử dụng |
| **RBAC** | Phân quyền linh hoạt theo Role → Group Permissions → Pages; gán/thu hồi quyền |
| **Xuất dữ liệu** | Xuất Excel lịch làm việc, danh sách đi muộn |

---

##  Kiến trúc hệ thống

```
QLBH/
├── client/          # Frontend — Next.js 16 + React 19 + TypeScript
│   └── src/
│       ├── app/
│       │   ├── (client)/    # Storefront: trang chủ, sản phẩm, giỏ hàng, đặt hàng
│       │   └── admin/       # Admin Panel: dashboard, quản lý toàn bộ nghiệp vụ
│       ├── api/             # Axios API client, interceptors, type-safe wrappers
│       ├── components/      # UI components (Radix UI + shadcn/ui)
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utilities, validators (Zod)
│       └── types/           # TypeScript types/interfaces
│
└── server/          # Backend — Laravel 12 (PHP 8.4)
    ├── App/
    │   ├── Http/
    │   │   ├── Controllers/ # 40 controllers REST
    │   │   ├── Service/     # Business logic layer (32 services)
    │   │   ├── Middleware/  # JWT Auth, RBAC middleware
    │   │   ├── Requests/    # Form Request validation
    │   │   └── Responses/   # Chuẩn hoá response cấu trúc
    │   ├── Models/          # 35 Eloquent models
    │   ├── Jobs/            # Queue jobs (email, notification)
    │   ├── Notifications/   # Firebase push notifications
    │   └── Exports/         # Maatwebsite Excel exports
    └── database/
        └── migrations/      # 44 migration files
```

---

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
- **Node.js** >= 18
- **PHP** >= 8.4 + Composer
- **Docker Desktop** (dùng cho MySQL & Redis)

### 1. Clone repository

```bash
git clone <repository-url>
cd QLBH
```

### 2. Khởi động MySQL & Redis qua Docker

```bash
cd server
docker-compose up -d
```

> Mặc định: MySQL chạy ở port `3308`, Redis ở port `6380`.

### 3. Cấu hình Backend (Laravel)

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate

# Cấu hình .env: DB_HOST, DB_PORT, JWT_SECRET, CLOUDINARY_*, BREVO_API_KEY, ...

php artisan migrate --seed
php artisan serve
```

### 4. Cấu hình Frontend (Next.js)

```bash
cd client
npm install
cp .env.example .env.local

# NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm run dev
```

Ứng dụng chạy tại:
- **Client (Storefront):** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **API Server:** http://localhost:8000/api

---

##  Bảo mật & Phân quyền

- **JWT Authentication** — Access token + Refresh token, tự động làm mới qua silent refresh.
- **Google OAuth2** — Đăng nhập nhanh bằng tài khoản Google (Laravel Socialite).
- **RBAC (Role-Based Access Control)** — Phân quyền 3 lớp: `Role → GroupPermission → Page`, kiểm tra từng route trong admin panel.
- **OTP Verification** — Xác minh email qua mã OTP (Brevo / Sendinblue) cho thay đổi thông tin nhạy cảm.
- **Middleware JWT** trên toàn bộ route yêu cầu xác thực phía server.

---
<!-- 
##  Tác giả

> Dự án được phát triển cá nhân trong khuôn khổ môn học **Web 2**, Năm 3, Kỳ 1.

--- -->

<div align="center">

**⭐ Nếu dự án này hữu ích, hãy để lại một star trên GitHub!**

</div>
