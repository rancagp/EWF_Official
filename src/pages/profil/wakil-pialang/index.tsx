import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageTemplate from "@/components/templates/PageTemplate";
import ProfilContainer from "@/components/templates/PageContainer/Container";
import Link from 'next/link';
import { useRouter } from 'next/router';

interface KategoriPialang {
    id: number;
    nama_kategori: string;
    slug: string;
    image?: string;
}

// Tipe data untuk kategori pialang
interface KategoriPialang {
    id: number;
    nama_kategori: string;
    slug: string;
    image?: string;
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'id', ['wakil_pialang', 'common', 'footer'])),
        },
    };
}

export default function WakilPialang() {
    const { t } = useTranslation('wakil_pialang');
    const router = useRouter();
    const [kategori, setKategori] = useState<KategoriPialang[]>([]);
    const [sedangMemuat, setSedangMemuat] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKategori = async () => {
            try {
                setSedangMemuat(true);
                const response = await fetch('/api/kategori-pialang');
                
                if (!response.ok) {
                    throw new Error('Gagal memuat data kategori');
                }
                
                const data = await response.json();
                
                // Tambahkan gambar default jika tidak ada
                const kategoriDenganGambar = data.map((item: KategoriPialang) => ({
                    ...item,
                    image: item.image || `/images/cities/${item.slug}.jpg`
                }));
                
                setKategori(kategoriDenganGambar);
                setError(null);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Gagal memuat data. Silakan coba lagi nanti.');
            } finally {
                setSedangMemuat(false);
            }
        };

        fetchKategori();
    }, []);

    if (sedangMemuat) {
        return (
            <PageTemplate 
                title={t('pageTitle')}
                description={t('pageDescription')}
            >
                <div className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 text-sm font-medium text-[#F2AC59] bg-[#F2AC59]/10 rounded-full mb-4">
                                {t('pageSubtitle', 'Daftar Wilayah')}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {t('pageTitle')}
                            </h2>
                            <div className="w-20 h-1 bg-[#F2AC59] rounded-full mx-auto mb-6"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                        <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageTemplate>
        );
    }

    if (error && kategori.length === 0) {
        return (
            <PageTemplate 
                title={t('pageTitle')}
                description={t('pageDescription')}
            >
                <div className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#F2AC59] hover:bg-[#e09a40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F2AC59] transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate 
            title={t('pageTitle')}
            description={t('pageDescription')}
        >
            <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto">
                <ProfilContainer title={t('pageTitle')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {kategori.map((item) => (
                            <Link 
                                key={item.id} 
                                href={`/profil/wakil-pialang/${item.slug}`}
                                className="group block transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full transition-all duration-300 hover:shadow-md hover:border-[#F2AC59]/30">
                                    <div className="p-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-[#F2AC59]/10 text-[#F2AC59] mr-4 group-hover:bg-[#F2AC59] group-hover:text-white transition-colors duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#F2AC59] transition-colors duration-300">
                                                    {item.nama_kategori}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {t('viewAllText', 'Lihat daftar lengkap')}
                                                </p>
                                            </div>
                                            <div className="text-gray-300 group-hover:text-[#F2AC59] transition-colors duration-300">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </ProfilContainer>
            </div>
        </PageTemplate>
    );
}
