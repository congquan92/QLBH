FROM php:8.4-fpm

# 1. Cài đặt các thư viện hệ thống cần thiết (Thêm libzip-dev)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    nginx

# 2. Cài đặt các PHP extensions (Bổ sung 'zip' vào danh sách install)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# 3. Cài đặt và kích hoạt Redis
RUN pecl install redis && docker-php-ext-enable redis

# 4. Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Thiết lập thư mục làm việc
WORKDIR /var/www
COPY . .

# 6. Cài đặt các thư viện PHP
RUN composer install --no-dev --optimize-autoloader --no-scripts

# 7. Phân quyền
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000