// Firebase 설정
// Firebase Console에서 프로젝트 생성 후 아래 값들을 실제 값으로 변경하세요
// https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스 초기화
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 현재 사용자 상태 추적
let currentUser = null;

auth.onAuthStateChanged((user) => {
    currentUser = user;
    console.log('Auth state changed:', user ? user.email : 'Not logged in');
});
