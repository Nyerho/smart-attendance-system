"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDfg74yTZ0ImjXGUV0-b6tD7hMxniu5XQ",
  authDomain: "smartattendance-74b2c.firebaseapp.com",
  projectId: "smartattendance-74b2c",
  storageBucket: "smartattendance-74b2c.firebasestorage.app",
  messagingSenderId: "872398383307",
  appId: "1:872398383307:web:735ff74b3b6bcc7ed6534e",
  measurementId: "G-KRDTCB0ZFS",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

let analyticsInstancePromise;

export function initFirebaseAnalytics() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!analyticsInstancePromise) {
    analyticsInstancePromise = isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .catch(() => null);
  }
  return analyticsInstancePromise;
}
