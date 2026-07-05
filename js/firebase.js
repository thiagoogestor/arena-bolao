const firebaseConfig = {
  apiKey: "AIzaSyDy12LrgB7NYh1QQTNFTUD1YYQKhc-qQec",
  authDomain: "bolao-copa-2026-cc70a.firebaseapp.com",
  databaseURL: "https://bolao-copa-2026-cc70a-default-rtdb.firebaseio.com",
  projectId: "bolao-copa-2026-cc70a",
  storageBucket: "bolao-copa-2026-cc70a.firebasestorage.app",
  messagingSenderId: "889482169724",
  appId: "1:889482169724:web:5fb4201c3d01071580e8f9",
  measurementId: "G-PTJ8MHQ68K"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
