<?php
require_once '../config.php';

// 관리자 인증 확인
check_admin_auth();

// POST 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, '잘못된 요청입니다.');
}

// 카테고리 확인
$category = sanitize_input($_POST['category'] ?? '');
$title = sanitize_input($_POST['title'] ?? '');
$description = sanitize_input($_POST['description'] ?? '');

if (empty($category)) {
    respond(false, '카테고리를 선택해주세요.');
}

// 파일 업로드 확인
if (!isset($_FILES['images']) || empty($_FILES['images']['name'][0])) {
    respond(false, '이미지를 선택해주세요.');
}

$uploaded_files = [];
$errors = [];

try {
    $db = Database::getInstance()->getConnection();
    $upload_dir = UPLOAD_DIR . 'gallery/';

    // 디렉토리 생성
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // 여러 파일 처리
    $file_count = count($_FILES['images']['name']);

    for ($i = 0; $i < $file_count; $i++) {
        $file = [
            'name' => $_FILES['images']['name'][$i],
            'type' => $_FILES['images']['type'][$i],
            'tmp_name' => $_FILES['images']['tmp_name'][$i],
            'error' => $_FILES['images']['error'][$i],
            'size' => $_FILES['images']['size'][$i]
        ];

        // 파일 오류 확인
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = $file['name'] . ': 업로드 오류';
            continue;
        }

        // 파일 유효성 검사
        $validation = validate_image($file);
        if (!$validation['valid']) {
            $errors[] = $file['name'] . ': ' . $validation['message'];
            continue;
        }

        // 파일명 생성
        $new_filename = generate_unique_filename($file['name']);
        $file_path = $upload_dir . $new_filename;

        // 파일 이동
        if (move_uploaded_file($file['tmp_name'], $file_path)) {
            // 데이터베이스에 저장
            $stmt = $db->prepare("
                INSERT INTO gallery (category, image_path, title, description)
                VALUES (:category, :image_path, :title, :description)
            ");

            $stmt->execute([
                ':category' => $category,
                ':image_path' => 'uploads/gallery/' . $new_filename,
                ':title' => $title,
                ':description' => $description
            ]);

            $image_id = $db->lastInsertId();
            $uploaded_files[] = [
                'id' => $image_id,
                'filename' => $new_filename,
                'path' => 'uploads/gallery/' . $new_filename
            ];

            // 활동 로그
            log_activity(
                $_SESSION['admin_id'],
                'gallery_upload',
                'gallery',
                $image_id,
                "이미지 업로드: {$file['name']}"
            );
        } else {
            $errors[] = $file['name'] . ': 파일 저장 실패';
        }
    }

    if (count($uploaded_files) > 0) {
        respond(true, count($uploaded_files) . '개 이미지 업로드 성공', [
            'uploaded' => $uploaded_files,
            'errors' => $errors
        ]);
    } else {
        respond(false, '이미지 업로드 실패', ['errors' => $errors]);
    }

} catch (PDOException $e) {
    error_log("Gallery upload error: " . $e->getMessage());
    respond(false, '이미지 업로드 중 오류가 발생했습니다.');
}
