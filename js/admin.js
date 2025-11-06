// 관리자 공통 JavaScript - API 연동 버전

document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    checkAdminLogin();

    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function checkAdminLogin() {
    // 로그인 페이지가 아닌 경우에만 체크
    if (!window.location.pathname.includes('login.html')) {
        try {
            const response = await fetch('../api/auth/check.php');
            const data = await response.json();

            if (!data.success) {
                // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
                window.location.href = 'login.html';
            } else {
                // 사용자 정보 표시
                displayAdminUsername(data.data.username);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = 'login.html';
        }
    }
}

function displayAdminUsername(username) {
    const usernameElement = document.getElementById('adminUsername');
    if (usernameElement) {
        usernameElement.textContent = username || '관리자';
    }
}

async function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        try {
            const response = await fetch('../api/auth/logout.php', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = 'login.html';
            } else {
                alert('로그아웃 실패');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('서버 연결에 실패했습니다.');
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
