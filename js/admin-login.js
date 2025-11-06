// 관리자 로그인 JavaScript - API 연동 버전

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // 이미 로그인된 경우 체크
    checkAuthStatus();

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // 로그인 버튼 비활성화
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '로그인 중...';

        try {
            const response = await fetch('../api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // 로그인 성공
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // 대시보드로 리다이렉트
                window.location.href = 'dashboard.html';
            } else {
                // 로그인 실패
                showError(data.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('서버 연결에 실패했습니다.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '로그인';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        setTimeout(function() {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    async function checkAuthStatus() {
        try {
            const response = await fetch('../api/auth/check.php');
            const data = await response.json();

            if (data.success) {
                // 이미 로그인된 경우
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
});
