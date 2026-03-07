### 1. Khởi tạo & Chạy Project

- **Cài đặt thư viện:**

```bash
composer install

```

- **Cấu hình môi trường:** Copy file `.env.example` thành `.env` và cấu hình Database.
- **Chạy dự án:**

```bash
php artisan serve

# Hoặc chỉ định host
php artisan serve --host=localhost
```

- **Xác thực vân tay (WebAuthn):**

```bash
composer require laragear/webauthn

```

- **Cập nhật Swagger API Doc:**

```bash
php artisan l5-swagger:generate

```

---

### 2. Database & Migration

| Lệnh                               | Ý nghĩa                                                               |
| ---------------------------------- | --------------------------------------------------------------------- |
| `php artisan make:migration Name`  | Tạo file migration mới                                                |
| `php artisan migrate`              | Cập nhật bảng mới vào Database                                        |
| `php artisan migrate:fresh --seed` | **Làm sạch DB:** Xóa hết bảng + Chạy lại migration + Seed dữ liệu mẫu |

---

### 3. Model, Controller & Scaffolding

Để tạo nhanh một chức năng (bao gồm cả database, dữ liệu mẫu và logic), dùng lệnh:

```bash
php artisan make:model Name -mfcr

```

_Giải thích flag:_

- `-m`: Tạo file **Migration** (tạo bảng).
- `-f`: Tạo file **Factory** (định nghĩa dữ liệu ảo).
- `-c`: Tạo **Controller**.
- `-r`: Biến Controller thành **Resource** (có sẵn các hàm index, store, update, destroy).

---

### 4. Seeding & Data (Dữ liệu mẫu)

- **Tạo file Seeder mới:**

```bash
php artisan make:seeder FileName

```

- **Chạy Seeder mặc định (Admin, Role, Permission...):**

```bash
php artisan db:seed

```

- **Chạy duy nhất một file Seeder cụ thể:**

```bash
php artisan db:seed --class=FileName

```

---

### 5. Debug & Hệ thống

- **Xem Log Real-time:** Theo dõi lỗi ngay khi nó xảy ra.

```bash
tail -f storage/logs/laravel.log

```

- **Kiểm tra danh sách Routes:** Xem tất cả các đường dẫn API/Web hiện có.

```bash
php artisan route:list

```

- **Clear Cache:** Dùng khi sửa code/config

```bash
php artisan optimize:clear

```

---
