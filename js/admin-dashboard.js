// 관리자 대시보드 JavaScript - Firebase 버전

document.addEventListener('DOMContentLoaded', function() {
    // 통계 로드
    loadStatistics();
});

// 통계 데이터 로드
async function loadStatistics() {
    try {
        // 갤러리 이미지 개수
        const gallerySnapshot = await db.collection('gallery').get();
        updateStatCard(0, gallerySnapshot.size);

        // 웨딩 무비 개수 (컬렉션이 있는 경우)
        try {
            const moviesSnapshot = await db.collection('wedding_movies').get();
            updateStatCard(1, moviesSnapshot.size);
        } catch (error) {
            updateStatCard(1, 0);
        }

        // 제품 개수 (컬렉션이 있는 경우)
        try {
            const productsSnapshot = await db.collection('products').get();
            updateStatCard(2, productsSnapshot.size);
        } catch (error) {
            updateStatCard(2, 0);
        }

        // 블로그 포스트 개수 (컬렉션이 있는 경우)
        try {
            const blogSnapshot = await db.collection('blog_posts').get();
            updateStatCard(3, blogSnapshot.size);
        } catch (error) {
            updateStatCard(3, 0);
        }

        // 카테고리별 통계도 로드
        await loadCategoryStatistics();
    } catch (error) {
        console.error('Load statistics error:', error);
    }
}

// 통계 카드 업데이트
function updateStatCard(index, count) {
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    if (statCards[index]) {
        // 애니메이션 효과와 함께 숫자 업데이트
        animateCount(statCards[index], 0, count, 1000);
    }
}

// 숫자 카운트 애니메이션
function animateCount(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(function() {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// 카테고리별 통계 로드
async function loadCategoryStatistics() {
    try {
        const gallerySnapshot = await db.collection('gallery').get();
        const categoryStats = {};

        gallerySnapshot.forEach(doc => {
            const category = doc.data().category || 'etc';
            categoryStats[category] = (categoryStats[category] || 0) + 1;
        });

        // 카테고리 통계를 콘솔에 출력 (나중에 UI에 표시 가능)
        console.log('카테고리별 통계:', categoryStats);

        // 카테고리 통계를 대시보드에 추가할 수 있습니다
        displayCategoryStats(categoryStats);
    } catch (error) {
        console.error('Load category statistics error:', error);
    }
}

// 카테고리 통계 표시
function displayCategoryStats(stats) {
    const categoryNames = {
        'wedding-ceremony': 'Wedding Ceremony',
        'prewedding': 'PreWedding',
        'body-profile': 'Body Profile',
        'profile': 'Profile',
        'hanbok': 'Hanbok',
        'etc': 'etc.'
    };

    // 카테고리 통계 섹션이 있다면 업데이트
    const categorySection = document.querySelector('.category-stats');
    if (categorySection) {
        let html = '<h4>카테고리별 이미지 개수</h4><ul class="category-list">';

        for (const [category, count] of Object.entries(stats)) {
            const displayName = categoryNames[category] || category;
            html += `
                <li class="category-stat-item">
                    <span class="category-name">${displayName}</span>
                    <span class="category-count">${count}</span>
                </li>
            `;
        }

        html += '</ul>';
        categorySection.innerHTML = html;
    } else {
        // 카테고리 통계 섹션이 없으면 새로 생성
        const adminMain = document.querySelector('.admin-main');
        const categorySection = document.createElement('div');
        categorySection.className = 'admin-section category-stats';

        let html = '<h3>카테고리별 통계</h3><ul class="category-list">';

        for (const [category, count] of Object.entries(stats)) {
            const displayName = categoryNames[category] || category;
            html += `
                <li class="category-stat-item">
                    <span class="category-name">${displayName}</span>
                    <span class="category-count">${count}</span>
                </li>
            `;
        }

        html += '</ul>';
        categorySection.innerHTML = html;

        // 통계 카드 다음에 삽입
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid && statsGrid.nextSibling) {
            statsGrid.parentNode.insertBefore(categorySection, statsGrid.nextSibling);
        } else {
            adminMain.appendChild(categorySection);
        }
    }
}

// 최근 활동 로드 (실제 데이터 사용)
async function loadRecentActivity() {
    try {
        // 갤러리에서 최근 추가된 이미지
        const recentGallery = await db.collection('gallery')
            .orderBy('created_at', 'desc')
            .limit(5)
            .get();

        const activities = [];

        recentGallery.forEach(doc => {
            const data = doc.data();
            const createdAt = data.created_at?.toDate();
            if (createdAt) {
                activities.push({
                    time: createdAt,
                    description: `갤러리에 새 이미지 추가됨 (${data.category})`
                });
            }
        });

        // 최신순 정렬
        activities.sort((a, b) => b.time - a.time);

        // 활동 목록 업데이트
        displayActivities(activities.slice(0, 5));
    } catch (error) {
        console.error('Load recent activity error:', error);
    }
}

// 활동 목록 표시
function displayActivities(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">최근 활동이 없습니다.</p>';
        return;
    }

    activityList.innerHTML = '';

    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';

        const timeAgo = getTimeAgo(activity.time);

        item.innerHTML = `
            <span class="activity-time">${timeAgo}</span>
            <span class="activity-desc">${activity.description}</span>
        `;

        activityList.appendChild(item);
    });
}

// 시간 차이 계산
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
}

// 페이지 로드 시 최근 활동도 로드
document.addEventListener('DOMContentLoaded', function() {
    loadRecentActivity();
});
