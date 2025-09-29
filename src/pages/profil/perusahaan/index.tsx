import { FaBullseye, FaChartLine, FaHandshake, FaUsers, FaShieldAlt, FaGraduationCap } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import ProfilContainer from "@/components/templates/PageContainer/Container";
import PageTemplate from "@/components/templates/PageTemplate";
import Image from "next/image";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['profil_perusahaan', 'common', 'footer'])),
    },
  };
};

export default function ProfilPerusahaan() {
  const { t } = useTranslation('profil_perusahaan');
  
  // Definisikan tipe untuk item visi misi
  type VisiMisiItem = {
    icon: React.ReactNode;
    title: string;
    description?: string;
    items: string[];
    bgColor: string;
  };

  // Dapatkan data misi terlebih dahulu
  const misiItems = t('sections.mission.items', { returnObjects: true });
  
  const visiMisiItems: VisiMisiItem[] = [
    {
      icon: <FaBullseye className="text-3xl text-blue-600" />,
      title: t('sections.vision.title'),
      description: t('sections.vision.description'),
      items: [],
      bgColor: "bg-gray-50"
    },
    {
      icon: <FaChartLine className="text-3xl text-green-600" />,
      title: t('sections.mission.title'),
      description: '',
      items: Array.isArray(misiItems) ? misiItems : [],
      bgColor: "bg-gray-50"
    }
  ];

  // Definisikan tipe untuk nilai perusahaan
  type NilaiPerusahaan = {
    icon: React.ReactNode;
    title: string;
    description: string;
  };

  const nilaiPerusahaan: NilaiPerusahaan[] = [
    {
      icon: <FaHandshake className="text-2xl text-yellow-600" />,
      title: t('sections.values.items.integrity.title'),
      description: t('sections.values.items.integrity.description')
    },
    {
      icon: <FaUsers className="text-2xl text-purple-600" />,
      title: t('sections.values.items.customerSatisfaction.title'),
      description: t('sections.values.items.customerSatisfaction.description')
    },
    {
      icon: <FaShieldAlt className="text-2xl text-red-600" />,
      title: t('sections.values.items.compliance.title'),
      description: t('sections.values.items.compliance.description')
    },
    {
      icon: <FaGraduationCap className="text-2xl text-indigo-600" />,
      title: t('sections.values.items.innovation.title'),
      description: t('sections.values.items.innovation.description')
    }
  ];

  return (
    <PageTemplate title={t('pageTitle')}>
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
        <ProfilContainer title="PT. EQUITYWORLD FUTURES">
          {/* Tentang Kami */}
          <section className="mb-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {t('sections.about.title')}
              </h2>
              <div className="prose max-w-none text-gray-700">
                <p className="text-lg leading-relaxed">
                  {t('sections.about.description1')}
                </p>
                <p className="mt-4 text-lg leading-relaxed">
                  {t('sections.about.description2')}
                </p>
              </div>
            </div>
          </section>

          {/* Visi & Misi */}
          <section className="grid md:grid-cols-2 gap-8 mb-16">
            {visiMisiItems.map((item, index) => (
              <div key={index} className={`${item.bgColor} rounded-xl p-6 shadow-md`}>
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                </div>
                {item.description && (
                  <p className="text-gray-700 mt-2">{item.description}</p>
                )}
                {Array.isArray(item.items) && item.items.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {(item.items as unknown as string[]).map((misi: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span className="text-gray-700">{misi}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>

          {/* Nilai-Nilai Perusahaan */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {t('sections.values.title')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nilaiPerusahaan.map((nilai, index) => (
                <div key={index} className="bg-gray-50 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {nilai.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {nilai.title}
                  </h4>
                  <p className="text-gray-600">
                    {nilai.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </ProfilContainer>
      </div>
    </PageTemplate>
  );
}
