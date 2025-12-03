// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 這裡貼上你在 Firebase 網頁複製的那堆 Config
const firebaseConfig = {
  apiKey: "AIzaSyDDAvELKXdw54r_J0X8Rt5XzFd7pY1GTpI",
  authDomain: "australia2025-b6e29.firebaseapp.com",
  projectId: "australia2025-b6e29",
  storageBucket: "australia2025-b6e29.firebasestorage.app",
  messagingSenderId: "1056772532524",
  appId: "1:1056772532524:web:4de2b8ea30725d0db26489",
  measurementId: "G-HCJZZ2T2HY"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出 Database 和 Storage 給其他檔案用
export const db = getFirestore(app);
export const storage = getStorage(app);
