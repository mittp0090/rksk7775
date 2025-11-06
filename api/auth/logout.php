<?php
require_once '../config.php';

// 활동 로그
if (isset($_SESSION['admin_id'])) {
    log_activity($_SESSION['admin_id'], 'logout', null, null, '관리자 로그아웃');
}

// 세션 종료
session_unset();
session_destroy();

// 세션 쿠키 삭제
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

respond(true, '로그아웃 되었습니다.');
