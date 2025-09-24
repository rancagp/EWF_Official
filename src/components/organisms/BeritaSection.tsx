import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import NewsCard, { NewsCardVariant } from "@/components/moleculs/Newscard";
import { NewsItem, fetchFeaturedNews } from '@/services/newsService';

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
  // Gunakan base URL yang benar untuk gambar
  return `https://portalnews.newsmaker.id/${imagePath.replace(/^\/+/, '')}`;
};

interface BeritaSectionProps {
    limit?: number;
    showHeader?: boolean;
    className?: string;
}

export default function BeritaSection({ className, limit = 6, showHeader = true }: BeritaSectionProps) {
    const { t } = useTranslation('berita');
    const router = useRouter();
    const { locale } = router;
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadNews = async () => {
            try {
                setIsLoading(true);
                // Pastikan berita diurutkan berdasarkan created_at descending (terbaru dulu)
                const featuredNews = await fetchFeaturedNews(limit);
                // Urutkan ulang di sisi klien untuk memastikan
                const sortedNews = [...featuredNews].sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setNews(sortedNews);
                setError(null);
            } catch (err) {
                console.error('Error loading news:', err);
                setError('Gagal memuat berita. Silakan coba lagi nanti.');
            } finally {
                setIsLoading(false);
            }
        };

        loadNews();
    }, [limit]);

    return (
        <section className={`${className} relative py-16 sm:py-4`}>
            {/* Background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-gradient-to-r from-[#F2AC59]/5 to-[#e09c4a]/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {showHeader && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                        <div className="flex-1 max-w-3xl">
                            <div className="flex flex-col space-y-4">
                                <span className="inline-flex items-center w-fit px-4 py-2 text-xs font-bold tracking-wide uppercase text-[#4C4C4C] bg-[#F2AC59]/10 rounded-full">
                                    <span className="w-2 h-2 bg-[#F2AC59] rounded-full mr-2"></span>
                                    {t('latestUpdate')}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent whitespace-nowrap">
                                    {t('title')}
                                </h2>
                                <div className="w-32 h-1.5 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] rounded-full"></div>
                                {/* Mobile View All Button */}
                                <div className="md:hidden w-full pt-4">
                                    <Link 
                                        href="/analisis/berita" 
                                        className="w-full flex justify-center px-6 py-3 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] hover:from-[#e09c4a] hover:to-[#d08b3a] text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                                    >
                                        {t('viewAllNews')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {/* Desktop View All Button */}
                        <div className="hidden md:flex items-center h-full mt-6">
                            <Link 
                                href="/analisis/berita" 
                                className="px-8 py-3.5 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] hover:from-[#e09c4a] hover:to-[#d08b3a] text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap self-center"
                            >
                                {t('viewAllNews')}
                            </Link>
                        </div>
                    </div>
                )}
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Loading state untuk 2 berita besar */}
                    <div className="lg:col-span-2 row-span-2 animate-pulse">
                        <div className="h-64 md:h-80 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    </div>
                    <div className="lg:col-span-2 row-span-2 animate-pulse">
                        <div className="h-64 md:h-80 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    </div>
                    {/* Loading state untuk 4 berita kecil */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-40 bg-gray-200 rounded-lg mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* 2 Berita besar di atas */}
                    {news.length > 0 && (
                        <div className="lg:col-span-2 row-span-2">
                            <NewsCard 
                                variant="large" 
                                title={news[0].title}
                                content={news[0].content}
                                date={news[0].created_at}
                                slug={news[0].slug}
                                img={getFullImageUrl(news[0].images)}
                                className="h-full"
                            />
                        </div>
                    )}
                    
                    {news.length > 1 && (
                        <div className="lg:col-span-2 row-span-2">
                            <NewsCard 
                                variant="large" 
                                title={news[1].title}
                                content={news[1].content}
                                date={news[1].created_at}
                                slug={news[1].slug}
                                img={getFullImageUrl(news[1].images)}
                                className="h-full"
                            />
                        </div>
                    )}
                    
                    {/* 4 Berita kecil di bawah */}
                    {news.slice(2, 6).map((item) => (
                        <div key={item.id} className="lg:col-span-1">
                            <NewsCard 
                                variant="default"
                                title={item.title}
                                content={item.content}
                                date={item.created_at}
                                slug={item.slug}
                                img={getFullImageUrl(item.images)}
                                className="h-full"
                            />
                        </div>
                    ))}
                </div>
            )}
            </div>
        </section>    
    );
}
