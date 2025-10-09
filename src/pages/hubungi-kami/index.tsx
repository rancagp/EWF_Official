import { FaMapMarkerAlt, FaPhone, FaFax, FaEnvelope, FaExternalLinkAlt, FaHeadset } from 'react-icons/fa';
import { useTranslation, TFunction } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import PageTemplate from "@/components/templates/PageTemplate";
import ProfilContainer from "@/components/templates/PageContainer/Container";

export const getStaticProps: GetStaticProps = async ({ locale = 'id' }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'hubungi-kami', 'footer'])),
  },
});

interface Kantor {
  kota: string;
  alamat: string;
  telepon: string;
  fax: string;
  email?: string;
  mapLink: string;
}

const kantorPusat: Kantor = {
  kota: "Kantor Pusat",
  alamat: "Sahid Sudirman Center Lt. 9 Unit C,D,G,H & Lt. 21 Unit A\nJl. Jend. Sudirman No.86, Jakarta Pusat 10220",
  telepon: "+62 21 27889280 (Hunting)",
  fax: "+62 21 27889277",
  email: "corporate@equityworld-futures.co.id",
  mapLink: "https://maps.google.com/?q=Sahid+Sudirman+Center+Jakarta"
};

const kantorCabang: Kantor[] = [
  {
    kota: "SURABAYA TRILLIUM",
    alamat: "Trillium Office & Residence, Lt.2 & 3\nJl. Pemuda No. 108-116, Surabaya 60271",
    telepon: "+62 31 6000 3788 (Hunting)",
    fax: "+62 31 6000 3688",
    mapLink: "https://maps.google.com/?q=Trillium+Office+Residence+Surabaya"
  },
  {
    kota: "MANADO",
    alamat: "Kompleks Ruko Mega Mas Blok 1 D1 No. 24 - 25\nJl. Piere Tendean, Manado 95111",
    telepon: "+62 431 879618 (Hunting)",
    fax: "+62 431 879610",
    mapLink: "https://maps.google.com/?q=Ruko+Mega+Mas+Manado"
  },
  {
    kota: "JAKARTA",
    alamat: "Gedung Cyber 2 Lt. 19\nJl. HR. Rasuna Said Blok X-5 No. 13, Jakarta Selatan 12950",
    telepon: "+62 21 2902 1661 (Hunting)",
    fax: "+62 21 2902 1675",
    mapLink: "https://maps.google.com/?q=Gedung+Cyber+2+Jakarta"
  },
  {
    kota: "SEMARANG",
    alamat: "Rukan Pemuda Mas, Blok A Kav. 12 - 13\nJl. Pemuda No. 150, Semarang 50132",
    telepon: "+62 24 3520226 (Hunting)",
    fax: "+62 24 3520227",
    mapLink: "https://maps.google.com/?q=Rukan+Pemuda+Mas+Semarang"
  },
  {
    kota: "SURABAYA PRAXIS",
    alamat: "Gedung Praxis Lt.5 Unit No.5p. 33,35,36\nJl. Sono Kembang 4-6, Embong Kaliasin, Kec. Genteng, Surabaya 60271",
    telepon: "+62 31 99255088",
    fax: "+62 31 99255066",
    mapLink: "https://maps.google.com/?q=Gedung+Praxis+Surabaya"
  },
  {
    kota: "CIREBON",
    alamat: "Perkantoran CSB Mall, Yellow Ribbon 15-18\nJl. DR.Cipto Mangunkusumo Pekiringan, Kesambi, Cirebon 45131",
    telepon: "+62 231 8291700",
    fax: "+62 231 8291498",
    mapLink: "https://maps.google.com/?q=CSB+Mall+Cirebon"
  }
];

interface OfficeProps {
  office: typeof kantorPusat | Kantor;
  isHeadOffice?: boolean;
  t: TFunction;
}

const OfficeCard = ({ office, isHeadOffice = false, t }: OfficeProps) => (
  <div className="bg-white p-6 rounded-lg shadow">
    {isHeadOffice && (
      <p className="font-semibold mb-2">{t('companyName')}</p>
    )}
    <div className="space-y-2">
      <div className="flex items-start">
        <FaMapMarkerAlt className="text-[#F2AC59] mt-0.5 mr-1.5 flex-shrink-0" size={14} />
        <p className="whitespace-pre-line text-gray-700">{office.alamat}</p>
      </div>
      <p className="text-gray-700">
        <span className="font-medium">{t('phone')}:</span> {office.telepon}
      </p>
      <p className="text-gray-700">
        <span className="font-medium">{t('fax')}:</span> {office.fax}
      </p>
      {office.email && (
        <p className="text-gray-700">
          <span className="font-medium">{t('email')}:</span>{' '}
          <a href={`mailto:${office.email}`} className="text-[#F2AC59] hover:underline">
            {office.email}
          </a>
        </p>
      )}
    </div>
  </div>
);

export default function HubungiKami() {
  const { t } = useTranslation('hubungi-kami');
  
  return (
    <PageTemplate title={t('title')}>
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
        <ProfilContainer title={t('title')}>
        
        {/* Head Office */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('headOffice')}
          </h2>
          <OfficeCard office={kantorPusat} isHeadOffice t={t} />
        </div>



        {/* Branch Offices */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
            {t('branchOffice')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kantorCabang.map((cabang, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{cabang.kota}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-[#F2AC59] mt-0.5 mr-1.5 flex-shrink-0" size={14} />
                    <p className="whitespace-pre-line text-gray-700">{cabang.alamat}</p>
                  </div>
                  <p className="text-gray-700">
                    <span className="font-medium">{t('phone')}:</span> {cabang.telepon}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">{t('fax')}:</span> {cabang.fax}
                  </p>
                  <a 
                    href={cabang.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#F2AC59] hover:underline text-xs mt-1"
                  >
                    {t('viewOnMap', 'Lihat di Peta')} <FaExternalLinkAlt className="ml-1" size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Online Complaint */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {t('complaintTitle')}
          </h3>
          <p className="text-gray-700 mb-4">
            {t('complaintDescription')}
          </p>
          <a 
            href="mailto:customer.care@equityworld-futures.co.id"
            className="inline-flex items-center bg-[#F2AC59] hover:bg-[#e09c4a] text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            <FaEnvelope className="mr-2" /> {t('sendEmail')}
          </a>
        </div>
        </ProfilContainer>
      </div>
    </PageTemplate>
  );
}
