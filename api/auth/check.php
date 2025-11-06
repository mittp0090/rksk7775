<?php
require_once '../config.php';

if (isset($_SESSION['admin_id']) && isset($_SESSION['admin_username'])) {
    respond(true, '인증됨', [
        'username' => $_SESSION['admin_username'],
        'email' => $_SESSION['admin_email'] ?? null
    ]);
} else {
    respond(false, '인증되지 않음');
}
