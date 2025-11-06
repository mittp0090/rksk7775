# 빠른 시작 가이드

이 가이드를 따라하면 **5분 안에** 웹사이트를 설정하고 배포할 수 있습니다!

## 준비물

- Google 계정 (Firebase 사용)
- Node.js 설치 (https://nodejs.org/)

---

## 단계별 가이드

### 1단계: Firebase 프로젝트 생성 (2분)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `shinyoungsoo-snap`)
4. Google Analytics는 선택사항 (끄기 권장)
5. "프로젝트 만들기" 클릭

### 2단계: Firebase 서비스 활성화 (1분)

프로젝트가 생성되면:

#### Authentication 활성화
1. 왼쪽 메뉴 → Authentication 클릭
2. "시작하기" 버튼 클릭
3. "이메일/비밀번호" 선택 → "사용 설정" ON → "저장"

#### Firestore 활성화
1. 왼쪽 메뉴 → Firestore Database 클릭
2. "데이터베이스 만들기" 클릭
3. **프로덕션 모드**로 시작 선택
4. 위치: `asia-northeast3 (서울)` 선택
5. "사용 설정" 클릭

#### Storage 활성화
1. 왼쪽 메뉴 → Storage 클릭
2. "시작하기" 클릭
3. **프로덕션 모드**로 시작 선택
4. "완료" 클릭

### 3단계: 웹 앱 등록 (30초)

1. 프로젝트 개요 페이지에서 **웹 아이콘** (`</>`) 클릭
2. 앱 닉네임 입력 (예: `web`)
3. "앱 등록" 클릭
4. **설정 정보를 복사해두기** (나중에 사용)

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

### 4단계: 자동 설정 스크립트 실행 (1분 30초)

터미널에서 프로젝트 폴더로 이동 후:

```bash
# 방법 1: Node.js 스크립트 (권장)
node setup.js

# 또는 방법 2: npm 스크립트
npm run setup

# 또는 방법 3: Bash 스크립트 (Linux/Mac)
chmod +x setup.sh
./setup.sh
```

스크립트가 물어보는 내용:
1. **프로젝트 ID**: Firebase Console에서 확인 (프로젝트 설정)
2. **API Key 등**: 3단계에서 복사한 설정 정보 붙여넣기
3. **관리자 UID**: Authentication → Users에서 사용자 추가 후 UID 복사
4. **배포 방법**: Firebase Hosting 선택 (1번)

### 5단계: 완료! 🎉

스크립트가 끝나면 다음 URL로 접속:

- **메인 사이트**: `https://your-project.web.app`
- **관리자 페이지**: `https://your-project.web.app/admin/login.html`

---

## 더 간단한 방법 (관리자 계정 자동 생성)

서비스 계정 키를 사용하면 관리자 계정도 자동으로 생성됩니다:

### 1. 서비스 계정 키 다운로드

1. Firebase Console → 프로젝트 설정 (톱니바퀴 아이콘)
2. "서비스 계정" 탭
3. "새 비공개 키 생성" 클릭
4. 다운로드한 JSON 파일을 프로젝트 폴더에 `service-account-key.json`으로 저장

### 2. 관리자 계정 생성

1. Firebase Console → Authentication → Users
2. "사용자 추가" 클릭
3. 이메일과 비밀번호 입력 (예: `admin@example.com` / `your-password`)
4. 생성된 사용자의 **UID 복사**

### 3. 자동 설정 스크립트 실행

`setup.js` 실행 시 서비스 계정 키 파일이 있으면 자동으로 Firestore에 관리자 추가됩니다.

---

## 트러블슈팅

### "Firebase CLI를 찾을 수 없습니다"

```bash
npm install -g firebase-tools
```

### "로그인이 필요합니다"

```bash
firebase login
```

### "규칙 배포 실패"

Firebase Console에서 Firestore와 Storage가 활성화되어 있는지 확인하세요.

### "관리자 권한이 없습니다"

Firestore Database에서 `admins` 컬렉션에 사용자 UID로 문서를 수동으로 추가하세요:

1. Firestore → 컬렉션 시작
2. 컬렉션 ID: `admins`
3. 문서 ID: `사용자 UID`
4. 필드 추가:
   - `email` (string): `admin@example.com`
   - `created_at` (timestamp): 현재 시간

---

## 수동 설정 방법

자동 스크립트를 사용하지 않으려면 [FIREBASE_SETUP.md](FIREBASE_SETUP.md) 문서를 참고하세요.

---

## 다음 단계

1. **이미지 업로드**: 관리자 페이지 → 갤러리 관리 → 이미지 업로드
2. **카테고리 관리**: 업로드 시 카테고리 선택 (Wedding Ceremony, PreWedding 등)
3. **커스터마이징**: 로고, 색상, 소셜 링크 변경 ([README.md](README.md) 참고)

---

**문제가 해결되지 않나요?**

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - 상세한 설정 가이드
- [README.md](README.md) - 전체 문서
- 브라우저 개발자 도구 (F12) 콘솔 확인
