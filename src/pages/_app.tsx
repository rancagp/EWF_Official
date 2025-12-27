import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { appWithTranslation, useTranslation } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import ScrollToTop from "@/components/atoms/ScrollToTop";

// ✅ Pakai env kalau ada, fallback biar gak null di client
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-4FYTRTD1KR";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { i18n } = useTranslation();
  const { locale } = router;

  // ✅ Loading screen (1x listener, gak dobel)
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    const initialLoad = setTimeout(() => setLoading(false), 500);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
      clearTimeout(initialLoad);
    };
  }, [router.events]);

  // ✅ GA4 Pageview untuk SPA (route change)
  useEffect(() => {
    if (!GA_ID) return;
    if (!router.isReady) return;
    if (typeof window === "undefined") return;

    // stub gtag (kalau script belum ready, tetep ke-queue di dataLayer)
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    const trackPageView = (url: string) => {
      // Cara paling umum untuk SPA: config + page_path
      window.gtag("config", GA_ID, {
        page_path: url,
      });
    };

    // initial pageview
    trackPageView(router.asPath);

    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.isReady, router.asPath, router.events]);

  // ✅ Locale changes + URL consistency (punya lu, gue rapihin dependency aja)
  useEffect(() => {
    if (!router.isReady) return;

    const currentPath = router.asPath;
    const currentLocale = locale || "id";

    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", currentLocale);
    }

    i18n.changeLanguage(currentLocale);

    if (
      currentLocale === "id" &&
      !currentPath.startsWith("/id") &&
      !currentPath.startsWith("/en")
    )
      return;
    if (currentLocale !== "id" && currentPath.startsWith(`/${currentLocale}`))
      return;

    if (
      currentLocale === "id" &&
      (currentPath.startsWith("/id/") || currentPath === "/id")
    ) {
      const newPath = currentPath.replace(/^\/id(\/|$)/, "/") || "/";
      if (newPath !== currentPath) {
        router.replace(newPath, undefined, { locale: "id", shallow: true });
      }
      return;
    }

    if (currentLocale !== "id") {
      const cleanPath = currentPath.startsWith("/id/")
        ? currentPath.replace(/^\/id/, "")
        : currentPath.startsWith("/")
        ? currentPath
        : `/${currentPath}`;

      const newPath = `/${currentLocale}${cleanPath === "/" ? "" : cleanPath}`;

      if (newPath !== currentPath) {
        router.replace(newPath, undefined, {
          locale: currentLocale,
          shallow: true,
        });
      }
    }
  }, [router.isReady, locale, router.asPath, i18n, router]);

  return (
    <>
      {/* ✅ Google Tag (gtag.js) */}
      {GA_ID ? (
        <>
          <Script
            id="gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              // biar gak double pageview (kita track manual via router)
              gtag('config', '${GA_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}

      <LoadingScreen show={loading} />
      {!loading && <Component {...pageProps} />}
      <ScrollToTop />
    </>
  );
}

export default appWithTranslation(App, nextI18NextConfig);
