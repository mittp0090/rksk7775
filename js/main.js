// DOM 요소 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 햄버거 메뉴 토글
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');

            // 애니메이션 효과
            const spans = hamburger.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // 갤러리 카테고리 버튼
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 버튼에서 active 클래스 제거
            categoryBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 클래스 추가
            this.classList.add('active');

            // 카테고리 필터링
            const category = this.getAttribute('data-category');
            loadGalleryItems(category);
        });
    });

    // 갤러리 아이템 로드
    loadGalleryItems();

    // 네비게이션 메뉴 클릭 시 스무스 스크롤
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // 모바일에서 메뉴 닫기
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const spans = hamburger.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
    });

    // 스크롤 시 헤더 스타일 변경
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }

        lastScroll = currentScroll;
    });

    // 폼 제출 처리
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 폼 데이터 수집
            const formData = new FormData(contactForm);
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;

            // 여기에 실제 폼 제출 로직을 추가할 수 있습니다
            // 예: fetch API를 사용하여 서버로 전송

            // 임시로 알림 표시
            alert(`메시지가 전송되었습니다!\n\n이름: ${name}\n이메일: ${email}\n메시지: ${message}`);

            // 폼 초기화
            contactForm.reset();
        });
    }

    // CTA 버튼 클릭 이벤트
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // 스크롤 애니메이션 (요소가 뷰포트에 들어올 때)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 애니메이션을 적용할 요소들
    const animateElements = document.querySelectorAll('.gallery-item, .video-item, .product-item, .faq-item, .instagram-item, .blog-post');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // 현재 섹션 하이라이트 (네비게이션)
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

// 갤러리 아이템 로드 함수
async function loadGalleryItems(category = 'all') {
    try {
        let query = db.collection('gallery').where('visible', '==', true);

        // 카테고리 필터
        if (category !== 'all') {
            query = query.where('category', '==', category);
        }

        // 최신순 정렬
        query = query.orderBy('created_at', 'desc');

        const snapshot = await query.get();
        const images = [];

        snapshot.forEach(doc => {
            images.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayGalleryItems(images);
    } catch (error) {
        console.error('Load gallery error:', error);
        // 에러 발생 시 빈 배열로 표시
        displayGalleryItems([]);
    }
}

// 갤러리 아이템 표시
function displayGalleryItems(images) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    if (images.length === 0) {
        galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">등록된 이미지가 없습니다.</p>';
        return;
    }

    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-category', image.category);

        const img = document.createElement('img');
        img.src = image.image_url;
        img.alt = image.description || '';
        img.loading = 'lazy'; // 지연 로딩
        img.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23ddd" width="300" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
        };

        item.appendChild(img);
        galleryGrid.appendChild(item);

        // 스크롤 애니메이션 적용
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        // IntersectionObserver 적용
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        observer.observe(item);
    });
}

// 페이지 로드 애니메이션
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    setTimeout(function() {
        document.body.style.opacity = '1';
    }, 100);
});
