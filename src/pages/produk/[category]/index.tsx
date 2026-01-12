import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import ProductCard from "@/components/moleculs/ProductCard";
import PageTemplate from "@/components/templates/PageTemplate";
import ProfilContainer from "@/components/templates/PageContainer/Container";

type Product = {
    id: number;
    image: string;
    name: string;
    slug: string;
    deskripsi?: string;
    specs?: string;
    category: string;
};

export const getStaticProps: GetStaticProps = async ({ locale = 'id', params }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'produk', 'footer'])),
    },
  };
};

export async function getStaticPaths() {
  return {
    paths: [
      { params: { category: 'jfx' }, locale: 'id' },
      { params: { category: 'jfx' }, locale: 'en' },
      { params: { category: 'spa' }, locale: 'id' },
      { params: { category: 'spa' }, locale: 'en' },
    ],
    fallback: true,
  };
}

export default function ProdukByCategory() {
    const { t } = useTranslation('produk');
    const router = useRouter();
    const { category } = router.query;
    
    const categoryName = category === 'jfx' ? 'JFX' : 'SPA';

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
        if (!category) return;

        const categoryStr = String(category).toLowerCase();
        let apiUrl = "";

        if (categoryStr === "jfx") {
            apiUrl = "/api/jfx";
        } else if (categoryStr === "spa") {
            apiUrl = "/api/spa";
        } else {
            setProducts([]);
            setLoading(false);
            return;
        }

        async function fetchProducts() {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error("Gagal memuat data produk");

                const data = await response.json();
                const formattedData: Product[] = data.map((item: any) => ({
                    ...item,
                    category: categoryStr.toUpperCase(),
                }));

                setProducts(formattedData);
            } catch (error) {
                console.error("Error fetching:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [category]);

    const categoryTitle = category ? String(category).toUpperCase() : "";
    const isSpa = String(category || '').toLowerCase() === 'spa';
    const productsToRender = loading ? products : (isSpa ? [...products, liveQuotesProduct] : products);

    return (
        <PageTemplate title={t('title')}>
            <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
                <ProfilContainer title={`${t('title')} ${categoryName}`}>
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
