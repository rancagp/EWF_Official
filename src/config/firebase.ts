import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
};

function hasFirebaseConfig() {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  const existingApp = getApps()[0];
  if (existingApp) return existingApp;
  if (!hasFirebaseConfig()) return null;
  return initializeApp(firebaseConfig);
}

let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  analyticsPromise ??= import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      const supported = await isSupported().catch(() => false);
      if (!supported) return null;
      const app = getFirebaseApp();
      if (!app) return null;
      return getAnalytics(app);
    })
    .catch(() => null);

  return analyticsPromise;
}

export async function trackFirebasePageView(url: string) {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;

  const { logEvent } = await import("firebase/analytics");

  logEvent(analytics, "page_view", {
    page_location: window.location.href,
    page_path: url,
    page_title: document.title,
    ...(process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_DEBUG === "true"
      ? { debug_mode: true }
      : null),
  });
}
