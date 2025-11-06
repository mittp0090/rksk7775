// 관리자 공통 JavaScript - Firebase 버전

document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    checkAdminLogin();

    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

function checkAdminLogin() {
    // 로그인 페이지가 아닌 경우에만 체크
    if (!window.location.pathname.includes('login.html')) {
        auth.onAuthStateChanged(async function(user) {
            if (!user) {
                // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
                window.location.href = 'login.html';
                return;
            }

            try {
                // 관리자 권한 확인
                const adminDoc = await db.collection('admins').doc(user.uid).get();

                if (!adminDoc.exists) {
                    // 관리자가 아닌 경우
                    await auth.signOut();
                    window.location.href = 'login.html';
                    return;
                }

                // 사용자 정보 표시
                const adminData = adminDoc.data();
                displayAdminUsername(adminData.email || user.email);
            } catch (error) {
                console.error('Auth check error:', error);
                window.location.href = 'login.html';
            }
        });
    }
}

function displayAdminUsername(email) {
    const usernameElement = document.getElementById('adminUsername');
    if (usernameElement) {
        // 이메일에서 @앞부분만 표시 또는 전체 이메일 표시
        const displayName = email.split('@')[0];
        usernameElement.textContent = displayName || '관리자';
    }
}

async function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        try {
            await auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('로그아웃에 실패했습니다.');
        }
    }
}

// 필터 버튼 기능
function initFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 버튼에서 active 제거
            filterBtns.forEach(b => b.classList.remove('active'));

            // 클릭한 버튼에 active 추가
            this.classList.add('active');

            // 필터 적용 로직 (실제로는 서버에서 데이터를 가져와야 함)
            const category = this.getAttribute('data-category');
            filterGalleryItems(category);
        });
    });
}

function filterGalleryItems(category) {
    const items = document.querySelectorAll('.admin-gallery-item');

    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 페이지 로드 시 필터 버튼 초기화
if (document.querySelector('.filter-btn')) {
    initFilterButtons();
}
