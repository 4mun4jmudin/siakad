
```shell
# ========== APP ==========
APP_NAME=sisab
APP_ENV=local
APP_KEY=base64:rU6yZ+xXksqbFTQ5NQFp7yUWmwv4w2HRg/S5DtofBeU=
APP_DEBUG=true
# APP_URL=https://5a5bdec15ad8.ngrok-free.app
# Kalau balik ke lokal biasa: ganti ke http://127.0.0.1:8000
APP_URL=http://127.0.0.1:8000
# APP_URL=http://192.168.1.3:8000
# APP_URL=https://sticks-animals-mechanical-solutions.trycloudflare.com
# SANCTUM_STATEFUL_DOMAINS=sticks-animals-mechanical-solutions.trycloudflare.com


# Saat testing via ngrok (HP), JANGAN pakai Vite dev server
VITE_DEV_SERVER_URL=

# ========== LOCALE ==========
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US
FILESYSTEM_DISK=public

# ========== MAINTENANCE / PHP ==========
APP_MAINTENANCE_DRIVER=file
PHP_CLI_SERVER_WORKERS=4
BCRYPT_ROUNDS=12

# ========== LOGGING ==========
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# ========== DATABASE ==========
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_sistem
DB_USERNAME=root
DB_PASSWORD=

# ========== SESSION / COOKIES ==========
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
# SESSION_DOMAIN=sticks-animals-mechanical-solutions.trycloudflare.com
# Untuk dev lokal, biarkan SESSION_DOMAIN kosong.
SESSION_DOMAIN=
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=lax
# Catatan:
# - Biarkan SESSION_DOMAIN kosong untuk dev.
# - Jika kembali ke HTTP lokal (tanpa ngrok), ubah SESSION_SECURE_COOKIE=false.

# ========== BROADCAST / FILES / QUEUE / CACHE ==========
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=file
CACHE_PREFIX=laravel_cache

# ========== MEMCACHED / REDIS ==========
MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# ========== MAIL ==========
MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME="${APP_NAME}"

# ========== AWS (opsional) ==========
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# ========== VITE ==========
VITE_APP_NAME="${APP_NAME}"
VITE_GOOGLE_MAPS_API_KEY=ISI_API_KEY_GOOGLE_MAPS_BRO




# APP_NAME=sisab
# APP_ENV=local
# APP_KEY=base64:rU6yZ+xXksqbFTQ5NQFp7yUWmwv4w2HRg/S5DtofBeU=
# APP_DEBUG=true
# # APP_URL=http://192.168.1.89:8000
# # APP_URL=http://127.0.0.1:8000
# APP_URL=https://080dee682834.ngrok-free.app
# # Kalau mau pakai ngrok: APP_URL=https://<subdomain>.ngrok-free.app
# # VITE_DEV_SERVER_URL=http://127.0.0.1:5173

# APP_LOCALE=en
# APP_FALLBACK_LOCALE=en
# APP_FAKER_LOCALE=en_US

# APP_MAINTENANCE_DRIVER=file
# PHP_CLI_SERVER_WORKERS=4
# BCRYPT_ROUNDS=12

# LOG_CHANNEL=stack
# LOG_STACK=single
# LOG_DEPRECATIONS_CHANNEL=null
# LOG_LEVEL=debug

# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=db_sistem
# DB_USERNAME=root
# DB_PASSWORD=

# # --- Session / Cookie ---
# SESSION_DRIVER=file
# SESSION_LIFETIME=120
# SESSION_ENCRYPT=false
# SESSION_PATH=/
# SESSION_DOMAIN=
# SESSION_SECURE_COOKIE=true
# SESSION_SAME_SITE=lax
# # NOTE:
# # - Biarkan SESSION_DOMAIN KOSONG untuk dev lokal.
# # - Pakai satu host konsisten: 127.0.0.1 ATAU localhost (jangan dicampur).

# BROADCAST_CONNECTION=log
# FILESYSTEM_DISK=local
# QUEUE_CONNECTION=database

# CACHE_STORE=file
# CACHE_PREFIX=laravel_cache

# MEMCACHED_HOST=127.0.0.1

# REDIS_CLIENT=phpredis
# REDIS_HOST=127.0.0.1
# REDIS_PASSWORD=null
# REDIS_PORT=6379

# MAIL_MAILER=log
# MAIL_SCHEME=null
# MAIL_HOST=127.0.0.1
# MAIL_PORT=2525
# MAIL_USERNAME=null
# MAIL_PASSWORD=null
# MAIL_FROM_ADDRESS=hello@example.com
# MAIL_FROM_NAME="${APP_NAME}"

# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=us-east-1
# AWS_BUCKET=
# AWS_USE_PATH_STYLE_ENDPOINT=false

# VITE_APP_NAME="${APP_NAME}"

# ========== ABSENSI SECURITY ==========
ABSENSI_MAX_GPS_ACCURACY=80
PROXYCHECK_API_KEY=
ANTI_VPN_FAIL_MODE=allow
```
