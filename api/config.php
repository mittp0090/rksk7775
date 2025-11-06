<?php
/**
 * 데이터베이스 및 애플리케이션 설정
 * 실제 운영 시 아래 값들을 수정하세요
 */

// 에러 리포팅 설정 (운영 환경에서는 0으로 설정)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 데이터베이스 설정
define('DB_HOST', 'localhost');
define('DB_NAME', 'shinyoungsoo_snap');
define('DB_USER', 'root');  // 실제 운영 시 변경 필수
define('DB_PASS', '');      // 실제 운영 시 변경 필수
define('DB_CHARSET', 'utf8mb4');

// 애플리케이션 설정
define('SITE_URL', 'http://localhost');  // 실제 도메인으로 변경
define('UPLOAD_DIR', '../uploads/');
define('MAX_FILE_SIZE', 10485760);  // 10MB

// 세션 설정
define('SESSION_LIFETIME', 3600 * 24);  // 24시간
ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
session_set_cookie_params(SESSION_LIFETIME);

// 보안 설정
define('PASSWORD_MIN_LENGTH', 8);
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_VIDEO_TYPES', ['video/mp4', 'video/webm']);

// 데이터베이스 연결
class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            die(json_encode(['success' => false, 'message' => '데이터베이스 연결 실패']));
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}

// 세션 시작
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS 설정 (필요한 경우)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 유틸리티 함수
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function generate_unique_filename($original_filename) {
    $extension = strtolower(pathinfo($original_filename, PATHINFO_EXTENSION));
    return uniqid() . '_' . time() . '.' . $extension;
}

function validate_image($file) {
    if (!in_array($file['type'], ALLOWED_IMAGE_TYPES)) {
        return ['valid' => false, 'message' => '허용되지 않은 파일 형식입니다.'];
    }

    if ($file['size'] > MAX_FILE_SIZE) {
        return ['valid' => false, 'message' => '파일 크기가 너무 큽니다. (최대 10MB)'];
    }

    return ['valid' => true];
}

function respond($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

function check_admin_auth() {
    if (!isset($_SESSION['admin_id']) || !isset($_SESSION['admin_username'])) {
        respond(false, '인증이 필요합니다.');
    }
}

function log_activity($admin_id, $action, $entity_type = null, $entity_id = null, $description = null) {
    try {
        $db = Database::getInstance()->getConnection();
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;

        $stmt = $db->prepare("
            INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, description, ip_address)
            VALUES (:admin_id, :action, :entity_type, :entity_id, :description, :ip_address)
        ");

        $stmt->execute([
            ':admin_id' => $admin_id,
            ':action' => $action,
            ':entity_type' => $entity_type,
            ':entity_id' => $entity_id,
            ':description' => $description,
            ':ip_address' => $ip
        ]);
    } catch (PDOException $e) {
        error_log("Activity log error: " . $e->getMessage());
    }
}
