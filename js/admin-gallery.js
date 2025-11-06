// 갤러리 관리 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');

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
    uploadModal.addEventListener('click', function(e) {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
        }
    });

    // 업로드 폼 제출
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const imageFile = document.getElementById('imageFile').files;
            const imageCategory = document.getElementById('imageCategory').value;
            const imageDescription = document.getElementById('imageDescription').value;

            // 실제로는 서버로 파일을 업로드해야 합니다
            console.log('Upload:', {
                files: imageFile,
                category: imageCategory,
                description: imageDescription
            });

            alert(`${imageFile.length}개의 이미지가 업로드되었습니다.`);

            // 폼 초기화 및 모달 닫기
            uploadForm.reset();
            uploadModal.style.display = 'none';

            // 실제로는 갤러리 목록을 새로고침해야 합니다
        });
    }

    // 삭제 버튼
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();

            if (confirm('이 이미지를 삭제하시겠습니까?')) {
                const item = this.closest('.admin-gallery-item');
                item.remove();
                alert('이미지가 삭제되었습니다.');
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
});
