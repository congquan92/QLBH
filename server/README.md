### 1. Khởi tạo & Chạy Project

- **Cài đặt dependencies:**

```bash
composer install

```

- **Chạy dự án:**

```bash
php artisan server

```

- **Xem log hệ thống (Real-time):**

```bash
tail -f storage/logs/laravel.log

```

### 2. Database & Migration

- **Tạo file migration mới:**

```bash
php artisan make:migration name_of_file

```

- **Cập nhật DB (chạy các file migration mới):**

```bash
php artisan migrate

```

- **Làm sạch DB (Xóa hết bảng + Chạy lại từ đầu + Seed):**

```bash
php artisan migrate:fresh --seed

```

### 3. Model & Controller (Scaffolding)

- **Tạo full bộ Model, Factory, Migration, Controller (Resource):**

```bash
php artisan make:model Name -mfcr

```

_(Giải thích: `-m` migration, `-f` factory, `-c` controller, `-r` resource)_

### 4. Seeding & Data

- **Chạy file Seed (Tạo dữ liệu mẫu/Admin/Roles):**

```bash
php artisan db:seed

```

---

### 💡 Tips thực tế cho Gen Z:

- **Clear Cache:** Nếu sửa code/config mãi không nhận, "vả" ngay combo:

```bash
php artisan optimize:clear

```

- **List Routes:** Muốn xem API mình vừa tạo đường dẫn như nào:

```bash
php artisan route:list

```
