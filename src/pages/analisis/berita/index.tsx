import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageTemplate from '@/components/templates/PageTemplate';
import Container from '@/components/templates/PageContainer/Container';
import NewsCard from '@/components/moleculs/Newscard';
import { fetchNews, NewsItem } from '@/services/newsService';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['berita', 'common', 'footer'])),
    },
  };
};

// Fungsi untuk mendapatkan URL gambar yang lengkap
// Mengambil gambar ketiga (indeks 2) atau keempat (indeks 3) dari API
const getFullImageUrl = (images: string[] | undefined) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return '/images/placeholder-news.jpg';
  }
  
  // Ambil gambar ketiga (indeks 2) atau keempat (indeks 3) dari API
  const imagePath = images[2] || images[3] || images[0]; // Fallback ke gambar pertama jika indeks 2 dan 3 tidak ada
  
  if (!imagePath) return '/images/placeholder-news.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  // Pastikan URL gambar menggunakan domain yang benar
  return `https://portalnews.newsmaker.id/${imagePath.replace(/^\/+/, '')}`;
};

export default function Berita() {
  const { t } = useTranslation('berita');
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 9
  });

  const loadNews = async (page = 1) => {
    try {
      setLoading(true);
      // Pastikan berita diurutkan berdasarkan created_at descending (terbaru dulu)
      const response = await fetchNews(page, pagination.perPage, 'created_at', 'desc');
      
      // Pastikan data diurutkan di sisi klien juga sebagai cadangan
      const sortedData = [...response.data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setNews(sortedData);
      setPagination({
        currentPage: response.current_page,
        totalPages: response.last_page,
        totalItems: response.total,
        perPage: response.per_page
      });
      setError(null);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Gagal memuat daftar berita. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handlePageChange = (page: number) => {
    loadNews(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && news.length === 0) {
    return (
      <PageTemplate title={t('title', 'Berita Terbaru')}>
        <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
          <Container title={t('title', 'Berita Terbaru')}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
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
    <PageTemplate title={t('title', 'Berita Terbaru')}>
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
        <Container title={t('title', 'Berita Terbaru')}>
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => loadNews()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((berita, index) => (
                  <div 
                    key={berita.id}
                    className="transform transition-transform duration-300 hover:-translate-y-1"
                    data-aos="fade-up"
                    data-aos-delay={`${(index % 3) * 100}`}
                  >
                    <NewsCard
                      key={berita.id}
                      title={berita.title}
                      date={berita.created_at}
                      content={berita.content?.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'}
                      slug={berita.slug}
                      img={getFullImageUrl(berita.images)}
                    />
                  </div>
                ))}
              </div>
              
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center space-x-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === pagination.currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-md ${
                          isActive 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={isActive}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                    <span className="px-2 py-2">...</span>
                  )}
                  {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 1 && (
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {pagination.totalPages}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </Container>
      </div>
    </PageTemplate>
  );
}
