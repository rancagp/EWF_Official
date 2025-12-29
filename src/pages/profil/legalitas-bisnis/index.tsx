import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ProfilContainer from "@/components/templates/PageContainer/Container";
import PageTemplate from "@/components/templates/PageTemplate";
import Image from "next/image";

type LegalitasItem = {
  title: string;
  description: string;
  icon: string;
};

type Organization = {
  name: string;
  logo: string;
  url?: string;
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['legalitas_bisnis', 'common', 'footer'])),
    },
  };
}

export default function LegalitasBisnis() {
  const { t } = useTranslation('legalitas_bisnis');
  const legalitasItems = t('legalitasItems', { returnObjects: true }) as LegalitasItem[];
  const supervisedOrganizations: Organization[] = [
    { name: "BAPPEBTI", logo: "/assets/logo-bappebti.png", url: "https://bappebti.go.id/" },
    { name: "Otoritas Jasa Keuangan", logo: "/assets/OJK_Logo.png", url: "https://ojk.go.id/id/Default.aspx" },
    { name: "Bank Indonesia", logo: "/assets/BI_Logo.png", url: "https://www.bi.go.id/id/default.aspx" }
  ];
  const memberOrganizations: Organization[] = [
    { name: "Jakarta Futures Exchange", logo: "/assets/logo-jfx.png", url: "https://jfx.co.id/" },
    { name: "Kliring Berjangka Indonesia", logo: "/assets/logo-kbi.png", url: "https://www.ptkbi.com/index.php" },
    { name: "Asosiasi Perdagangan Berjangka Komoditi Indonesia", logo: "/assets/logo-aspebtindo.png", url: "https://aspebtindo.org/" }
  ];

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

          {/* Regulators and Memberships */}
          <div className="space-y-12 mb-16">
            <div>
              <h2 className="text-xl font-bold text-center text-[#4C4C4C] mb-6 relative">
                <span className="relative z-10 px-3 bg-white">
                  {t('supervisedTitle', 'Berizin dan Diawasi')}
                </span>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supervisedOrganizations.map((org, index) => (
                  <a
                    key={`supervised-${index}`}
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-[#F2AC59]/30"
                  >
                    <div className="relative w-32 h-16">
                      <Image
                        src={org.logo}
                        alt={org.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-center text-[#4C4C4C] mb-6 relative">
                <span className="relative z-10 px-3 bg-white">
                  {t('memberOfTitle', 'Anggota Dari')}
                </span>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {memberOrganizations.map((org, index) => (
                  <a
                    key={`member-${index}`}
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-[#F2AC59]/30"
                  >
                    <div className="relative w-32 h-16">
                      <Image
                        src={org.logo}
                        alt={org.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </a>
                ))}
              </div>
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
