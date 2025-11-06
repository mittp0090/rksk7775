// 관리자 로그인 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // 이미 로그인된 경우 대시보드로 리다이렉트
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // 실제 프로덕션에서는 서버로 인증 요청을 보내야 합니다
        // 여기서는 데모를 위한 간단한 로그인 체크
        if (username === 'admin' && password === 'admin123') {
            // 로그인 성공
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            // 대시보드로 리다이렉트
            window.location.href = 'dashboard.html';
        } else {
            // 로그인 실패
            errorMessage.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
            errorMessage.style.display = 'block';

            // 3초 후 에러 메시지 숨김
            setTimeout(function() {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
});
