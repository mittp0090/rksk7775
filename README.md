# 신영수스냅 (Shin Young-soo Snap)

신영수스냅 웹사이트 - 결혼 사진 및 웨딩 촬영 전문 포트폴리오 사이트

## 프로젝트 개요

이 프로젝트는 사진작가 신영수의 포트폴리오 웹사이트입니다. Firebase를 백엔드로 사용하여 관리자가 손쉽게 콘텐츠를 관리할 수 있습니다.

### 주요 기능

- **갤러리**: 카테고리별 포트폴리오 이미지 (Wedding Ceremony, PreWedding, Body Profile, Profile, Hanbok 등)
- **웨딩 무비**: 웨딩 영상 작품 소개
- **제품**: 제공하는 제품 및 서비스 안내
- **FAQ**: 자주 묻는 질문
- **인스타그램**: 인스타그램 피드 연동
- **블로그**: 포스팅 및 뉴스
- **관리자 패널**: 콘텐츠를 쉽게 관리할 수 있는 관리 페이지

## 기술 스택

### 프론트엔드
- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Responsive Design (모바일 최적화)

### 백엔드 (Firebase)
- **Firebase Authentication**: 관리자 로그인/로그아웃
- **Cloud Firestore**: 데이터베이스 (갤러리, 블로그 등)
- **Firebase Storage**: 이미지 파일 저장
- **Firebase Hosting** (선택사항): 웹사이트 호스팅

## 프로젝트 구조

```
.
├── index.html              # 메인 페이지 (갤러리)
├── wedding-movie.html      # 웨딩 무비 페이지
├── product.html            # 제품 페이지
├── question.html           # FAQ 페이지
├── instagram.html          # 인스타그램 페이지
├── blog.html               # 블로그 페이지
├── admin/                  # 관리자 페이지
│   ├── login.html          # 관리자 로그인
│   ├── dashboard.html      # 관리자 대시보드
│   └── gallery.html        # 갤러리 관리
├── css/
│   ├── styles.css          # 메인 스타일
│   └── admin.css           # 관리자 페이지 스타일
├── js/
│   ├── main.js             # 메인 JavaScript
│   ├── admin.js            # 관리자 공통 기능
│   ├── admin-login.js      # 관리자 로그인
│   └── admin-gallery.js    # 갤러리 관리
├── firebase-config.js      # Firebase 설정
├── firestore.rules         # Firestore 보안 규칙
├── storage.rules           # Storage 보안 규칙
├── FIREBASE_SETUP.md       # Firebase 설정 가이드 (상세)
└── README.md               # 프로젝트 설명 (이 파일)
```

## 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
```

### 2. Firebase 설정

자세한 설정 방법은 [FIREBASE_SETUP.md](FIREBASE_SETUP.md) 파일을 참고하세요.

**간단 요약:**

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Firebase 웹 앱 등록 및 설정 정보 복사
3. `firebase-config.js` 파일에 설정 정보 입력
4. Authentication 활성화 (이메일/비밀번호)
5. Firestore Database 생성 및 보안 규칙 설정
6. Firebase Storage 시작 및 보안 규칙 설정
7. 관리자 계정 생성 및 `admins` 컬렉션에 문서 추가

### 3. 로컬 개발

Firebase 설정이 완료되면 로컬에서 바로 테스트할 수 있습니다:

```bash
# Python 3가 설치되어 있다면:
python3 -m http.server 8000

# 또는 Node.js의 http-server:
npx http-server -p 8000
```

브라우저에서 `http://localhost:8000` 접속

### 4. 배포

#### GitHub Pages 배포

1. GitHub에 저장소 푸시
2. Settings → Pages → Source: `main` branch 선택
3. 몇 분 후 `https://USERNAME.github.io/REPOSITORY/` 에서 접속 가능

#### Firebase Hosting 배포 (선택사항)

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 초기화
firebase init hosting

# 배포
firebase deploy --only hosting
```

## 관리자 사용법

### 로그인

1. `https://yoursite.com/admin/login.html` 접속
2. Firebase Authentication에서 생성한 이메일/비밀번호 입력
3. 로그인 후 대시보드로 이동

### 갤러리 관리

1. 대시보드에서 "갤러리 관리" 클릭
2. "이미지 업로드" 버튼 클릭
3. 이미지 파일 선택 (여러 개 가능)
4. 카테고리 선택:
   - `wedding-ceremony`: Wedding Ceremony
   - `prewedding`: PreWedding
   - `body-profile`: Body Profile
   - `profile`: Profile
   - `hanbok`: Hanbok
   - `etc`: etc.
5. 설명 입력 (선택사항)
6. "업로드" 클릭

### 이미지 삭제

1. 갤러리 관리 페이지에서 이미지 위에 마우스 오버
2. 휴지통 아이콘 클릭
3. 확인 후 삭제

## 카테고리 설명

- **전체 (all)**: 모든 카테고리의 이미지 표시
- **Wedding Ceremony**: 결혼식 본식 촬영
- **PreWedding**: 웨딩 스냅, 야외 촬영
- **Body Profile**: 바디 프로필 촬영
- **Profile**: 프로필 사진 촬영
- **Hanbok**: 한복 촬영
- **etc.**: 기타 촬영

## 보안

### Firestore 보안 규칙

- 관리자만 데이터 생성/수정/삭제 가능
- 모든 사용자가 데이터 읽기 가능
- 관리자 권한은 `admins` 컬렉션에 UID가 있는지로 확인

### Storage 보안 규칙

- 관리자만 파일 업로드 가능
- 모든 사용자가 파일 읽기 가능
- 이미지 파일만 업로드 가능 (`image/*`)
- 최대 파일 크기: 10MB

### 관리자 계정 보안 권장사항

- 강력한 비밀번호 사용 (최소 12자)
- 정기적으로 비밀번호 변경
- Firebase Console에서 이상 활동 모니터링
- 필요시 2단계 인증 활성화

## 커스터마이징

### 색상 변경

`css/styles.css`의 CSS 변수 수정:

```css
:root {
    --primary-color: #1f2937;      /* 메인 색상 */
    --secondary-color: #374151;    /* 보조 색상 */
    --text-color: #333333;         /* 텍스트 색상 */
    --bg-color: #ffffff;           /* 배경 색상 */
}
```

### 로고 변경

`index.html` 및 다른 HTML 파일의 로고 텍스트 수정:

```html
<div class="logo-container">
    <a href="index.html"><h1>신영수스냅</h1></a>
</div>
```

### 소셜 링크 변경

푸터의 소셜 링크 URL 수정:

```html
<div class="social-links">
    <a href="https://facebook.com/your-page">Facebook</a>
    <a href="https://twitter.com/your-handle">Twitter</a>
    <a href="https://instagram.com/your-handle">Instagram</a>
</div>
```

## Firebase 무료 플랜 제한

- **Authentication**: 월 10,000명 사용자
- **Firestore**: 읽기 50,000회/일, 쓰기 20,000회/일
- **Storage**: 5GB 저장, 1GB/일 다운로드
- **Hosting**: 10GB 저장, 360MB/일 전송

일반적인 포트폴리오 사이트로는 충분한 용량입니다.

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)
- 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 문제 해결

### 이미지가 표시되지 않음

1. Firebase Storage 보안 규칙이 올바른지 확인
2. 이미지 URL이 공개 접근 가능한지 확인
3. 브라우저 콘솔에서 CORS 에러 확인

### 로그인이 안 됨

1. `firebase-config.js`의 설정이 올바른지 확인
2. Firebase Console → Authentication에서 이메일/비밀번호 인증이 활성화되어 있는지 확인
3. 관리자 계정이 생성되어 있는지 확인

### 업로드가 실패함

1. Firebase Storage 보안 규칙 확인
2. Firestore의 `admins` 컬렉션에 사용자 UID 문서가 있는지 확인
3. 파일 크기가 10MB 이하인지 확인
4. 파일이 이미지 형식(`image/*`)인지 확인

자세한 문제 해결 방법은 [FIREBASE_SETUP.md](FIREBASE_SETUP.md)의 "문제 해결" 섹션을 참고하세요.

## 향후 개선 사항

- [ ] 웨딩 무비 관리 기능 구현
- [ ] 제품 관리 기능 구현
- [ ] FAQ 관리 기능 구현
- [ ] 블로그 관리 기능 구현
- [ ] 인스타그램 API 연동
- [ ] 이미지 수정 기능 (카테고리, 설명 변경)
- [ ] 이미지 정렬 기능 (드래그 앤 드롭)
- [ ] 갤러리 검색 기능
- [ ] 이미지 확대 보기 (라이트박스)
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 이미지 최적화 (WebP 변환, 썸네일 생성)
- [ ] 다국어 지원 (한국어/영어)

## 라이선스

이 프로젝트는 개인 포트폴리오 사이트로 제작되었습니다.

## 지원

문제가 발생하거나 질문이 있으시면:

1. [FIREBASE_SETUP.md](FIREBASE_SETUP.md) 문서 확인
2. 브라우저 개발자 도구(F12) 콘솔 확인
3. Firebase Console에서 각 서비스 상태 확인

---

**Last Updated**: 2025-01-06
**Version**: 2.0.0 (Firebase Migration)
