/**
 * config.js
 * 光祐 ERP 系統核心設定檔
 * 用途：集中管理 Firebase 初始化與全域變數，取代各檔案重複的設定碼。
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, 
    doc, query, where, orderBy, limit, writeBatch, increment, deleteField, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. Firebase 配置 (集中管理)
const firebaseConfig = {
    apiKey: "AIzaSyDkC6kfqpmEeMKIvWIqftounTSH_NPp25M",
    authDomain: "assessmentsystem-9e2ec.firebaseapp.com",
    projectId: "assessmentsystem-9e2ec",
    storageBucket: "assessmentsystem-9e2ec.firebasestorage.app",
    messagingSenderId: "455151254122",
    appId: "1:455151254122:web:45787cfce4469bff90e813",
    measurementId: "G-201C6BE86Z"
};

// 2. 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 3. 全域掛載 (為了相容現有的 15 個 HTML 檔案寫法)
// 這樣舊檔案中的 window.db, window.collection 都能繼續運作
window.firebaseApp = app;
window.db = db;
window.auth = auth;

// Firestore 方法全域掛載
window.collection = collection;
window.getDocs = getDocs;
window.getDoc = getDoc;
window.addDoc = addDoc;
window.setDoc = setDoc;
window.updateDoc = updateDoc;
window.deleteDoc = deleteDoc;
window.doc = doc;
window.query = query;
window.where = where;
window.orderBy = orderBy;
window.limit = limit;
window.writeBatch = writeBatch;
window.increment = increment;
window.deleteField = deleteField;
window.onSnapshot = onSnapshot;

// Auth 方法全域掛載
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;

// 4. 初始化完成通知
console.log("✅ [System] Firebase Config Loaded Successfully.");

// 如果頁面有定義 notifyAuthReady (如 accounting.html)，則在 Auth 狀態改變時通知
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(`👤 Logged in as: ${user.email}`);
        if (window.notifyAuthReady) window.notifyAuthReady();
        if (window.isAuthReady !== undefined) window.isAuthReady = true;
    } else {
        console.log("👤 No user logged in.");
    }
});