import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

export default function LiveQuotesCta() {
  const { t } = useTranslation('market');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500 mb-6">
          {t('lastUpdated')} <span className="text-gray-900">{currentTime || '-'}</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-dashed border-[#F2AC59]/40 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="text-[11px] font-extrabold tracking-[0.22em] text-[#F2AC59] mb-4">
                {t('cta.eyebrow')}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
                {t('cta.headline')}
              </h3>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/produk/spa/live-quotes"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#0B1220] text-white font-semibold shadow hover:opacity-95 transition"
              >
                {t('cta.button')}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
