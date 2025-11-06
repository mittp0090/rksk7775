// 관리자 로그인 JavaScript - Firebase 버전

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // 이미 로그인된 경우 체크
    checkAuthStatus();

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // 로그인 버튼 비활성화
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '로그인 중...';

        try {
            // Firebase Authentication으로 로그인
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 관리자 권한 확인
            const adminDoc = await db.collection('admins').doc(user.uid).get();

            if (!adminDoc.exists) {
                // 관리자가 아닌 경우
                await auth.signOut();
                showError('관리자 권한이 없습니다.');
                submitBtn.disabled = false;
                submitBtn.textContent = '로그인';
                return;
            }

            // 로그인 성공
            if (rememberMe) {
                // Firebase는 기본적으로 세션을 유지하므로 persistence 설정
                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            } else {
                await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
            }

            // 대시보드로 리다이렉트
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Login error:', error);

            // Firebase 에러 메시지 변환
            let errorMsg = '로그인에 실패했습니다.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMsg = '이메일 또는 비밀번호가 올바르지 않습니다.';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = '올바른 이메일 형식이 아닙니다.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMsg = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
            }

            showError(errorMsg);
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

    function checkAuthStatus() {
        auth.onAuthStateChanged(async function(user) {
            if (user) {
                // 관리자 권한 확인
                const adminDoc = await db.collection('admins').doc(user.uid).get();
                if (adminDoc.exists) {
                    // 이미 로그인된 관리자
                    window.location.href = 'dashboard.html';
                }
            }
        });
    }
});
