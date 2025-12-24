import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import PageTemplate from "@/components/templates/PageTemplate";
import ProfilContainer from "@/components/templates/PageContainer/Container";

export const getStaticProps: GetStaticProps = async ({ locale = 'id' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['summer-winter', 'common', 'footer'])),
    },
    revalidate: 60 * 60 * 24, // Revalidate every 24 hours
  };
};

const SummerWinterPage = () => {
  const { t, i18n } = useTranslation('summer-winter');
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function to get nested translation with fallback
  const translate = (key: string, fallback: string = '') => {
    return t(key) || fallback;
  };

  // Helper function to format date and time
  const formatDateTime = (date: Date) => {
    const dayName = t(`common.days.${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]}`);
    const day = date.getDate();
    const month = t(`months.${['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'][date.getMonth()]}`);
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Helper function to get localized date string
  const getLocalizedDate = (day: number, monthKey: string, year: number) => {
    const monthMap: {[key: string]: number} = {
      'march': 2, // JavaScript months are 0-indexed
      'october': 9,
      'november': 10
    };
    
    const date = new Date(year, monthMap[monthKey], day);
    const monthName = t(`months.${monthKey}`);
    
    // Get translated day names from the locale
    const dayNames = {
      sunday: t('common.days.sunday'),
      monday: t('common.days.monday'),
      tuesday: t('common.days.tuesday'),
      wednesday: t('common.days.wednesday'),
      thursday: t('common.days.thursday'),
      friday: t('common.days.friday'),
      saturday: t('common.days.saturday')
    };
    
    // Get the day of week (0-6, where 0 is Sunday)
    const dayOfWeek = date.getDay();
    const dayName = [
      dayNames.sunday,
      dayNames.monday,
      dayNames.tuesday,
      dayNames.wednesday,
      dayNames.thursday,
      dayNames.friday,
      dayNames.saturday
    ][dayOfWeek];
    
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  // BST Schedule data
  const bstSchedule = [
    { year: 2010, startDay: 28, startMonth: 'march', endDay: 31, endMonth: 'october' },
    { year: 2011, startDay: 27, startMonth: 'march', endDay: 30, endMonth: 'october' },
    { year: 2012, startDay: 25, startMonth: 'march', endDay: 28, endMonth: 'october' },
    { year: 2013, startDay: 31, startMonth: 'march', endDay: 27, endMonth: 'october' },
    { year: 2014, startDay: 30, startMonth: 'march', endDay: 26, endMonth: 'october' },
    { year: 2015, startDay: 29, startMonth: 'march', endDay: 25, endMonth: 'october' },
  ].map(item => ({
    ...item,
    start: getLocalizedDate(item.startDay, item.startMonth, item.year),
    end: getLocalizedDate(item.endDay, item.endMonth, item.year)
  }));

  // US DST Schedule data
  const usDstSchedule = [
    { year: 2010, startDay: 14, startMonth: 'march', endDay: 7, endMonth: 'november' },
    { year: 2011, startDay: 13, startMonth: 'march', endDay: 6, endMonth: 'november' },
    { year: 2012, startDay: 11, startMonth: 'march', endDay: 4, endMonth: 'november' },
    { year: 2013, startDay: 10, startMonth: 'march', endDay: 3, endMonth: 'november' },
    { year: 2014, startDay: 9, startMonth: 'march', endDay: 2, endMonth: 'november' },
    { year: 2015, startDay: 8, startMonth: 'march', endDay: 1, endMonth: 'november' },
  ].map(item => ({
    ...item,
    start: getLocalizedDate(item.startDay, item.startMonth, item.year),
    end: getLocalizedDate(item.endDay, item.endMonth, item.year)
  }));

  if (!isClient) {
    return (
      <PageTemplate title={translate('title')}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={translate('title')}>
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
        <ProfilContainer title="Summer & Winter">
          <div className="space-y-10 text-[#4C4C4D]">
            {/* UK Time Section */}
            <section>
              <h2 className="text-2xl font-bold text-[#4C4C4D] mb-2">{translate('ukTime.title')}</h2>
              <div className="w-20 h-1 bg-[#F2AC59] mb-6"></div>
              <p className="mb-4 leading-relaxed">{translate('ukTime.description')}</p>
              <p className="mb-6 leading-relaxed">{translate('ukTime.intro')}</p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Summer Begin */}
                <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-[#4C4C4D] mb-4">{translate('ukTime.sections.summerStart.title')}</h3>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src="/assets/DAYLIGHT-01.jpg" 
                      alt={translate('ukTime.sections.summerStart.title')} 
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[#4C4C4D] leading-relaxed">{translate('ukTime.sections.summerStart.description')}</p>
                </div>

                {/* Summer End */}
                <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-[#4C4C4D] mb-4">{translate('ukTime.sections.summerEnd.title')}</h3>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src="/assets/DAYLIGHT-02.jpg" 
                      alt={translate('ukTime.sections.summerEnd.title')}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[#4C4C4D] leading-relaxed">{translate('ukTime.sections.summerEnd.description')}</p>
                </div>
              </div>

              <div className="mt-10 overflow-x-auto">
                <h4 className="font-bold text-lg text-[#4C4C4D] mb-4">{translate('ukTime.sections.beforeAfterForward')}</h4>
                <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-[#F9FAFB]">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.date')}</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.time')}</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.dst')}</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.offset')}</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.timezone')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      <tr className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">{formatDateTime(new Date(2012, 2, 25))}</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">00:59:59</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.no')}</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">GMT</td>
                      </tr>
                      <tr className="bg-[#FFF8F0] font-semibold">
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">01:00:00 → 02:00:00</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">+1h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">+1h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC+1h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">BST</td>
                      </tr>
                      <tr className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">{formatDateTime(new Date(2012, 2, 25))}</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">02:00:01</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">+1h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC+1h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">BST</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 overflow-x-auto">
                <h4 className="font-bold text-lg text-[#4C4C4D] mb-4">{translate('ukTime.sections.beforeAfterBackward')}</h4>
                <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-[#F9FAFB]">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.date')}</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.time')}</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.dst')}</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.offset')}</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.timezone')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      <tr className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">{formatDateTime(new Date(2012, 9, 28))}</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">00:59:59</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">+1h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC+1h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">BST</td>
                      </tr>
                      <tr className="bg-[#FFF8F0] font-semibold">
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">02:00:00 → 01:00:00</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">-1h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">0h</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">GMT</td>
                      </tr>
                      <tr className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">{formatDateTime(new Date(2012, 9, 28))}</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">01:00:01</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.no')}</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC</td>
                        <td className="py-3 px-4 text-sm text-[#4C4C4D]">GMT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#FFF8F0] p-6 rounded-xl border border-[#F2AC59]/20 mt-10">
                <h4 className="font-semibold text-lg text-[#4C4C4D] mb-4">{translate('ukTime.sections.europeanFormula.title')}</h4>
                <div className="space-y-2 text-[#4C4C4D]">
                  <p className="flex items-start">
                    <span className="font-medium w-32 flex-shrink-0">{translate('common.timeForward')}:</span>
                    <span>{translate('ukTime.sections.europeanFormula.start')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium w-32 flex-shrink-0">{translate('common.timeBackward')}:</span>
                    <span>{translate('ukTime.sections.europeanFormula.end')}</span>
                  </p>
                  <p className="text-sm text-[#9B9FA7] mt-4 italic">{translate('ukTime.sections.europeanFormula.note')}</p>
                </div>
              </div>

              <div className="mt-10">
                <h4 className="font-bold text-lg text-[#4C4C4D] mb-4">{translate('ukTime.sections.scheduleTitle')}</h4>
                <div className="overflow-x-auto">
                  <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-[#F9FAFB]">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.year')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.startDate')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('ukTime.sections.tableHeaders.endDate')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {bstSchedule.map((item, index) => (
                          <tr key={index} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="py-3 px-4 text-sm text-center text-[#4C4C4D]">{item.year}</td>
                            <td className="py-3 px-4 text-sm text-[#4C4C4D]">{item.start}</td>
                            <td className="py-3 px-4 text-sm text-[#4C4C4D]">{item.end}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <hr className="my-12 border-gray-300"/>

                        {/* US Time Section */}
            <section className="mt-12 pt-8 border-t border-[#E5E7EB]">
              <h2 className="text-2xl font-bold text-[#4C4C4D] mb-2">{translate('usTime.title')}</h2>
              <div className="w-20 h-1 bg-[#F2AC59] mb-6"></div>
              <p className="mb-6 text-[#4C4C4D] leading-relaxed">{translate('usTime.description')}</p>
              <p className="mb-4">{translate('usTime.intro')}</p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Daylight Start */}
                <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-[#4C4C4D] mb-4">{translate('usTime.sections.daylightStart.title')}</h3>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src="/assets/DAYLIGHT-01.jpg" 
                      alt={translate('usTime.sections.daylightStart.title')}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[#4C4C4D] leading-relaxed">{translate('usTime.sections.daylightStart.description')}</p>
                </div>

                {/* Daylight End */}
                <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-[#4C4C4D] mb-4">{translate('usTime.sections.daylightEnd.title')}</h3>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src="/assets/DAYLIGHT-02.jpg" 
                      alt={translate('usTime.sections.daylightEnd.title')}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[#4C4C4D] leading-relaxed">{translate('usTime.sections.daylightEnd.description')}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-[#4C4C4D] mb-4">{translate('usTime.sections.beforeAfterForward')}</h3>
                <div className="overflow-x-auto">
                  <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-[#F9FAFB]">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.date')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.time')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.dst')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.offset')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.timezone')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{formatDateTime(new Date(2012, 2, 11))}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">01:59:59</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.no')}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC-5h</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">EST</td>
                        </tr>
                        <tr className="bg-[#FFF8F0] font-semibold">
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">02:00:00 → 03:00:00</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">+1h</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.yes')}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC-4h</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">EDT</td>
                        </tr>
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{formatDateTime(new Date(2012, 2, 11))}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">03:00:01</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.yes')}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC-4h</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">EDT</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-[#4C4C4D] mb-4">{translate('usTime.sections.beforeAfterBackward')}</h3>
                <div className="overflow-x-auto">
                  <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-[#F9FAFB]">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.date')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.time')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.dst')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.offset')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.timezone')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{formatDateTime(new Date(2012, 10, 4))}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">01:59:59</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.yes')}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC-4h</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">EDT</td>
                        </tr>
                        <tr className="bg-[#FFF8F0] font-semibold">
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">02:00:00 → 01:00:00</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.no')}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.no')}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC-5h</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">EST</td>
                        </tr>
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{formatDateTime(new Date(2012, 10, 4))}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">01:00:01</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">{translate('common.no')}</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">UTC-5h</td>
                          <td className="py-3 px-4 text-sm text-[#4C4C4D]">EST</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-[#F0F7FF] p-6 rounded-xl border border-[#E5F0FF] mt-10">
                <h4 className="font-semibold text-lg text-[#4C4C4D] mb-4">{translate('usTime.sections.usFormula.title')}</h4>
                <div className="space-y-2 text-[#4C4C4D]">
                  <p className="flex items-start">
                    <span className="font-medium w-32 flex-shrink-0">{translate('common.timeForward')}:</span>
                    <span>{translate('usTime.sections.usFormula.start')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium w-32 flex-shrink-0">{translate('common.timeBackward')}:</span>
                    <span>{translate('usTime.sections.usFormula.end')}</span>
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-[#4C4C4D] mb-4">{translate('usTime.sections.scheduleTitle')}</h3>
                <div className="overflow-x-auto">
                  <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-[#F9FAFB]">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.year')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.startDate')}</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-[#4C4C4D]">{translate('usTime.sections.tableHeaders.endDate')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {usDstSchedule.map((item, index) => (
                          <tr key={index} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="py-3 px-4 text-sm text-center text-[#4C4C4D]">{item.year}</td>
                            <td className="py-3 px-4 text-sm text-[#4C4C4D]">{item.start}</td>
                            <td className="py-3 px-4 text-sm text-[#4C4C4D]">{item.end}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ProfilContainer>
      </div>
    </PageTemplate>
  );
};

export default SummerWinterPage;
