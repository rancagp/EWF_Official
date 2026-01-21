import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from "next/image";
import ProfilContainer from "@/components/templates/PageContainer/Container";
import PageTemplate from "@/components/templates/PageTemplate";

type LegalitasItem = {
    id: number;
    key: 'bappebti' | 'bbj' | 'kbi' | 'sitna';
    image: string;
};

const legalitasData: LegalitasItem[] = [
    {
        id: 1,
        key: 'bappebti',
        image: "/assets/logo-kemendag.png",
    },
    {
        id: 2,
        key: 'bbj',
        image: "/assets/OJK_Logo.png",
    },
    {
        id: 3,
        key: 'kbi',
        image: "/assets/BI_Logo.png",
    },
    {
        id: 4,
        key: 'sitna',
        image: "/assets/sitna-logo.png",
    },
];

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'id', ['badan_regulasi', 'common', 'footer'])),
        },
    };
}

export default function Legalitas() {
    const { t } = useTranslation('badan_regulasi');

    return (
        <PageTemplate title={t('pageTitle')} description={t('pageDescription')}>
            <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
                <ProfilContainer title={t('pageTitle')}>
                    <div className="space-y-16">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4C4C4C] mb-4">Profil Badan Regulasi</h2>
                            <p className="text-[#4C4C4C] leading-relaxed">
                                {t('profile_description')}
                            </p>
                        </div>
                        
                        {legalitasData.map((item) => (
                            <div key={item.id} className="flex flex-col md:flex-row items-center gap-8">
                                {/* Image Container */}
                                <div className="md:w-1/3 flex-shrink-0 w-full">
                                    <div className={`relative ${item.key === 'sitna' ? 'aspect-square' : 'aspect-video'} bg-white rounded-lg overflow-hidden shadow-md p-4`}>
                                        <Image
                                            src={item.image}
                                            alt={t(`${item.key}.title`)}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                </div>
                                {/* Text Content */}
                                <div className="md:w-2/3">
                                    <h3 className="text-2xl font-bold text-[#4C4C4C] mb-3 flex items-center gap-2">
                                        {t(`${item.key}.title`)}
                                    </h3>
                                    <p className="text-[#4C4C4C] text-base leading-relaxed text-justify">
                                        {t(`${item.key}.description`)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ProfilContainer>
            </div>
        </PageTemplate>
    );
}
