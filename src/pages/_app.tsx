import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { appWithTranslation, useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config';
import LoadingScreen from "@/components/organisms/LoadingScreen";
import ScrollToTop from '@/components/atoms/ScrollToTop';

function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { i18n } = useTranslation();
  const { pathname, asPath, query, locale } = router;

  // Handle loading state
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Handle locale changes and URL consistency
  useEffect(() => {
    if (!router.isReady) return;

    const currentPath = router.asPath;
    const currentLocale = locale || 'id';
    
    // Set the language in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', currentLocale);
    }
    
    // Update i18n language
    i18n.changeLanguage(currentLocale);
    
    // Skip if we're already on the correct path
    if (currentLocale === 'id' && !currentPath.startsWith('/id') && !currentPath.startsWith('/en')) return;
    if (currentLocale !== 'id' && currentPath.startsWith(`/${currentLocale}`)) return;

    // For default locale (id), ensure no /id prefix
    if (currentLocale === 'id' && (currentPath.startsWith('/id/') || currentPath === '/id')) {
      const newPath = currentPath.replace(/^\/id(\/|$)/, '/') || '/';
      if (newPath !== currentPath) {
        router.replace(
          newPath,
          undefined,
          { locale: 'id', shallow: true }
        );
      }
      return;
    }
    
    // For non-default locales, ensure they have the correct prefix
    if (currentLocale !== 'id') {
      const cleanPath = currentPath.startsWith('/id/') 
        ? currentPath.replace(/^\/id/, '') 
        : currentPath.startsWith('/')
          ? currentPath
          : `/${currentPath}`;
          
      const newPath = `/${currentLocale}${cleanPath === '/' ? '' : cleanPath}`;
      
      if (newPath !== currentPath) {
        router.replace(
          newPath,
          undefined,
          { locale: currentLocale, shallow: true }
        );
      }
    }
  }, [router.isReady, locale, router.asPath]);

  // Handle loading screen
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    const initialLoad = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
      clearTimeout(initialLoad);
    };
  }, [router]);

  return (
    <>
      <LoadingScreen show={loading} />
      {!loading && <Component {...pageProps} />}
      <ScrollToTop />
    </>
  );
}

export default appWithTranslation(App, nextI18NextConfig);
