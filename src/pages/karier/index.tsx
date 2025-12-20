import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import PageTemplate from '@/components/templates/PageTemplate';
import Container from '@/components/templates/PageContainer/Container';
import CareerCard from '@/components/molecules/CareerCard';

interface Career {
  id: number;
  nama_kota: string;
  posisi: string;
  slug: string;
  responsibilities: string;
  requirements: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface CareersPageProps {
  initialCareers: Career[];
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/karier`);
    const careers = res.data.data;

    return {
      props: {
        ...(await serverSideTranslations(locale || 'id', ['common', 'footer'])),
        initialCareers: careers,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching careers:', error);
    return {
      props: {
        ...(await serverSideTranslations(locale || 'id', ['common', 'footer'])),
        initialCareers: [],
      },
    };
  }
};

const Karier = ({ initialCareers = [] }: { initialCareers?: Career[] }) => {
  const [careers, setCareers] = useState<Career[]>(initialCareers || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/karier`);
        if (response.data.success) {
          setCareers(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching careers:', err);
        setError('Gagal memuat data lowongan. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCareers();
  }, []);

  const { t } = useTranslation('common');
  const router = useRouter();

  if (isLoading) {
    return (
      <PageTemplate title={t('loading', 'Memuat...')}>
        <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
          <Container title={t('loading', 'Memuat...')}>
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          </Container>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title={t('error', 'Terjadi Kesalahan')}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={t('karier.title', 'Lowongan Pekerjaan')}>
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
        <Container title={t('karier.available_positions', 'Lowongan Tersedia')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(careers) && careers.map((career) => (
              <div key={career.id} className="hover:shadow-md transition-shadow duration-300">
                <CareerCard
                  id={career.id}
                  position={career.posisi}
                  location={career.nama_kota}
                  createdAt={career.created_at}
                  slug={career.slug}
                />
              </div>
            ))}
          </div>

          {(!careers || careers.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {t('karier.no_positions', 'Belum ada lowongan tersedia')}
              </h3>
              <p className="text-gray-500">
                {t('karier.check_back_later', 'Silakan periksa kembali di lain waktu.')}
              </p>
            </div>
          )}
        </Container>
      </div>
    </PageTemplate>
  );
}

export default Karier;