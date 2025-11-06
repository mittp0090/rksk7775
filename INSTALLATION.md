# 신영수스냅 - 설치 가이드

## 시스템 요구사항

- **웹 서버**: Apache 2.4 이상 (mod_rewrite 활성화)
- **PHP**: 7.4 이상
- **MySQL**: 5.7 이상 또는 MariaDB 10.2 이상
- **확장모듈**: PDO, PDO_MySQL, GD (이미지 처리용)

## 설치 단계

### 1. 데이터베이스 설정

MySQL/MariaDB에 접속하여 데이터베이스를 생성합니다:

```bash
mysql -u root -p
```

`database.sql` 파일을 실행합니다:

```bash
mysql -u root -p < database.sql
```

또는 phpMyAdmin을 사용하는 경우:
1. phpMyAdmin에 로그인
2. "Import" 탭 선택
3. `database.sql` 파일 업로드 및 실행

### 2. 데이터베이스 사용자 생성 (선택사항)

보안을 위해 별도의 데이터베이스 사용자를 생성하는 것을 권장합니다:

```sql
CREATE USER 'shinyoungsoo'@'localhost' IDENTIFIED BY '강력한비밀번호';
GRANT ALL PRIVILEGES ON shinyoungsoo_snap.* TO 'shinyoungsoo'@'localhost';
FLUSH PRIVILEGES;
```

### 3. PHP 설정 파일 수정

`api/config.php` 파일을 열어 데이터베이스 연결 정보를 수정합니다:

```php
// 데이터베이스 설정
define('DB_HOST', 'localhost');
define('DB_NAME', 'shinyoungsoo_snap');
define('DB_USER', 'shinyoungsoo');  // 생성한 사용자명
define('DB_PASS', '강력한비밀번호');  // 생성한 비밀번호

// 사이트 URL 설정
define('SITE_URL', 'https://yourdomain.com');  // 실제 도메인으로 변경
```

### 4. 디렉토리 권한 설정

uploads 디렉토리에 쓰기 권한을 부여합니다:

```bash
chmod -R 755 uploads/
chown -R www-data:www-data uploads/
```

### 5. Apache 설정

`.htaccess` 파일이 작동하도록 Apache 설정을 확인합니다.

`/etc/apache2/sites-available/000-default.conf` (또는 해당 사이트 설정 파일):

```apache
<Directory /var/www/html>
    AllowOverride All
    Require all granted
</Directory>
```

mod_rewrite 활성화:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 6. PHP 확장모듈 확인

필요한 PHP 확장모듈이 설치되어 있는지 확인합니다:

```bash
php -m | grep -E "pdo|pdo_mysql|gd"
```

없는 경우 설치:

```bash
# Ubuntu/Debian
sudo apt-get install php-mysql php-gd

# CentOS/RHEL
sudo yum install php-mysql php-gd

# 설치 후 Apache 재시작
sudo systemctl restart apache2
```

### 7. 파일 업로드

FTP 또는 SSH를 통해 모든 파일을 웹 서버의 문서 루트에 업로드합니다:

```bash
# SCP 예제
scp -r ./* user@server:/var/www/html/
```

### 8. SSL 인증서 설정 (권장)

Let's Encrypt를 사용한 무료 SSL 인증서 설치:

```bash
sudo apt-get install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com
```

`.htaccess` 파일에서 HTTPS 강제 리다이렉트 주석 해제:

```apache
# HTTPS 강제 (SSL 인증서 설치 후 활성화)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 기본 관리자 계정

설치 후 다음 계정으로 로그인할 수 있습니다:

- **URL**: `https://yourdomain.com/admin/login.html`
- **아이디**: `admin`
- **비밀번호**: `admin123`

⚠️ **보안 경고**: 첫 로그인 후 반드시 비밀번호를 변경하세요!

### 비밀번호 변경 방법

MySQL에 접속하여 다음 쿼리를 실행합니다:

```sql
USE shinyoungsoo_snap;

-- 새 비밀번호 생성 (예: 'mynewpassword')
UPDATE admins
SET password = '$2y$10$새로운해시값'
WHERE username = 'admin';
```

PHP를 사용하여 비밀번호 해시 생성:

```php
<?php
echo password_hash('mynewpassword', PASSWORD_DEFAULT);
?>
```

## 디렉토리 구조

```
/
├── admin/                  # 관리자 페이지
│   ├── login.html
│   ├── dashboard.html
│   └── gallery.html
├── api/                    # PHP API
│   ├── config.php
│   ├── auth/
│   └── gallery/
├── css/                    # 스타일시트
│   ├── styles.css
│   └── admin.css
├── js/                     # JavaScript
│   ├── main.js
│   ├── admin.js
│   └── admin-gallery.js
├── uploads/                # 업로드 파일 저장소
│   ├── gallery/
│   ├── wedding-movie/
│   ├── product/
│   └── blog/
├── index.html             # 메인 페이지
├── database.sql           # 데이터베이스 스키마
└── .htaccess             # Apache 설정

```

## 문제 해결

### 1. 500 Internal Server Error

- `.htaccess` 파일 권한 확인: `chmod 644 .htaccess`
- Apache 에러 로그 확인: `tail -f /var/log/apache2/error.log`
- mod_rewrite 활성화 확인

### 2. 이미지 업로드 실패

- `uploads/` 디렉토리 권한 확인
- PHP `upload_max_filesize` 설정 확인
- PHP `post_max_size` 설정 확인

### 3. 데이터베이스 연결 오류

- `api/config.php`의 DB 설정 확인
- MySQL 서비스 실행 여부 확인: `sudo systemctl status mysql`
- 방화벽 설정 확인

### 4. CORS 오류

- `api/.htaccess`의 CORS 헤더 설정 확인
- 브라우저 개발자 도구 콘솔에서 에러 확인

## 보안 권장사항

1. **기본 비밀번호 즉시 변경**
2. **데이터베이스 사용자 권한 최소화**
3. **SSL 인증서 설치** (HTTPS)
4. **정기적인 백업** 수행
5. **PHP 버전 최신 유지**
6. **파일 업로드 크기 제한** 설정
7. **에러 리포팅 비활성화** (운영 환경)

운영 환경에서 `api/config.php`:

```php
error_reporting(0);
ini_set('display_errors', 0);
```

## 백업 방법

### 데이터베이스 백업

```bash
mysqldump -u root -p shinyoungsoo_snap > backup_$(date +%Y%m%d).sql
```

### 파일 백업

```bash
tar -czf backup_files_$(date +%Y%m%d).tar.gz uploads/
```

## 지원

문제가 발생하면 로그 파일을 확인하세요:

- Apache 에러 로그: `/var/log/apache2/error.log`
- PHP 에러 로그: `/var/log/php_errors.log`

---

## 라이센스

이 프로젝트는 신영수스냅의 소유입니다.
