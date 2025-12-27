import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { appWithTranslation, useTranslation } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import ScrollToTop from "@/components/atoms/ScrollToTop";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Optional: biar TS gak error pas akses window.gtag
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

  // ✅ Track GA4 page_view on route change (SPA)
  useEffect(() => {
    if (!GA_ID) return;
    if (typeof window === "undefined") return;

    // Stub gtag kalau script belum keburu ready (aman)
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    const pageview = (url: string) => {
      window.gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
    };

    // initial pageview
    pageview(window.location.pathname + window.location.search);

    const handleRoute = (url: string) => pageview(url);

    router.events.on("routeChangeComplete", handleRoute);
    return () => {
      router.events.off("routeChangeComplete", handleRoute);
    };
  }, [router.events]);

  // ✅ Handle loading screen (rapihin: satu kali aja biar ga dobel listener)
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    const initialLoad = setTimeout(() => setLoading(false), 1000);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
      clearTimeout(initialLoad);
    };
  }, [router.events]);

  // ✅ Handle locale changes and URL consistency (punya lu, gue biarin)
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
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              // penting: matiin auto page_view, kita manual biar SPA akurat
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
