import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ProfilContainer from "@/components/templates/PageContainer/Container";
import PageTemplate from "@/components/templates/PageTemplate";
import Image from "next/image";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['legalitas_bisnis', 'common', 'footer'])),
    },
  };
}

type LegalitasItem = {
  title: string;
  description: string;
  icon: string;
};

export default function LegalitasBisnis() {
  const { t } = useTranslation('legalitas_bisnis');
  const legalitasItems = t('legalitasItems', { returnObjects: true }) as LegalitasItem[];

  return (
    <PageTemplate 
      title={t('pageTitle')}
      description={t('pageDescription')}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto">
        <ProfilContainer title={t('pageTitle')}>
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12 relative overflow-hidden border-l-4 border-ewf-orange">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-50 rounded-full opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {t('aboutTitle')}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('aboutDescription')}
              </p>
            </div>
          </div>

          {/* Legalitas Items */}
          <div className="space-y-6 mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8 relative">
              <span className="relative z-10 px-4 bg-white">
                {t('importantNotice.title')}
              </span>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {Array.isArray(legalitasItems) && legalitasItems.map((item: LegalitasItem, index: number) => (
                <div 
                  key={index}
                  className="group bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-ewf-orange/30"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-500 text-xl">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-ewf-orange transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ProfilContainer>
      </div>
    </PageTemplate>
  );
}