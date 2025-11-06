import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import PageTemplate from "@/components/templates/PageTemplate";
import ProfilContainer from "@/components/templates/PageContainer/Container";
import Image from "next/image";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'id', ['mekanisme-perdagangan', 'common', 'footer'])),
  },
});

const MekanismePerdaganganPage = () => {
    const { t } = useTranslation('mekanisme-perdagangan');
    const tableData = t('comparison.rows', { returnObjects: true });

    return (
        <PageTemplate title={`${t('title')} - PT. Kresna Berjangka Investama`}>
            <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
                <ProfilContainer title={t('title')}>
                    <div className="space-y-10">
                        {/* Explanation Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <h2 className="text-2xl font-bold text-[#4C4C4D] mb-4">
                                    {t('multilateral.title')}
                                </h2>
                                <p className="text-[#4C4C4D] leading-relaxed">
                                    {t('multilateral.description')}
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <h2 className="text-2xl font-bold text-[#4C4C4D] mb-4">
                                    {t('bilateral.title')}
                                </h2>
                                <p className="text-[#4C4C4D] leading-relaxed">
                                    {t('bilateral.description')}
                                </p>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="pt-4">
                            <h2 className="text-2xl font-bold text-center text-[#4C4C4D] mb-2">
                                {t('comparison.title')}
                            </h2>
                            <div className="w-20 h-1 bg-[#F2AC59] mx-auto mb-8"></div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#F9FAFB]">
                                            <th className="border border-[#E5E7EB] p-4 font-semibold text-[#4C4C4D] text-center">
                                                {t('multilateral.tableHeader')}
                                            </th>
                                            <th className="border border-[#E5E7EB] p-4 font-semibold text-[#4C4C4D] text-center">
                                                {t('bilateral.tableHeader')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(tableData) && tableData.map((row: any, index: number) => (
                                            <tr key={index} className="hover:bg-[#F9FAFB] transition-colors">
                                                <td className="border border-[#E5E7EB] p-4 text-[#4C4C4D]">{row.multilateral}</td>
                                                <td className="border border-[#E5E7EB] p-4 text-[#4C4C4D]">{row.bilateral}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Flowchart Section */}
                        {/* <div className="pt-4">
                            <h2 className="text-2xl font-bold text-center text-[#4C4C4D] mb-2">
                                {t('flow.title')}
                            </h2>
                            <div className="w-20 h-1 bg-[#F2AC59] mx-auto mb-10"></div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <h3 className="text-xl font-bold text-center text-[#4C4C4D] mb-6">
                                        {t('multilateral.flowTitle')}
                                    </h3>
                                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#E5E7EB]">
                                        <Image 
                                            src="/assets/alur-perdagangan-multi.jpg" 
                                            alt={t('multilateral.flowTitle')} 
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <h3 className="text-xl font-bold text-center text-[#4C4C4D] mb-6">
                                        {t('bilateral.flowTitle')}
                                    </h3>
                                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#E5E7EB]">
                                        <Image 
                                            src="/assets/alur-perdagangan-bila.jpg" 
                                            alt={t('bilateral.flowTitle')} 
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </ProfilContainer>
            </div>
        </PageTemplate>
    );
};

export default MekanismePerdaganganPage;
