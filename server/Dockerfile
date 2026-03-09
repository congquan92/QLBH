FROM php:8.2-fpm

# Cài đặt các thư viện hệ thống cần thiết
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip nginx

# Cài đặt PHP extensions cho MySQL
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Cài đặt và kích hoạt Redis extension (Rất quan trọng cho project của bạn)
RUN pecl install redis && docker-php-ext-enable redis

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc
WORKDIR /var/www
COPY . .

# Cài đặt các thư viện PHP (bỏ qua dev)
RUN composer install --no-dev --optimize-autoloader

# Phân quyền cho thư mục storage và cache (Laravel yêu cầu)
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose port 8000
EXPOSE 8000

# Lệnh khởi chạy server
CMD php artisan serve --host=0.0.0.0 --port=8000