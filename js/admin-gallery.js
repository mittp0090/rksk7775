// 갤러리 관리 JavaScript - Firebase 버전

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
                // 여러 파일 업로드
                const uploadPromises = [];

                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i];
                    const uploadPromise = uploadImageToFirebase(file, imageCategory, imageDescription);
                    uploadPromises.push(uploadPromise);
                }

                await Promise.all(uploadPromises);

                alert(`${imageFiles.length}개의 이미지가 업로드되었습니다.`);
                uploadForm.reset();
                uploadModal.style.display = 'none';
                loadGalleryItems(); // 목록 새로고침
            } catch (error) {
                console.error('Upload error:', error);
                alert('업로드에 실패했습니다: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '업로드';
            }
        });
    }
});

// Firebase Storage에 이미지 업로드 및 Firestore에 메타데이터 저장
async function uploadImageToFirebase(file, category, description) {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = storage.ref(`gallery/${category}/${fileName}`);

    // Storage에 업로드
    const uploadTask = await storageRef.put(file);

    // 다운로드 URL 가져오기
    const downloadURL = await uploadTask.ref.getDownloadURL();

    // Firestore에 메타데이터 저장
    await db.collection('gallery').add({
        category: category,
        description: description || '',
        image_url: downloadURL,
        storage_path: `gallery/${category}/${fileName}`,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        visible: true
    });

    return downloadURL;
}

// 갤러리 목록 로드
async function loadGalleryItems(category = 'all') {
    try {
        let query = db.collection('gallery');

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
    }
}

// 갤러리 아이템 표시
function displayGalleryItems(images) {
    const galleryGrid = document.querySelector('.admin-gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    if (images.length === 0) {
        galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">등록된 이미지가 없습니다.</p>';
        return;
    }

    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'admin-gallery-item';
        item.setAttribute('data-category', image.category);
        item.setAttribute('data-id', image.id);

        item.innerHTML = `
            <img src="${image.image_url}" alt="${image.description || ''}" onerror="this.src='https://via.placeholder.com/300?text=Error'">
            <div class="admin-gallery-overlay">
                <button class="btn-icon edit-btn" title="수정" data-id="${image.id}">✏️</button>
                <button class="btn-icon delete-btn" title="삭제" data-id="${image.id}" data-path="${image.storage_path}">🗑️</button>
            </div>
            <div class="admin-gallery-info">
                <span class="category-tag">${getCategoryDisplayName(image.category)}</span>
            </div>
        `;

        galleryGrid.appendChild(item);
    });

    // 이벤트 리스너 재등록
    attachGalleryEventListeners();
}

// 카테고리 표시 이름 변환
function getCategoryDisplayName(category) {
    const categoryNames = {
        'wedding-ceremony': 'Wedding Ceremony',
        'prewedding': 'PreWedding',
        'body-profile': 'Body Profile',
        'profile': 'Profile',
        'hanbok': 'Hanbok',
        'etc': 'etc.'
    };
    return categoryNames[category] || category;
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
                const storagePath = this.getAttribute('data-path');

                try {
                    // Storage에서 이미지 삭제
                    if (storagePath) {
                        const storageRef = storage.ref(storagePath);
                        await storageRef.delete();
                    }

                    // Firestore에서 메타데이터 삭제
                    await db.collection('gallery').doc(imageId).delete();

                    alert('이미지가 삭제되었습니다.');
                    loadGalleryItems(); // 목록 새로고침
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('삭제에 실패했습니다: ' + error.message);
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
