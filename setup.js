#!/usr/bin/env node

// 신영수스냅 자동 설정 스크립트 (Node.js 버전)
// 이 스크립트는 Firebase 프로젝트를 자동으로 설정합니다.

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function checkFirebaseCLI() {
  log('\n Firebase CLI 확인 중...', 'blue');

  try {
    execSync('firebase --version', { stdio: 'ignore' });
    log('✓ Firebase CLI가 설치되어 있습니다.', 'green');
    return true;
  } catch (error) {
    log('✗ Firebase CLI가 설치되어 있지 않습니다.', 'red');
    const install = await question('지금 설치하시겠습니까? (y/n): ');

    if (install.toLowerCase() === 'y') {
      log('Firebase CLI 설치 중...', 'yellow');
      try {
        execSync('npm install -g firebase-tools', { stdio: 'inherit' });
        log('✓ Firebase CLI 설치 완료!', 'green');
        return true;
      } catch (error) {
        log('✗ 설치 실패. npm이 설치되어 있는지 확인해주세요.', 'red');
        return false;
      }
    } else {
      log('Firebase CLI가 필요합니다. 나중에 설치해주세요.', 'yellow');
      return false;
    }
  }
}

async function checkFirebaseLogin() {
  log('\n Firebase 로그인 확인 중...', 'blue');

  try {
    execSync('firebase projects:list', { stdio: 'ignore' });
    log('✓ Firebase에 로그인되어 있습니다.', 'green');
    return true;
  } catch (error) {
    log('✗ Firebase 로그인이 필요합니다.', 'red');
    const login = await question('지금 로그인하시겠습니까? (y/n): ');

    if (login.toLowerCase() === 'y') {
      try {
        execSync('firebase login', { stdio: 'inherit' });
        log('✓ 로그인 완료!', 'green');
        return true;
      } catch (error) {
        log('✗ 로그인 실패', 'red');
        return false;
      }
    } else {
      return false;
    }
  }
}

async function setupProject() {
  log('\n================================', 'blue');
  log('Firebase 프로젝트 설정', 'blue');
  log('================================\n', 'blue');

  log('Firebase Console에서 프로젝트를 먼저 생성해주세요:');
  log('https://console.firebase.google.com/\n', 'yellow');

  const projectId = await question('Firebase 프로젝트 ID를 입력하세요: ');

  if (!projectId) {
    log('✗ 프로젝트 ID를 입력해주세요.', 'red');
    return null;
  }

  // .firebaserc 생성
  const firebaserc = {
    projects: {
      default: projectId
    }
  };

  fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
  log('✓ .firebaserc 생성 완료!', 'green');

  return projectId;
}

async function setupFirebaseConfig(projectId) {
  log('\n================================', 'blue');
  log('Firebase 웹 앱 설정', 'blue');
  log('================================\n', 'blue');

  log('Firebase Console에서 웹 앱 설정 정보를 복사해주세요.', 'yellow');
  log('위치: Firebase Console → 프로젝트 설정 → 일반 → 내 앱 → 웹 앱\n');

  const apiKey = await question('API Key: ');
  const authDomain = await question(`Auth Domain (기본: ${projectId}.firebaseapp.com): `) || `${projectId}.firebaseapp.com`;
  const storageBucket = await question(`Storage Bucket (기본: ${projectId}.appspot.com): `) || `${projectId}.appspot.com`;
  const messagingSenderId = await question('Messaging Sender ID: ');
  const appId = await question('App ID: ');

  const configContent = `// Firebase 설정
const firebaseConfig = {
    apiKey: "${apiKey}",
    authDomain: "${authDomain}",
    projectId: "${projectId}",
    storageBucket: "${storageBucket}",
    messagingSenderId: "${messagingSenderId}",
    appId: "${appId}"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
`;

  fs.writeFileSync('firebase-config.js', configContent);
  log('✓ firebase-config.js 생성 완료!', 'green');
}

async function deployRules() {
  log('\n================================', 'blue');
  log('보안 규칙 배포', 'blue');
  log('================================\n', 'blue');

  log('Firestore와 Storage가 활성화되어 있어야 합니다.', 'yellow');
  const ready = await question('서비스를 모두 활성화했나요? (y/n): ');

  if (ready.toLowerCase() !== 'y') {
    log('나중에 수동으로 배포해주세요: firebase deploy --only firestore:rules,storage:rules', 'yellow');
    return;
  }

  try {
    log('\nFirestore 규칙 배포 중...', 'blue');
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    log('✓ Firestore 규칙 배포 완료!', 'green');

    log('\nStorage 규칙 배포 중...', 'blue');
    execSync('firebase deploy --only storage:rules', { stdio: 'inherit' });
    log('✓ Storage 규칙 배포 완료!', 'green');
  } catch (error) {
    log('✗ 규칙 배포 실패. 서비스가 활성화되어 있는지 확인해주세요.', 'red');
  }
}

async function setupAdmin() {
  log('\n================================', 'blue');
  log('관리자 계정 설정', 'blue');
  log('================================\n', 'blue');

  log('1. Firebase Console → Authentication → Users → 사용자 추가');
  log('2. 이메일과 비밀번호 입력');
  log('3. 생성된 사용자의 UID 복사\n', 'yellow');

  const adminUid = await question('관리자 UID: ');
  const adminEmail = await question('관리자 이메일: ');

  if (!adminUid || !adminEmail) {
    log('나중에 Firestore에서 수동으로 추가해주세요.', 'yellow');
    return;
  }

  log('\n서비스 계정 키가 필요합니다:', 'yellow');
  log('Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성');
  log('다운로드한 파일을 service-account-key.json으로 저장\n');

  const hasKey = await question('서비스 계정 키 파일이 준비되었나요? (y/n): ');

  if (hasKey.toLowerCase() !== 'y') {
    log('나중에 수동으로 추가해주세요.', 'yellow');
    return;
  }

  if (!fs.existsSync('service-account-key.json')) {
    log('✗ service-account-key.json 파일이 없습니다.', 'red');
    return;
  }

  // 임시 스크립트 생성
  const addAdminScript = `
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addAdmin() {
  try {
    await db.collection('admins').doc('${adminUid}').set({
      email: '${adminEmail}',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ 관리자 계정이 추가되었습니다!');
  } catch (error) {
    console.error('✗ 에러:', error.message);
  }
  process.exit();
}

addAdmin();
`;

  fs.writeFileSync('_temp_add_admin.js', addAdminScript);

  try {
    log('\nfirebase-admin 패키지 확인 중...', 'blue');
    try {
      require.resolve('firebase-admin');
    } catch (e) {
      log('firebase-admin 설치 중...', 'yellow');
      execSync('npm install firebase-admin', { stdio: 'inherit' });
    }

    log('\n관리자 계정 추가 중...', 'blue');
    execSync('node _temp_add_admin.js', { stdio: 'inherit' });
    log('✓ 관리자 계정 추가 완료!', 'green');
  } catch (error) {
    log('✗ 관리자 추가 실패', 'red');
  } finally {
    // 임시 파일 삭제
    if (fs.existsSync('_temp_add_admin.js')) {
      fs.unlinkSync('_temp_add_admin.js');
    }
  }
}

async function deployHosting(projectId) {
  log('\n================================', 'blue');
  log('배포 옵션', 'blue');
  log('================================\n', 'blue');

  log('1. Firebase Hosting에 배포 (권장)');
  log('2. GitHub Pages에 배포');
  log('3. 나중에 배포\n');

  const option = await question('선택하세요 (1-3): ');

  switch (option) {
    case '1':
      try {
        log('\nFirebase Hosting에 배포 중...', 'blue');
        execSync('firebase deploy --only hosting', { stdio: 'inherit' });
        log('\n✓ 배포 완료!', 'green');
        log(`\n사이트 URL: https://${projectId}.web.app`);
        log(`관리자 페이지: https://${projectId}.web.app/admin/login.html`);
      } catch (error) {
        log('✗ 배포 실패', 'red');
      }
      break;
    case '2':
      log('\nGitHub Pages 배포 안내:', 'yellow');
      log('1. GitHub 저장소 Settings → Pages');
      log('2. Source: 현재 브랜치 선택');
      log('3. Save 클릭');
      break;
    default:
      log('\n나중에 배포하려면: firebase deploy --only hosting', 'yellow');
      break;
  }
}

async function main() {
  console.clear();
  log('================================', 'green');
  log('신영수스냅 자동 설정 스크립트', 'green');
  log('================================\n', 'green');

  // 1. Firebase CLI 확인
  const hasCLI = await checkFirebaseCLI();
  if (!hasCLI) {
    rl.close();
    return;
  }

  // 2. Firebase 로그인 확인
  const isLoggedIn = await checkFirebaseLogin();
  if (!isLoggedIn) {
    rl.close();
    return;
  }

  // 3. 프로젝트 설정
  const projectId = await setupProject();
  if (!projectId) {
    rl.close();
    return;
  }

  // 4. Firebase Config 설정
  await setupFirebaseConfig(projectId);

  // 5. 보안 규칙 배포
  await deployRules();

  // 6. 관리자 계정 설정
  await setupAdmin();

  // 7. 호스팅 배포
  await deployHosting(projectId);

  // 완료
  log('\n================================', 'green');
  log('✓ 설정 완료!', 'green');
  log('================================\n', 'green');

  log('다음 단계:');
  log('1. 관리자 페이지 접속: /admin/login.html');
  log('2. 생성한 관리자 계정으로 로그인');
  log('3. 갤러리 관리에서 이미지 업로드\n');
  log('문제가 발생하면 FIREBASE_SETUP.md 문서를 참고하세요.\n');

  rl.close();
}

// 에러 핸들링
process.on('uncaughtException', (error) => {
  log(`\n✗ 에러 발생: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});

// 실행
main().catch((error) => {
  log(`\n✗ 에러 발생: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
