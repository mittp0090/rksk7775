<?php
require_once '../config.php';

// 관리자 인증 확인
check_admin_auth();

// DELETE 요청 처리
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    respond(false, '잘못된 요청입니다.');
}

$input = json_decode(file_get_contents('php://input'), true);
$image_id = intval($input['id'] ?? 0);

if ($image_id <= 0) {
    respond(false, '유효하지 않은 이미지 ID입니다.');
}

try {
    $db = Database::getInstance()->getConnection();

    // 이미지 정보 조회
    $stmt = $db->prepare("SELECT image_path FROM gallery WHERE id = :id");
    $stmt->execute([':id' => $image_id]);
    $image = $stmt->fetch();

    if (!$image) {
        respond(false, '이미지를 찾을 수 없습니다.');
    }

    // 파일 삭제
    $file_path = '../' . $image['image_path'];
    if (file_exists($file_path)) {
        unlink($file_path);
    }

    // 데이터베이스에서 삭제
    $deleteStmt = $db->prepare("DELETE FROM gallery WHERE id = :id");
    $deleteStmt->execute([':id' => $image_id]);

    // 활동 로그
    log_activity(
        $_SESSION['admin_id'],
        'gallery_delete',
        'gallery',
        $image_id,
        "이미지 삭제: {$image['image_path']}"
    );

    respond(true, '이미지가 삭제되었습니다.');

} catch (PDOException $e) {
    error_log("Gallery delete error: " . $e->getMessage());
    respond(false, '이미지 삭제 중 오류가 발생했습니다.');
}
