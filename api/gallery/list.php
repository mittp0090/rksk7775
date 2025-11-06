<?php
require_once '../config.php';

// GET 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(false, '잘못된 요청입니다.');
}

$category = isset($_GET['category']) ? sanitize_input($_GET['category']) : 'all';
$visible_only = isset($_GET['visible_only']) ? (bool)$_GET['visible_only'] : true;

try {
    $db = Database::getInstance()->getConnection();

    // 쿼리 작성
    $sql = "SELECT id, category, image_path, thumbnail_path, title, description, alt_text, display_order, is_visible, created_at
            FROM gallery
            WHERE 1=1";

    $params = [];

    if ($category !== 'all') {
        $sql .= " AND category = :category";
        $params[':category'] = $category;
    }

    if ($visible_only) {
        $sql .= " AND is_visible = 1";
    }

    $sql .= " ORDER BY display_order ASC, created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $images = $stmt->fetchAll();

    respond(true, '갤러리 목록 조회 성공', [
        'images' => $images,
        'count' => count($images)
    ]);

} catch (PDOException $e) {
    error_log("Gallery list error: " . $e->getMessage());
    respond(false, '갤러리 목록 조회 실패');
}
