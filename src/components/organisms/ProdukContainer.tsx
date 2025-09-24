import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTranslation } from 'next-i18next';
import Header1 from "@/components/moleculs/Header1";
import ProductCard from '../moleculs/ProductCard';

type Product = {
    id: number;
    image: string;
    name: string;
    slug: string;
    deskripsi?: string;
    specs?: string;
    category: string;  // Tambahan untuk membedakan jenis produk
};

export default function ProdukContainer() {
    const { t } = useTranslation('produk', { useSuspense: false });
    const router = useRouter();
    const [productList, setProductList] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const handleProductClick = (category: string, slug: string) => {
        router.push(`/produk/${category.toLowerCase()}/${slug}`);
    };

    useEffect(() => {
        async function fetchProducts() {
            try {
                const [jfxRes, spaRes] = await Promise.all([
                    fetch("/api/jfx"),
                    fetch("/api/spa"),
                ]);

                if (!jfxRes.ok || !spaRes.ok) throw new Error("Gagal memuat data produk");

                const jfxData = await jfxRes.json();
                const spaData = await spaRes.json();

                const jfxProducts: Product[] = jfxData.map((item: any) => ({
                    ...item,
                    category: "JFX",
                }));

                const spaProducts: Product[] = spaData.map((item: any) => ({
                    ...item,
                    category: "SPA",
                }));

                setProductList([...jfxProducts, ...spaProducts]);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return (
        <div className="relative py-16 sm:py-4">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-gradient-to-r from-[#F2AC59]/5 to-[#e09c4a]/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div className="flex-1 max-w-3xl">
                        <div className="flex flex-col space-y-4">
                            <span className="inline-flex items-center w-fit px-4 py-2 text-xs font-bold tracking-wide uppercase text-[#4C4C4C] bg-[#F2AC59]/10 rounded-full">
                                <span className="w-2 h-2 bg-[#F2AC59] rounded-full mr-2"></span>
                                {t('featuredBadge')}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                {t('title')}
                            </h2>
                            <div className="w-32 h-1.5 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] rounded-full"></div>
                            {/* Mobile View All Button */}
                            <div className="md:hidden w-full pt-4">
                                <Link 
                                    href="/produk" 
                                    className="w-full flex justify-center px-6 py-3 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] hover:from-[#e09c4a] hover:to-[#d08b3a] text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    {t('viewAllProducts')}
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Desktop View All Button */}
                    <div className="hidden md:flex items-center h-full mt-6">
                        <Link 
                            href="/produk" 
                            className="px-8 py-3.5 bg-gradient-to-r from-[#F2AC59] to-[#e09c4a] hover:from-[#e09c4a] hover:to-[#d08b3a] text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                            {t('viewAllProducts')}
                        </Link>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 group">
                                <div className="h-60 bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse"></div>
                                <div className="p-6">
                                    <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                                        <div className="h-4 bg-gray-100 rounded-full w-5/6"></div>
                                    </div>
                                    <div className="mt-6 pt-5 border-t border-gray-100">
                                        <div className="h-12 bg-gray-200 rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : productList.length > 0 ? (
                    <div className="space-y-16">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {productList.filter(Boolean).slice(0, 6).map((product) => {
                                if (!product || !product.category || !product.slug) {
                                    console.warn('Invalid product data:', product);
                                    return null;
                                }
                                return (
                                    <ProductCard 
                                        key={`${product.category}-${product.id}`}
                                        product={product}
                                        onClick={handleProductClick}
                                        className="group hover:-translate-y-2 transition-transform duration-500"
                                    />
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#F2AC59]/10 to-[#e09c4a]/10 text-[#F2AC59] mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4.5L4 7m16 0l-8 4.5M4 7v10l8 4.5m0 0l8-4.5M4 7l8 4.5m0 0L12 16m8-9v10l-8 4.5" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Produk Belum Tersedia</h3>
                        <p className="text-gray-600 max-w-md mx-auto text-lg">Maaf, saat ini belum ada produk yang tersedia. Silakan cek kembali nanti untuk update terbaru.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
