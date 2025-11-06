<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, '잘못된 요청입니다.');
}

// 입력 데이터 받기
$input = json_decode(file_get_contents('php://input'), true);
$username = sanitize_input($input['username'] ?? '');
$password = $input['password'] ?? '';

// 유효성 검사
if (empty($username) || empty($password)) {
    respond(false, '아이디와 비밀번호를 입력해주세요.');
}

try {
    $db = Database::getInstance()->getConnection();

    // 사용자 조회
    $stmt = $db->prepare("
        SELECT id, username, password, email, status
        FROM admins
        WHERE username = :username AND status = 'active'
    ");

    $stmt->execute([':username' => $username]);
    $admin = $stmt->fetch();

    if (!$admin) {
        respond(false, '아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 검증
    if (!password_verify($password, $admin['password'])) {
        respond(false, '아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 세션 설정
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_username'] = $admin['username'];
    $_SESSION['admin_email'] = $admin['email'];
    $_SESSION['login_time'] = time();

    // 마지막 로그인 시간 업데이트
    $updateStmt = $db->prepare("UPDATE admins SET last_login = NOW() WHERE id = :id");
    $updateStmt->execute([':id' => $admin['id']]);

    // 활동 로그
    log_activity($admin['id'], 'login', null, null, '관리자 로그인');

    respond(true, '로그인 성공', [
        'username' => $admin['username'],
        'email' => $admin['email']
    ]);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    respond(false, '로그인 처리 중 오류가 발생했습니다.');
}
