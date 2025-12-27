import { initializeApp, getApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // G-xxxx
};

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ✅ Analytics harus client-only
let analytics: any = null;

export async function initFirebaseAnalytics() {
  if (typeof window === "undefined") return null;

  const { isSupported, getAnalytics } = await import("firebase/analytics");
  const ok = await isSupported();
  if (!ok) return null;

  analytics = getAnalytics(firebaseApp);
  return analytics;
}

export async function logAnalyticsEvent(name: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;

  if (!analytics) await initFirebaseAnalytics();
  if (!analytics) return;

  const { logEvent } = await import("firebase/analytics");
  logEvent(analytics, name, params);
}
