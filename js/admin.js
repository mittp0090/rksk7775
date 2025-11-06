// 관리자 공통 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    checkAdminLogin();

    // 사용자 이름 표시
    displayAdminUsername();

    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

function checkAdminLogin() {
    // 로그인 페이지가 아닌 경우에만 체크
    if (!window.location.pathname.includes('login.html')) {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');

        if (isLoggedIn !== 'true') {
            // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
            window.location.href = 'login.html';
        }
    }
}

function displayAdminUsername() {
    const usernameElement = document.getElementById('adminUsername');
    if (usernameElement) {
        const username = localStorage.getItem('adminUsername') || '관리자';
        usernameElement.textContent = username;
    }
}

function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        window.location.href = 'login.html';
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
