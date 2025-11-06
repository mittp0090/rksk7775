# 신영수스냅 - Firebase 설정 및 배포 가이드

## 개요

이 프로젝트는 Firebase를 백엔드로 사용하여 GitHub Pages에 배포할 수 있도록 구성되어 있습니다.

### 사용하는 Firebase 서비스

- **Firebase Authentication**: 관리자 로그인
- **Cloud Firestore**: 갤러리 이미지 메타데이터 저장
- **Firebase Storage**: 이미지 파일 저장
- **Firebase Hosting** (선택사항): GitHub Pages 대신 사용 가능

---

## 1. Firebase 프로젝트 생성

### 1.1 Firebase Console 접속

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. Google 계정으로 로그인
3. "프로젝트 추가" 클릭

### 1.2 프로젝트 설정

1. 프로젝트 이름 입력 (예: `shinyoungsoo-snap`)
2. Google Analytics 사용 여부 선택 (선택사항)
3. 프로젝트 생성 완료

---

## 2. Firebase 웹 앱 등록

1. Firebase Console에서 프로젝트 선택
2. 프로젝트 개요 페이지에서 "웹" 아이콘 클릭 (`</>`)
3. 앱 닉네임 입력 (예: `shinyoungsoo-web`)
4. Firebase Hosting 설정은 나중에 선택 가능
5. "앱 등록" 클릭

### 2.1 Firebase 설정 정보 복사

앱 등록 후 표시되는 설정 정보를 복사합니다:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 2.2 설정 파일 업데이트

`firebase-config.js` 파일을 열어 위에서 복사한 설정 정보로 업데이트합니다:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---

## 3. Firebase Authentication 설정

### 3.1 이메일/비밀번호 인증 활성화

1. Firebase Console → "Authentication" 클릭
2. "시작하기" 클릭 (처음인 경우)
3. "Sign-in method" 탭 클릭
4. "이메일/비밀번호" 클릭하여 활성화
5. "사용 설정" 토글 ON
6. "저장" 클릭

### 3.2 관리자 계정 생성

1. "Users" 탭 클릭
2. "사용자 추가" 클릭
3. 이메일과 비밀번호 입력 (예: `admin@shinyoungsoo.com` / `your-secure-password`)
4. "사용자 추가" 클릭
5. 생성된 사용자의 **UID**를 복사해둡니다

---

## 4. Cloud Firestore 설정

### 4.1 Firestore 데이터베이스 생성

1. Firebase Console → "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **프로덕션 모드**로 시작 선택
4. 위치 선택 (아시아 태평양 지역 권장: `asia-northeast3` - 서울)
5. "사용 설정" 클릭

### 4.2 보안 규칙 설정

1. "규칙" 탭 클릭
2. 프로젝트의 `firestore.rules` 파일 내용을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 관리자 인증 함수
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // 관리자 컬렉션
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if false; // 수동으로만 생성 가능
    }

    // 갤러리 컬렉션
    match /gallery/{imageId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // 웨딩 무비 컬렉션
    match /wedding_movies/{movieId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // 제품 컬렉션
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // FAQ 컬렉션
    match /faqs/{faqId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // 블로그 컬렉션
    match /blog_posts/{postId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // 인스타그램 컬렉션
    match /instagram_posts/{postId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // 사이트 설정
    match /site_settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 활동 로그
    match /activity_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow update, delete: if false;
    }
  }
}
```

3. "게시" 클릭

### 4.3 관리자 문서 생성

1. "데이터" 탭 클릭
2. "컬렉션 시작" 클릭
3. 컬렉션 ID: `admins`
4. 문서 ID: **3.2에서 복사한 UID** 입력
5. 필드 추가:
   - 필드: `email`, 유형: string, 값: `admin@shinyoungsoo.com`
   - 필드: `created_at`, 유형: timestamp, 값: 현재 시간
6. "저장" 클릭

---

## 5. Firebase Storage 설정

### 5.1 Storage 시작

1. Firebase Console → "Storage" 클릭
2. "시작하기" 클릭
3. **프로덕션 모드**로 시작 선택
4. 위치는 Firestore와 동일하게 선택
5. "완료" 클릭

### 5.2 보안 규칙 설정

1. "Rules" 탭 클릭
2. 프로젝트의 `storage.rules` 파일 내용을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 관리자 인증 함수
    function isAdmin() {
      return request.auth != null &&
             firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data != null;
    }

    // 갤러리 이미지
    match /gallery/{category}/{filename} {
      allow read: if true;
      allow write: if isAdmin() &&
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }

    // 웨딩 무비 썸네일
    match /wedding_movies/{filename} {
      allow read: if true;
      allow write: if isAdmin() &&
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }

    // 제품 이미지
    match /products/{filename} {
      allow read: if true;
      allow write: if isAdmin() &&
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }

    // 블로그 이미지
    match /blog/{filename} {
      allow read: if true;
      allow write: if isAdmin() &&
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }

    // 인스타그램 이미지
    match /instagram/{filename} {
      allow read: if true;
      allow write: if isAdmin() &&
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

3. "게시" 클릭

---

## 6. GitHub Pages 배포

### 6.1 저장소 설정

1. GitHub에서 새 저장소 생성 (예: `shinyoungsoo-snap`)
2. 로컬 프로젝트를 저장소에 푸시:

```bash
git init
git add .
git commit -m "Initial commit with Firebase setup"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

### 6.2 GitHub Pages 활성화

1. GitHub 저장소 → Settings → Pages
2. Source: "Deploy from a branch" 선택
3. Branch: `main` / `/ (root)` 선택
4. "Save" 클릭
5. 몇 분 후 `https://USERNAME.github.io/REPOSITORY/` 에서 접속 가능

---

## 7. 테스트

### 7.1 관리자 로그인 테스트

1. `https://USERNAME.github.io/REPOSITORY/admin/login.html` 접속
2. 3.2에서 생성한 이메일과 비밀번호로 로그인
3. 대시보드로 이동되는지 확인

### 7.2 이미지 업로드 테스트

1. 관리자 페이지에서 "갤러리 관리" 클릭
2. "이미지 업로드" 클릭
3. 이미지 파일 선택 및 카테고리 선택
4. 업로드 후 갤러리에 표시되는지 확인

### 7.3 프론트엔드 테스트

1. `https://USERNAME.github.io/REPOSITORY/` 접속
2. 업로드한 이미지가 갤러리에 표시되는지 확인
3. 카테고리 필터링이 작동하는지 확인

---

## 8. 문제 해결

### 8.1 이미지 업로드 실패

**증상**: "업로드에 실패했습니다" 에러

**해결 방법**:
1. Firebase Console → Storage → Rules 확인
2. 관리자 문서가 Firestore에 올바르게 생성되었는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 8.2 로그인 실패

**증상**: "이메일 또는 비밀번호가 올바르지 않습니다" 에러

**해결 방법**:
1. Firebase Console → Authentication → Users에서 계정 확인
2. 이메일/비밀번호 인증이 활성화되어 있는지 확인
3. `firebase-config.js`의 설정이 올바른지 확인

### 8.3 갤러리가 비어있음

**증상**: 프론트엔드에서 "등록된 이미지가 없습니다" 표시

**해결 방법**:
1. Firebase Console → Firestore → gallery 컬렉션 확인
2. 업로드한 이미지의 `visible` 필드가 `true`인지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 8.4 CORS 에러

**증상**: 브라우저 콘솔에 CORS 관련 에러

**해결 방법**:
1. Firebase 설정에서 올바른 도메인을 승인 도메인에 추가
2. Firebase Console → Authentication → Settings → Authorized domains
3. GitHub Pages 도메인 추가 (예: `username.github.io`)

---

## 9. 보안 권장사항

### 9.1 API 키 보호

- Firebase API 키는 공개되어도 괜찮지만, 보안 규칙이 올바르게 설정되어 있는지 확인하세요
- `firestore.rules`와 `storage.rules`가 제대로 적용되었는지 확인

### 9.2 관리자 계정 보안

- 강력한 비밀번호 사용 (최소 12자, 대소문자/숫자/특수문자 혼합)
- 필요시 2단계 인증 활성화
- 관리자 이메일은 실제 사용하는 이메일로 변경 권장

### 9.3 정기 백업

- Firebase Console에서 정기적으로 데이터 백업
- Firestore 데이터 내보내기 (Console → Firestore → 가져오기/내보내기)
- Storage 파일 다운로드 및 백업

---

## 10. Firebase Hosting 사용 (선택사항)

GitHub Pages 대신 Firebase Hosting을 사용할 수도 있습니다:

### 10.1 Firebase CLI 설치

```bash
npm install -g firebase-tools
```

### 10.2 로그인

```bash
firebase login
```

### 10.3 프로젝트 초기화

```bash
firebase init hosting
```

- 프로젝트 선택: 생성한 Firebase 프로젝트
- Public directory: `.` (현재 디렉토리)
- Single-page app: `No`
- Overwrite index.html: `No`

### 10.4 배포

```bash
firebase deploy --only hosting
```

배포 후 `https://your-project.web.app` 또는 `https://your-project.firebaseapp.com`에서 접속 가능합니다.

---

## 11. 비용 안내

### 11.1 Spark Plan (무료)

현재 설정으로는 Firebase의 무료 플랜으로 충분합니다:

- **Authentication**: 월 10,000명 사용자 무료
- **Firestore**: 읽기 50,000회/일, 쓰기 20,000회/일, 삭제 20,000회/일
- **Storage**: 5GB 저장, 1GB/일 다운로드
- **Hosting**: 10GB 저장, 360MB/일 전송

### 11.2 사용량 모니터링

Firebase Console → 사용량 및 결제에서 사용량 확인 가능합니다.

---

## 12. 추가 기능 구현

현재 구현된 기능:
- ✅ 관리자 로그인/로그아웃
- ✅ 갤러리 이미지 업로드/삭제
- ✅ 카테고리별 필터링
- ✅ 프론트엔드 갤러리 표시

추가 구현 가능한 기능:
- ⬜ 웨딩 무비 관리
- ⬜ 제품 관리
- ⬜ FAQ 관리
- ⬜ 블로그 관리
- ⬜ 인스타그램 피드 연동
- ⬜ 이미지 수정 기능
- ⬜ 이미지 정렬 기능
- ⬜ 검색 기능

---

## 지원

문제가 발생하면 다음을 확인하세요:

1. 브라우저 개발자 도구의 콘솔 (F12)
2. Firebase Console의 각 서비스 상태
3. `firebase-config.js`의 설정 정보

---

**마지막 업데이트**: 2025-01-06
