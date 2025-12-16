import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import PageTemplate from '@/components/templates/PageTemplate';
import Container from '@/components/templates/PageContainer/Container';
import Head from 'next/head';

// Lazy load the modal to improve initial page load
const ApplyModal = dynamic(
  () => import('@/components/molecules/ApplyModal').then((mod) => mod.default),
  { ssr: false }
);

interface CareerDetail {
  id: number;
  posisi: string;
  nama_kota: string;
  slug: string;
  responsibilities: string;
  requirements: string;
  created_at: string;
  updated_at: string;
}

interface CareerDetailProps {
  career: CareerDetail | null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Di production, ambil daftar slug dari API
  const paths = [
    { params: { slug: 'frontend-developer' } },
    { params: { slug: 'backend-developer' } },
    { params: { slug: 'ui-ux-designer' } },
  ];

  return {
    paths,
    fallback: 'blocking', // Tampilkan 404 jika halaman tidak ditemukan
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug;
  
  // Data dummy untuk pengujian
  const dummyCareers = [
    {
      id: 1,
      posisi: 'Frontend Developer',
      nama_kota: 'Jakarta',
      slug: 'frontend-developer',
      responsibilities: 'Mengembangkan antarmuka pengguna menggunakan React.js dan Next.js',
      requirements: 'React,Next.js,JavaScript,TypeScript',
      created_at: '2023-12-16T10:00:00.000Z',
      updated_at: '2023-12-16T10:00:00.000Z',
    },
    {
      id: 2,
      posisi: 'Backend Developer',
      nama_kota: 'Bandung',
      slug: 'backend-developer',
      responsibilities: 'Mengembangkan dan memelihara API menggunakan Laravel',
      requirements: 'PHP,Laravel,MySQL,API Development',
      created_at: '2023-12-15T09:30:00.000Z',
      updated_at: '2023-12-15T09:30:00.000Z',
    },
    {
      id: 3,
      posisi: 'UI/UX Designer',
      nama_kota: 'Surabaya',
      slug: 'ui-ux-designer',
      responsibilities: 'Mendesain antarmuka pengguna yang menarik dan mudah digunakan',
      requirements: 'Figma,Adobe XD,UI Design,User Research',
      created_at: '2023-12-14T14:15:00.000Z',
      updated_at: '2023-12-14T14:15:00.000Z',
    },
  ];

  // Cari karier berdasarkan slug
  const career = dummyCareers.find((c) => c.slug === slug) || null;

  // Jika karier tidak ditemukan, kembalikan 404
  if (!career) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common', 'footer'])),
      career,
    },
    revalidate: 60, // Re-generate halaman setiap 60 detik
  };
};

const CareerDetail: React.FC<CareerDetailProps> = ({ career }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Tampilkan loading jika halaman sedang digenerate
  if (router.isFallback) {
    return (
      <PageTemplate title={t('loading', 'Memuat...')}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </PageTemplate>
    );
  }

  // Jika karier tidak ditemukan
  if (!career) {
    return (
      <PageTemplate title={t('not_found', 'Tidak Ditemukan')}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {t('career_not_found', 'Lowongan tidak ditemukan')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('career_not_found_message', 'Maaf, lowongan yang Anda cari tidak dapat ditemukan.')}
            </p>
            <button
              onClick={() => router.push('/karier')}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              {t('back_to_careers', 'Kembali ke Daftar Lowongan')}
            </button>
          </div>
        </div>
      </PageTemplate>
    );
  }

  // Format tanggal
  const formattedDate = new Date(career.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Head>
        <title>{`${career.posisi} - ${career.nama_kota} | EWF`}</title>
      </Head>
      <PageTemplate title={t('karier.title', 'Lowongan Pekerjaan')}>
        <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
          <Container title={t('join_our_team', 'Bergabunglah dengan Tim Kami')}>
            <div className="max-w-4xl mx-auto">
              {/* Header Pekerjaan */}
              <div className="mb-10 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-[#4C4C4C] mb-3">
                  {career.posisi}
                </h1>
                <div className="flex items-center justify-center space-x-4 text-[#4C4C4C] mb-6">
                  <span className="flex items-center px-3 py-1 bg-gray-50 rounded-full">
                    <svg
                      className="w-4 h-4 mr-1.5 text-[#F2AC59]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {career.nama_kota}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">
                    <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Card Informasi */}
              <div className="space-y-8">
                {/* Responsibilities */}
                <div className="bg-white p-6 border-l-4 border-[#4C4C4C] shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#FEF6E8] flex items-center justify-center text-[#4C4C4C] mr-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#4C4C4C] mb-3">
                        {t('responsibilities', 'Tanggung Jawab')}
                      </h2>
                      <div className="text-[#4C4C4C] leading-relaxed space-y-3">
                        {career.responsibilities.split('.').filter(Boolean).map((item, index) => (
                          <p key={index} className="flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F2AC59] mt-2.5 mr-2 flex-shrink-0"></span>
                            {item.trim()}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="bg-white p-6 border-l-4 border-[#4C4C4C] shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-[#4C4C4C] mr-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#4C4C4C] mb-3">
                        {t('qualifications', 'Kualifikasi')}
                      </h2>
                      <ul className="space-y-3">
                        {career.requirements.split(',').map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-[#FEF6E8] text-[#F2AC59] rounded-full mr-3 flex-shrink-0">
                              <span className="text-xs font-medium">{index + 1}</span>
                            </span>
                            <span className="text-[#4C4C4C]">{req.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => router.push('/karier')}
                  className="px-8 py-3 border-2 border-[#4C4C4C] rounded-md text-[#4C4C4C] bg-white hover:bg-gray-50 hover:border-[#F2AC59] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F2AC59] transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('back', 'Kembali')}
                </button>
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-8 py-3 border-2 border-transparent rounded-md text-white bg-[#F2AC59] hover:bg-[#e09b4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F2AC59] transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  {t('apply_now', 'Lamar Sekarang')}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </Container>
        </div>
      </PageTemplate>
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        position={career.posisi}
        location={career.nama_kota}
      />
    </>
  );
};

export default CareerDetail;