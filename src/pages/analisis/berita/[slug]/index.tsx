import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageTemplate from '@/components/templates/PageTemplate';
import Container from '@/components/templates/PageContainer/Container';
import NotFound from '@/components/moleculs/NotFound';
import { fetchNews, fetchNewsDetail } from '@/services/newsService';
import { NewsItem } from '@/services/newsService';
import Image from 'next/image';
import Link from 'next/link';

export async function getServerSideProps({ locale, params }: { locale: string; params: { slug: string } }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', [
        'common',
        'berita',
        'footer',
      ])),
    },
  };
}

// Fungsi untuk mendapatkan URL gambar yang lengkap
// Mengambil gambar ketiga (indeks 2) atau keempat (indeks 3) dari API
const getFullImageUrl = (images: string[] | undefined): string => {
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

export default function BeritaDetail() {
    const router = useRouter();
    const { slug } = router.query;
    const { t, i18n } = useTranslation(['berita', 'common']);
    
    // Ensure language is set on component mount
    useEffect(() => {
        if (router.locale) {
            i18n.changeLanguage(router.locale);
        }
    }, [router.locale, i18n]);
    const [berita, setBerita] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedBerita, setRelatedBerita] = useState<NewsItem[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(true);

    useEffect(() => {
        const loadBerita = async () => {
            if (!slug) return;
            
            try {
                setLoading(true);
                const data = await fetchNewsDetail(slug as string);
                if (!data) {
                    throw new Error('Berita tidak ditemukan');
                }
                setBerita(data);
                setError(null);
            } catch (err) {
                console.error('Error loading news:', err);
                setError('Gagal memuat detail berita');
            } finally {
                setLoading(false);
            }
        };

        loadBerita();
    }, [slug]);

    // Fungsi untuk mengambil berita terkait
    const fetchRelatedBerita = useCallback(async () => {
        if (!slug) return;
        
        try {
            setLoadingRelated(true);
            // Mengambil 10 berita terbaru untuk memastikan cukup berita setelah difilter
            const response = await fetchNews(1, 10, 'created_at', 'desc');
            
            if (!response || !response.data) {
                console.error('Response tidak valid:', response);
                return;
            }
            
            console.log('Berita yang diterima:', response.data);
            
            // Urutkan berdasarkan created_at terbaru
            const sortedBerita = [...response.data].sort((a: NewsItem, b: NewsItem) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            console.log('Berita setelah diurutkan:', sortedBerita);
            
            // Filter berita saat ini dari daftar related berita
            const filteredBerita = sortedBerita
                .filter((item: NewsItem) => item?.slug && item.slug !== slug)
                .slice(0, 3); // Ambil 3 berita terbaru setelah difilter
            
            console.log('Berita setelah difilter:', filteredBerita);
            
            setRelatedBerita(filteredBerita);
        } catch (error) {
            console.error('Gagal mengambil berita terkait:', error);
            setRelatedBerita([]);
        } finally {
            setLoadingRelated(false);
        }
    }, [slug]);
    
    // Panggil fungsi fetchRelatedBerita saat komponen dimount
    useEffect(() => {
        fetchRelatedBerita();
    }, [fetchRelatedBerita]);

    const formatReleaseDateTime = (inputDate: string) => {
        if (!inputDate) return '';
        
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta",
        };
        
        const language = i18n.language || router.locale || 'id';
        const parsedDate = new Date(inputDate);
        
        // Fallback if date is invalid
        if (isNaN(parsedDate.getTime())) {
            return inputDate;
        }
        
        const localeName = language === 'en' ? 'en-US' : 'id-ID';
        const datePart = parsedDate.toLocaleDateString(localeName, dateOptions);
        const timePart = parsedDate.toLocaleTimeString(localeName, timeOptions);
        return `${datePart} • ${timePart} WIB`;
    };


    if (loading) {
        return (
            <PageTemplate title={t('loading', 'Memuat...')}>
                <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
                    <Container title={t('title', 'Berita & Analisis Terbaru')}>
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden bg-gray-200"></div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </Container>
                </div>
            </PageTemplate>
        );
    }

    if (error || !berita) {
        return (
            <PageTemplate title="Berita Tidak Ditemukan">
                <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
                    <Container title={t('title', 'Berita & Analisis Terbaru')}>
                        <div className="text-center">
                            <NotFound />
                            <p className="mt-4 text-gray-600">Maaf, berita yang Anda cari tidak ditemukan.</p>
                            <div className="mt-6">
                                <a 
                                    href="/analisis/berita" 
                                    className='inline-block bg-[#F2AC59] hover:bg-[#e09c4a] px-6 py-2 rounded-md text-white transition-all duration-300'
                                >
                                    &#129032; Kembali ke Halaman Berita
                                </a>
                            </div>
                        </div>
                    </Container>
                </div>
            </PageTemplate>
        );
    }

    // Pastikan berita ada sebelum merender
    if (!berita) return null;

    return (
        <PageTemplate title={berita.title}>
            <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
                <Container title={t('title', 'Berita Terbaru')}>
                    <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden mb-8">
                        <Image
                            src={getFullImageUrl(berita.images)}
                            alt={berita.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="prose max-w-none">
                        <div className="flex items-center text-gray-500 text-sm mb-6">
                            <span>{formatReleaseDateTime(berita.created_at)}</span>
                            {berita.kategori?.name && (
                                <span className="mx-2">•</span>
                            )}
                            {berita.kategori?.name && (
                                <span className="text-[#F2AC59] font-medium">
                                    {berita.kategori.name}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            {berita.title}
                        </h1>
                        <div className="w-full">
                            <div 
                                className="prose prose-lg max-w-none text-left mx-0"
                                style={{
                                    color: '#000000',
                                    lineHeight: '1.8',
                                    fontSize: '1.125rem',
                                    textAlign: 'left',
                                    maxWidth: 'none',
                                    width: '100%'
                                }}
                                dangerouslySetInnerHTML={{ 
                                    __html: berita.content 
                                        .replace(/<p(\s+[^>]*)?>/g, (match, p1) => {
                                            // Jika paragraf kosong atau hanya berisi whitespace, abaikan
                                            if (/^\s*$/.test(match)) return match;
                                            // Tambahkan class untuk spasi yang lebih besar
                                            return `<p class="mb-4 leading-relaxed"${p1 || ''}>`;
                                        })
                                        .replace(/<h2/g, '<h2 class="text-2xl font-bold mt-10 mb-4 text-gray-800"')
                                        .replace(/<h3/g, '<h3 class="text-xl font-semibold mt-8 mb-3 text-gray-800"')
                                        .replace(/<ul/g, '<ul class="list-disc pl-6 space-y-2 my-6"')
                                        .replace(/<ol/g, '<ol class="list-decimal pl-6 space-y-2 my-6"')
                                        .replace(/<a/g, '<a class="text-[#F2AC59] hover:text-[#e09c4a] hover:underline"')
                                        .replace(/<blockquote/g, '<blockquote class="border-l-4 border-[#F2AC59] pl-4 italic my-6 text-gray-600"')
                                        .replace(/<img/g, '<img class="my-6 rounded-lg shadow-md w-full h-auto"')
                                        .replace(/<table/g, '<table class="min-w-full divide-y divide-gray-200 my-6"')
                                        .replace(/<th/g, '<th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"')
                                        .replace(/<td/g, '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"')
                                }} 
                            />
                        </div>
                        
                        {/* Another Posts Section */}
                        <div className="mt-10 pt-6 border-t border-gray-200 w-full">
                            <div className="flex flex-row justify-between items-center mb-6 sm:mb-8 gap-2 sm:gap-4">
                                <div className="relative flex-shrink">
                                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 inline-block relative pb-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none">
                                        {t('latest_news', 'Latest News')}
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] rounded-full"></span>
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => {
                                        const lang = i18n.language || router.locale || 'id';
                                        router.push(`/${lang}/analisis/berita`);
                                    }}
                                    className="px-3 py-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] hover:from-[#e09c4a] hover:to-[#d08b3a] text-white text-xs sm:text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center whitespace-nowrap flex-shrink-0"
                                >
                                    <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                    </svg>
                                    {t('view_all_news', 'View All News')}
                                </button>
                            </div>
                            {loadingRelated ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="animate-pulse">
                                            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                    {relatedBerita.map((item) => (
                                        <div key={item.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-[#F2AC59]/30">
                                            <Link 
                                                href={`/analisis/berita/${item.slug}`}
                                                className="block h-full flex flex-col"
                                            >
                                                <div className="relative h-48 w-full overflow-hidden">
                                                    {item.images?.[0] ? (
                                                        <Image
                                                            src={`https://portalnews.newsmaker.id/${item.images[0].replace(/^\/+/, '')}`}
                                                            alt={item.titles?.kpf || item.title || 'Berita terkait'}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.onerror = null;
                                                                target.src = 'https://via.placeholder.com/300x200?text=Gambar+Tidak+Tersedia';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gray-200 group-hover:scale-105 transition-transform duration-300"></div>
                                                    )}
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="mb-2">
                                                        {item.kategori?.name && (
                                                            <div className="text-xs font-medium text-[#F2AC59] mb-1">
                                                                {item.kategori.name}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-500">
                                                            {formatReleaseDateTime(item.created_at)}
                                                        </div>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-[#F2AC59] transition-colors line-clamp-2" style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        textOverflow: 'ellipsis',
                                                        minHeight: '3em',
                                                        lineHeight: '1.5em',
                                                        overflow: 'hidden',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        {item.titles?.kpf || item.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 line-clamp-3" style={{
                                                        marginTop: 'auto',
                                                        paddingTop: '0.5rem',
                                                        borderTop: '1px solid #f3f4f6'
                                                    }}>
                                                        {item.content?.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </Container>
            </div>
        </PageTemplate>
    );
}
