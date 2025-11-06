// 갤러리 관리 JavaScript - API 연동 버전

document.addEventListener('DOMContentLoaded', function() {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');

    // 갤러리 목록 로드
    loadGalleryItems();

    // 업로드 버튼 클릭
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            uploadModal.style.display = 'flex';
        });
    }

    // 모달 닫기
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            uploadModal.style.display = 'none';
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', function() {
            uploadModal.style.display = 'none';
        });
    }

    // 모달 외부 클릭 시 닫기
    if (uploadModal) {
        uploadModal.addEventListener('click', function(e) {
            if (e.target === uploadModal) {
                uploadModal.style.display = 'none';
            }
        });
    }

    // 업로드 폼 제출
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const imageFiles = document.getElementById('imageFile').files;
            const imageCategory = document.getElementById('imageCategory').value;
            const imageDescription = document.getElementById('imageDescription').value;

            if (imageFiles.length === 0) {
                alert('이미지를 선택해주세요.');
                return;
            }

            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = '업로드 중...';

            try {
                const formData = new FormData();

                // 여러 파일 추가
                for (let i = 0; i < imageFiles.length; i++) {
                    formData.append('images[]', imageFiles[i]);
                }

                formData.append('category', imageCategory);
                formData.append('description', imageDescription);

                const response = await fetch('../api/gallery/upload.php', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    alert(data.message);
                    uploadForm.reset();
                    uploadModal.style.display = 'none';
                    loadGalleryItems(); // 목록 새로고침
                } else {
                    alert(data.message || '업로드 실패');
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('서버 연결에 실패했습니다.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '업로드';
            }
        });
    }
});

// 갤러리 목록 로드
async function loadGalleryItems(category = 'all') {
    try {
        const response = await fetch(`../api/gallery/list.php?category=${category}&visible_only=false`);
        const data = await response.json();

        if (data.success) {
            displayGalleryItems(data.data.images);
        }
    } catch (error) {
        console.error('Load gallery error:', error);
    }
}

// 갤러리 아이템 표시
function displayGalleryItems(images) {
    const galleryGrid = document.querySelector('.admin-gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'admin-gallery-item';
        item.setAttribute('data-category', image.category);
        item.setAttribute('data-id', image.id);

        item.innerHTML = `
            <img src="../${image.image_path}" alt="${image.alt_text || ''}">
            <div class="admin-gallery-overlay">
                <button class="btn-icon edit-btn" title="수정" data-id="${image.id}">✏️</button>
                <button class="btn-icon delete-btn" title="삭제" data-id="${image.id}">🗑️</button>
            </div>
            <div class="admin-gallery-info">
                <span class="category-tag">${image.category}</span>
            </div>
        `;

        galleryGrid.appendChild(item);
    });

    // 이벤트 리스너 재등록
    attachGalleryEventListeners();
}

// 갤러리 이벤트 리스너
function attachGalleryEventListeners() {
    // 삭제 버튼
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();

            if (confirm('이 이미지를 삭제하시겠습니까?')) {
                const imageId = this.getAttribute('data-id');

                try {
                    const response = await fetch('../api/gallery/delete.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: imageId })
                    });

                    const data = await response.json();

                    if (data.success) {
                        alert('이미지가 삭제되었습니다.');
                        loadGalleryItems(); // 목록 새로고침
                    } else {
                        alert(data.message || '삭제 실패');
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('서버 연결에 실패했습니다.');
                }
            }
        });
    });

    // 수정 버튼
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            alert('이미지 수정 기능은 개발 중입니다.');
        });
    });
}
