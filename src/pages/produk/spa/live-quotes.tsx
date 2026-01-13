import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MarketTable from '@/components/organisms/MarketTable';
import PageTemplate from '@/components/templates/PageTemplate';
import ProfilContainer from '@/components/templates/PageContainer/Container';

export const getStaticProps: GetStaticProps = async ({ locale = 'id' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'produk', 'market', 'footer'])),
    },
  };
};

export default function LiveQuotesSpaPage() {
  const { t } = useTranslation('produk');
  const { locale } = useRouter();
  const tradingViewLocale = locale === 'id' ? 'id' : 'en';
  const tradingViewSrc =
    `https://s.tradingview.com/embed-widget/advanced-chart/?symbol=OANDA:XAUUSD&interval=D&theme=dark&style=1&locale=${tradingViewLocale}&allow_symbol_change=true&hide_side_toolbar=true&hide_top_toolbar=false&hide_legend=false&hide_volume=true&exclude_studies=STD%3BVolume&details=true&autosize=true&backgroundColor=%230F0F0F&gridColor=rgba(242,242,242,0.06)&timezone=Etc/UTC&studies=STD%3BStochastic_RSI`;

  return (
    <PageTemplate title={t('liveQuotes.pageTitle')}>
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
        <ProfilContainer title={t('liveQuotes.pageTitle')} description={t('liveQuotes.pageSubtitle')}>
          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href="/produk/spa"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#F2AC59] text-white text-sm font-medium hover:opacity-90 transition"
            >
              {t('liveQuotes.backToSpa')}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200 transition"
            >
              {t('liveQuotes.backToHome')}
            </Link>
          </div>

          <MarketTable />

          <div className="mt-10">
            <div className="mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">{t('liveQuotes.chartTitle')}</h2>
              <p className="text-sm text-gray-500">{t('liveQuotes.chartSubtitle')}</p>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-gray-100 bg-[#0F0F0F]">
              <iframe
                allowFullScreen
                className="w-full h-[480px] sm:h-[520px] lg:h-[600px]"
                src={tradingViewSrc}
                title="nm-chart"
                loading="lazy"
              />
            </div>
          </div>
        </ProfilContainer>
      </div>
    </PageTemplate>
  );
}
