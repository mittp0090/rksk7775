#!/bin/bash

# 신영수스냅 자동 설정 스크립트
# 이 스크립트는 Firebase 프로젝트를 자동으로 설정합니다.

echo "================================"
echo "신영수스냅 자동 설정 스크립트"
echo "================================"
echo ""

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Firebase CLI 설치 확인
if ! command -v firebase &> /dev/null
then
    echo -e "${YELLOW}Firebase CLI가 설치되어 있지 않습니다.${NC}"
    echo "설치 중..."
    npm install -g firebase-tools

    if [ $? -ne 0 ]; then
        echo -e "${RED}Firebase CLI 설치 실패. npm이 설치되어 있는지 확인해주세요.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Firebase CLI 설치 완료!${NC}"
fi

# Firebase 로그인 확인
echo ""
echo "Firebase 로그인 확인 중..."
firebase projects:list &> /dev/null

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Firebase 로그인이 필요합니다.${NC}"
    firebase login

    if [ $? -ne 0 ]; then
        echo -e "${RED}로그인 실패${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Firebase 로그인 완료!${NC}"

# Firebase 프로젝트 ID 입력
echo ""
echo "================================"
echo "Firebase 프로젝트 설정"
echo "================================"
echo ""
echo "Firebase Console에서 프로젝트를 먼저 생성해주세요:"
echo "https://console.firebase.google.com/"
echo ""
read -p "Firebase 프로젝트 ID를 입력하세요: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}프로젝트 ID를 입력해주세요.${NC}"
    exit 1
fi

# .firebaserc 업데이트
echo ""
echo "프로젝트 설정 중..."
cat > .firebaserc <<EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF

# Firebase 프로젝트 정보 가져오기
echo ""
echo "Firebase 프로젝트 정보 가져오는 중..."

# firebase-config.js 자동 생성을 위한 프로젝트 정보 가져오기
echo ""
echo -e "${YELLOW}Firebase Console에서 웹 앱 설정 정보를 복사해주세요.${NC}"
echo "위치: Firebase Console → 프로젝트 설정 → 일반 → 내 앱 → 웹 앱"
echo ""
read -p "API Key를 입력하세요: " API_KEY
read -p "Auth Domain을 입력하세요 (예: $PROJECT_ID.firebaseapp.com): " AUTH_DOMAIN
read -p "Storage Bucket을 입력하세요 (예: $PROJECT_ID.appspot.com): " STORAGE_BUCKET
read -p "Messaging Sender ID를 입력하세요: " MESSAGING_SENDER_ID
read -p "App ID를 입력하세요: " APP_ID

# firebase-config.js 자동 생성
cat > firebase-config.js <<EOF
// Firebase 설정
const firebaseConfig = {
    apiKey: "$API_KEY",
    authDomain: "$AUTH_DOMAIN",
    projectId: "$PROJECT_ID",
    storageBucket: "$STORAGE_BUCKET",
    messagingSenderId: "$MESSAGING_SENDER_ID",
    appId: "$APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
EOF

echo -e "${GREEN}firebase-config.js 생성 완료!${NC}"

# Authentication 활성화 안내
echo ""
echo "================================"
echo "Firebase 서비스 활성화 필요"
echo "================================"
echo ""
echo "다음 서비스들을 Firebase Console에서 수동으로 활성화해주세요:"
echo ""
echo "1. Authentication:"
echo "   - Firebase Console → Authentication → 시작하기"
echo "   - Sign-in method → 이메일/비밀번호 → 사용 설정"
echo ""
echo "2. Firestore Database:"
echo "   - Firebase Console → Firestore Database → 데이터베이스 만들기"
echo "   - 프로덕션 모드 선택, 위치: asia-northeast3 (서울)"
echo ""
echo "3. Storage:"
echo "   - Firebase Console → Storage → 시작하기"
echo "   - 프로덕션 모드 선택"
echo ""
read -p "위 서비스들을 모두 활성화했나요? (y/n): " SERVICES_ENABLED

if [ "$SERVICES_ENABLED" != "y" ]; then
    echo -e "${YELLOW}서비스 활성화 후 다시 실행해주세요.${NC}"
    exit 0
fi

# Firestore 규칙 배포
echo ""
echo "Firestore 보안 규칙 배포 중..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Firestore 규칙 배포 완료!${NC}"
else
    echo -e "${RED}Firestore 규칙 배포 실패${NC}"
fi

# Storage 규칙 배포
echo ""
echo "Storage 보안 규칙 배포 중..."
firebase deploy --only storage:rules

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Storage 규칙 배포 완료!${NC}"
else
    echo -e "${RED}Storage 규칙 배포 실패${NC}"
fi

# 관리자 계정 생성 안내
echo ""
echo "================================"
echo "관리자 계정 설정"
echo "================================"
echo ""
echo "관리자 계정을 생성해주세요:"
echo "1. Firebase Console → Authentication → Users → 사용자 추가"
echo "2. 이메일과 비밀번호 입력 (예: admin@example.com)"
echo "3. 생성된 사용자의 UID를 복사하세요"
echo ""
read -p "관리자 계정 UID를 입력하세요: " ADMIN_UID
read -p "관리자 이메일을 입력하세요: " ADMIN_EMAIL

if [ -z "$ADMIN_UID" ] || [ -z "$ADMIN_EMAIL" ]; then
    echo -e "${YELLOW}관리자 계정은 나중에 수동으로 설정해주세요.${NC}"
else
    # 관리자 계정 추가 스크립트 생성
    cat > add-admin.js <<EOF
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addAdmin() {
  try {
    await db.collection('admins').doc('$ADMIN_UID').set({
      email: '$ADMIN_EMAIL',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('관리자 계정이 추가되었습니다!');
  } catch (error) {
    console.error('에러:', error);
  }
  process.exit();
}

addAdmin();
EOF

    echo ""
    echo "관리자 추가를 위해서는 서비스 계정 키가 필요합니다:"
    echo "1. Firebase Console → 프로젝트 설정 → 서비스 계정"
    echo "2. '새 비공개 키 생성' 클릭"
    echo "3. 다운로드한 JSON 파일을 'service-account-key.json'으로 저장"
    echo ""
    read -p "서비스 계정 키를 다운로드했나요? (y/n): " HAS_SERVICE_KEY

    if [ "$HAS_SERVICE_KEY" = "y" ]; then
        if [ -f "service-account-key.json" ]; then
            echo "firebase-admin 설치 중..."
            npm install firebase-admin

            echo "관리자 계정 추가 중..."
            node add-admin.js

            # 임시 파일 삭제
            rm add-admin.js

            echo -e "${GREEN}관리자 계정 추가 완료!${NC}"
        else
            echo -e "${YELLOW}service-account-key.json 파일이 없습니다.${NC}"
            echo "나중에 Firestore에서 수동으로 추가해주세요."
        fi
    else
        echo -e "${YELLOW}나중에 Firestore에서 수동으로 추가해주세요.${NC}"
        rm add-admin.js
    fi
fi

# Firebase Hosting 배포 여부 확인
echo ""
echo "================================"
echo "배포 옵션"
echo "================================"
echo ""
echo "1. Firebase Hosting에 배포 (권장)"
echo "2. GitHub Pages에 배포"
echo "3. 나중에 배포"
echo ""
read -p "선택하세요 (1-3): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        echo "Firebase Hosting에 배포 중..."
        firebase deploy --only hosting

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}배포 완료!${NC}"
            echo ""
            echo "사이트 URL: https://$PROJECT_ID.web.app"
            echo "관리자 페이지: https://$PROJECT_ID.web.app/admin/login.html"
        else
            echo -e "${RED}배포 실패${NC}"
        fi
        ;;
    2)
        echo ""
        echo "GitHub Pages 배포 안내:"
        echo "1. GitHub 저장소 Settings → Pages"
        echo "2. Source: 현재 브랜치 선택"
        echo "3. Save 클릭"
        ;;
    *)
        echo ""
        echo "배포는 나중에 'firebase deploy --only hosting' 명령으로 할 수 있습니다."
        ;;
esac

# 완료 메시지
echo ""
echo "================================"
echo -e "${GREEN}설정 완료!${NC}"
echo "================================"
echo ""
echo "다음 단계:"
echo "1. 관리자 페이지 접속: /admin/login.html"
echo "2. 생성한 관리자 계정으로 로그인"
echo "3. 갤러리 관리에서 이미지 업로드"
echo ""
echo "문제가 발생하면 FIREBASE_SETUP.md 문서를 참고하세요."
echo ""
