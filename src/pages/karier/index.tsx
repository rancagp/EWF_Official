import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  status: boolean;
  created_at: string;
  updated_at: string;
}

interface CareersPageProps {
  initialCareers: Career[];
}

// Data dummy untuk pengujian
const dummyCareers = [
  {
    id: 1,
    posisi: 'Frontend Developer',
    nama_kota: 'Jakarta',
    slug: 'frontend-developer',
    responsibilities: 'Mengembangkan antarmuka pengguna menggunakan React.js dan Next.js',
    requirements: 'React,Next.js,JavaScript,TypeScript',
    created_at: '2023-12-16T10:00:00.000Z'
  },
  {
    id: 2,
    posisi: 'Backend Developer',
    nama_kota: 'Bandung',
    slug: 'backend-developer',
    responsibilities: 'Mengembangkan dan memelihara API menggunakan Laravel',
    requirements: 'PHP,Laravel,MySQL,API Development',
    created_at: '2023-12-15T09:30:00.000Z'
  },
  {
    id: 3,
    posisi: 'UI/UX Designer',
    nama_kota: 'Surabaya',
    slug: 'ui-ux-designer',
    responsibilities: 'Mendesain antarmuka pengguna yang menarik dan mudah digunakan',
    requirements: 'Figma,Adobe XD,UI Design,User Research',
    created_at: '2023-12-14T14:15:00.000Z'
  },
  {
    id: 4,
    posisi: 'IT Support',
    nama_kota: 'Surabaya',
    slug: 'ui-ux-designer',
    responsibilities: 'Mendesain antarmuka pengguna yang menarik dan mudah digunakan',
    requirements: 'Figma,Adobe XD,UI Design,User Research',
    created_at: '2023-12-14T14:15:00.000Z'
  }
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  // Gunakan data dummy untuk sementara
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common', 'footer'])),
      initialCareers: dummyCareers, // Gunakan data dummy
    },
    revalidate: 60,
  };

  // Kode asli untuk mengambil dari API (dinonaktifkan sementara)
  /*
  try {
    const res = await fetch('http://localhost:8000/api/karier');
    const careers = await res.json();

    return {
      props: {
        ...(await serverSideTranslations(locale || 'id', ['common', 'footer'])),
        initialCareers: careers.data || [],
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
  */
};

export default function Karier({ initialCareers }: CareersPageProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>(initialCareers);
  const [loading, setLoading] = useState(false);

  if (loading && careers.length === 0) {
    return (
      <PageTemplate title={t('karier.title', 'Lowongan Pekerjaan')}>
        <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
          <Container title={t('karier.title', 'Lowongan Pekerjaan')}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={t('karier.title', 'Lowongan Pekerjaan')}>
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
        <Container title={t('karier.available_positions', 'Lowongan Tersedia')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => (
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

          {careers.length === 0 && (
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