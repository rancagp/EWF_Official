import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NewsCard2 from "@/components/moleculs/NewsCard2";
import Header1 from "@/components/moleculs/Header1";

type Berita = {
    id: number;
    image?: string;  // Mengubah menjadi optional untuk kompatibilitas dengan NewsCard2
    kategori: string;
    status: string;
    judul: string;
    slug: string;
    isi: string;
    created_at: string;
    updated_at: string;
};

// Tambahkan props showHeader
type PengumumanHomeProps = {
    showHeader?: boolean;
    className?: string;
};

export default function PengumumanHome({ showHeader = true, className }: PengumumanHomeProps) {
    const { t, i18n } = useTranslation('pengumuman');
    const router = useRouter();
    const [pengumumanList, setPengumumanList] = useState<Berita[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Debug logging
    useEffect(() => {
        console.log('Current language:', i18n.language);
        console.log('Available resources:', i18n.getResourceBundle(i18n.language, 'pengumuman'));
    }, [i18n.language]);

    useEffect(() => {
        async function fetchBerita() {
            try {
                const response = await fetch("/api/berita");
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data: Berita[] = await response.json();
                
                // Pastikan path gambar lengkap
                const processedData = data.map(item => {
                    // Jika ada image, pastikan URL lengkap
                    let imageUrl = undefined;
                    if (item.image) {
                        if (item.image.startsWith('http')) {
                            imageUrl = item.image;
                        } else {
                            // Pastikan path relatif dimulai dengan /
                            const imagePath = item.image.startsWith('/') ? item.image : `/${item.image}`;
                            imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://kpf-backend.test'}/img/berita${imagePath}`;
                        }
                    }
                    
                    // Debug log untuk setiap item
                    console.log('Processing item:', {
                        id: item.id,
                        originalImage: item.image,
                        processedImage: imageUrl,
                        hasImage: !!item.image
                    });
                    
                    // Kembalikan objek dengan image yang sudah diproses
                    return {
                        ...item,
                        image: imageUrl
                    };
                });
                
                console.log('Processed data with images:', processedData);
                setPengumumanList(processedData);
            } catch (error) {
                console.error('Error loading announcements:', error);
                setError(t('error'));
            } finally {
                setLoading(false);
            }
        }

        fetchBerita();
    }, []);

    if (loading) {
        return null;
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className={`${className} mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
            {showHeader && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                    <div className="flex-1 max-w-3xl">
                        <div className="flex flex-col space-y-4">
                            <span className="inline-flex items-center w-fit px-4 py-2 text-xs font-bold tracking-wide uppercase text-[#F2AC59] bg-[#F2AC59]/10 rounded-full">
                                <span className="w-2 h-2 bg-[#F2AC59] rounded-full mr-2"></span>
                                {t('updateLabel')}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent whitespace-nowrap">
                                {t('title')}
                            </h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] rounded-full"></div>
                            {/* Mobile View All Button */}
                            <div className="md:hidden w-full pt-4">
                                <Link 
                                    href="/umum/informasi"
                                    locale={router.locale}
                                    className="w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] hover:from-[#e09c4a] hover:to-[#d08b3a] text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    {t('viewAll')}
                                    <svg className="ml-2 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Desktop View All Button */}
                    <div className="hidden md:flex items-center h-full mt-6">
                        <Link 
                            href="/umum/informasi"
                            locale={router.locale}
                            className="px-8 py-3.5 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] hover:from-[#e09c4a] hover:to-[#d08b3a] text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap self-center"
                        >
                            {t('viewAll')}
                            <svg className="ml-2 -mr-1 w-5 h-5 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="animate-pulse h-48 bg-gray-200"></div>
                                <div className="p-6">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-4">
                                        {t('loading')}
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                    </div>
                                    <div className="mt-6 h-4 bg-gray-200 rounded w-32"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : pengumumanList.length > 0 ? (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pengumumanList.slice(0, 6).map((item) => (
                            <Link 
                                key={item.id}
                                href={`/umum/informasi/${item.slug}`}
                                locale={router.locale}
                                className="block transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl overflow-hidden"
                                data-aos="fade-up"
                                data-aos-delay={`${(item.id % 3) * 100}`}
                            >
                                <NewsCard2
                                    title={item.judul}
                                    date={item.created_at}
                                    content={item.isi}
                                    image={item.image}
                                    category={item.kategori || t('category')}
                                />
                            </Link>
                        ))}
                    </div>
                    
                </div>
            ) : (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noAnnouncements.title')}</h3>
                    <p className="mt-1 text-gray-500">{t('noAnnouncements.description')}</p>
                </div>
            )}
        </div>
    );
}
