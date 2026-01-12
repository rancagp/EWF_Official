import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import PageTemplate from "@/components/templates/PageTemplate";
import ProfilContainer from "@/components/templates/PageContainer/Container";
import ProductCard from "@/components/moleculs/ProductCard";

type Product = {
    id: number;
    image: string;
    name: string;
    slug: string;
    deskripsi?: string;
    specs?: string;
    category: string;
};

export const getStaticProps: GetStaticProps = async ({ locale = 'id' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'produk', 'footer'])),
    },
  };
};

export default function ProdukPage() {
    const { t } = useTranslation('produk');
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const liveQuotesProduct: Product = {
        id: -9999,
        image: "/images/placeholder.jpg",
        name: t('liveQuotes.name'),
        slug: "live-quotes",
        deskripsi: t('liveQuotes.description'),
        category: "SPA",
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

                setProducts([...jfxProducts, ...spaProducts]);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const handleProductClick = (category: string, slug: string) => {
        router.push(`/produk/${category.toLowerCase()}/${slug}`);
    };

    const productsToRender = loading ? products : [...products, liveQuotesProduct];

    return (
        <PageTemplate title={t('title')}>
            <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
                <ProfilContainer title={t('title')}>
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-24"></div>
                            </div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {productsToRender.map((product) => {
                                    if (!product || !product.category || !product.slug) {
                                        console.warn('Invalid product data:', product);
                                        return null;
                                    }
                                    return (
                                        <ProductCard 
                                            key={`${product.category}-${product.id}`}
                                            product={{
                                                ...product,
                                                deskripsi: product.deskripsi || t('defaultDescription')
                                            }}
                                            onClick={(category, slug) => {
                                                router.push(`/produk/${category.toLowerCase()}/${slug}`);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">{t('errorText')}</p>
                    )}
                </ProfilContainer>
            </div>
        </PageTemplate>
    );
}
