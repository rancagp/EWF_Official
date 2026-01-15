import React, { useState, useEffect } from 'react';
import ProfilContainer from "@/components/templates/PageContainer/Container";
import PageTemplate from "@/components/templates/PageTemplate";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { CalendarFilterKey, fetchEconomicCalendar, EconomicEvent } from '@/services/economicCalendarService';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['economic-calendar', 'common', 'footer'])),
    },
  };
};

export default function EconomicCalendar() {
  const { t } = useTranslation('economic-calendar');
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<CalendarFilterKey>('today');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const filters: Array<{ key: CalendarFilterKey; value: string }> = [
    { key: 'today', value: t('filters.today') },
    { key: 'thisWeek', value: t('filters.thisWeek') },
    { key: 'previousWeek', value: t('filters.previousWeek') },
    { key: 'nextWeek', value: t('filters.nextWeek') },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchEconomicCalendar(activeFilter);
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error('Error loading economic calendar:', err);
        setError('Gagal memuat data kalender ekonomi. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);

  const handleFilterClick = (filterKey: CalendarFilterKey) => {
    setActiveFilter(filterKey);
    setExpandedEventId(null);
  };

  const toggleExpanded = (eventId: string) => {
    setExpandedEventId(prev => (prev === eventId ? null : eventId));
  };

  // Format tanggal dari YYYY-MM-DD ke DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Pastikan tanggal valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format impact menjadi bintang dengan warna yang sesuai
  const formatImpact = (impact: string) => {
    if (!impact) return <span className="text-gray-300">★☆☆</span>;
    
    const getImpactColor = (level: string) => {
      switch (level.toLowerCase()) {
        case 'high':
          return 'text-red-500';
        case 'medium':
          return 'text-yellow-500';
        case 'low':
          return 'text-green-500';
        default:
          return 'text-gray-300';
      }
    };
    
    const colorClass = getImpactColor(impact);
    
    switch (impact.toLowerCase()) {
      case 'high':
        return <span className={`${colorClass} font-bold`}>★★★</span>;
      case 'medium':
        return <span className={`${colorClass} font-bold`}>★★<span className="text-gray-300">☆</span></span>;
      case 'low':
        return <span className={`${colorClass} font-bold`}>★<span className="text-gray-300">☆☆</span></span>;
      default:
        return <span className="text-gray-300">★☆☆</span>;
    }
  };

  const getImpactLabel = (impact: EconomicEvent['impact']) => {
    const lowered = (impact || '').toLowerCase();
    if (lowered === 'high' || lowered === 'medium' || lowered === 'low') {
      return t(`impactLevels.${lowered}`);
    }
    return '-';
  };

  const getActiveFilterLabel = () => {
    return filters.find(f => f.key === activeFilter)?.value || activeFilter;
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf || loading || error || events.length === 0) return;

    try {
      setDownloadingPdf(true);

      const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
      const autoTable = autoTableModule.default as unknown as (doc: any, options: any) => void;

      const loadImageAsDataUrl = async (path: string) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load image (${response.status}): ${path}`);
        const blob = await response.blob();

        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Failed to read image blob'));
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(blob);
        });
      };

      const getImageDimensions = async (dataUrl: string) => {
        return await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () =>
            resolve({
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
            });
          img.onerror = () => reject(new Error('Failed to decode image'));
          img.src = dataUrl;
        });
      };

      let watermarkLogo: { dataUrl: string; format: 'PNG' | 'JPEG'; width: number; height: number } | null = null;
      try {
        const dataUrl = await loadImageAsDataUrl('/assets/ewf-logo.png');
        const format = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        const { width, height } = await getImageDimensions(dataUrl);
        watermarkLogo = { dataUrl, format, width, height };
      } catch (e) {
        console.warn('PDF watermark logo not loaded, continuing without watermark:', e);
      }

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const marginX = 40;

      const drawWatermark = () => {
        if (!watermarkLogo) return;

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxW = pageWidth * 0.42;
        const maxH = pageHeight * 0.42;

        const aspect = watermarkLogo.width / watermarkLogo.height || 1;
        let w = maxW;
        let h = w / aspect;
        if (h > maxH) {
          h = maxH;
          w = h * aspect;
        }

        const x = (pageWidth - w) / 2;
        const y = (pageHeight - h) / 2;

        const watermarkState = doc.GState({ opacity: 0.07 });
        const normalState = doc.GState({ opacity: 1 });
        doc.setGState(watermarkState);
        doc.addImage(watermarkLogo.dataUrl, watermarkLogo.format, x, y, w, h, undefined, 'FAST');
        doc.setGState(normalState);
      };

      doc.setFontSize(18);
      doc.text(t('title'), marginX, 42);

      doc.setFontSize(11);
      doc.setTextColor(90);
      doc.text(`${t('pdf.filter')}: ${getActiveFilterLabel()}`, marginX, 62);
      doc.text(`${t('pdf.generatedAt')}: ${new Date().toLocaleString()}`, marginX, 78);

      const head = [
        [
          t('table.date'),
          t('table.time'),
          t('table.country'),
          t('table.impact'),
          t('table.figures'),
          t('table.actual'),
          t('table.forecast'),
          t('table.previous'),
        ],
      ];

      const body = events.map(event => [
        formatDate(event.date),
        event.time || '-',
        event.country || '-',
        getImpactLabel(event.impact),
        event.figures || '-',
        event.actual ?? '-',
        event.forecast ?? '-',
        event.previous ?? '-',
      ]);

      autoTable(doc, {
        startY: 96,
        head,
        body,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: [76, 76, 76], textColor: 255 },
        columnStyles: {
          4: { cellWidth: 260 },
        },
        margin: { left: marginX, right: marginX },
        didDrawPage: () => {
          drawWatermark();
        },
      });

      const stamp = new Date().toISOString().slice(0, 10);
      doc.save(`economic-calendar-${activeFilter}-${stamp}.pdf`);
    } catch (err) {
      console.error('Error generating economic calendar PDF:', err);
      setError(t('pdf.error'));
    } finally {
      setDownloadingPdf(false);
    }
  };
  
  return (
    <PageTemplate title={t('title')}>
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-52 my-10">
        <ProfilContainer title={t('title')}>
          <div className="space-y-5">
            {/* Filter Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => handleFilterClick(filter.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeFilter === filter.key
                        ? 'bg-[#F2AC59] text-white shadow-md'
                        : 'bg-[#F5F5F5] text-[#4C4C4C] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {filter.value}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={loading || !!error || events.length === 0 || downloadingPdf}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                  loading || !!error || events.length === 0 || downloadingPdf
                    ? 'bg-[#F5F5F5] text-[#9B9FA7] border-[#E5E7EB] cursor-not-allowed'
                    : 'bg-white text-[#4C4C4C] border-[#F2AC59] hover:bg-[#FFF9F0]'
                }`}
              >
                {downloadingPdf ? t('actions.downloadingPdf') : t('actions.downloadPdf')}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F2AC59]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">{t('noDataMessage')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB] shadow-sm">
                <table className="min-w-full divide-y divide-[#E5E7EB]">
                  <thead className="bg-[#4C4C4C]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        {t('table.date')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        {t('table.time')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        {t('table.country')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        {t('table.impact')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        {t('table.figures')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {events.map((event) => {
                      const isExpanded = expandedEventId === event.id;
                      const hasDetails =
                        !!event.details &&
                        Object.values(event.details).some(v => (Array.isArray(v) ? v.length > 0 : !!v));

                      return (
                        <React.Fragment key={event.id}>
                          <tr
                            className="hover:bg-[#FFF9F0] transition-colors cursor-pointer"
                            onClick={() => toggleExpanded(event.id)}
                            role="button"
                            aria-expanded={isExpanded}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4C4C4C] font-medium">
                              {formatDate(event.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4C4C4C]">{event.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-[#F5F5F5] text-[#4C4C4C]">
                                {event.country}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatImpact(event.impact)}</td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium text-[#4C4C4C]">{event.figures}</div>
                                  {event.actual && (
                                    <div className="text-xs text-[#9B9FA7] mt-1">
                                      <span className="font-medium">{t('table.actual')}:</span> {event.actual}
                                    </div>
                                  )}
                                  {event.forecast && (
                                    <div className="text-xs text-[#9B9FA7]">
                                      <span className="font-medium">{t('table.forecast')}:</span> {event.forecast}
                                    </div>
                                  )}
                                  {event.previous && (
                                    <div className="text-xs text-[#9B9FA7]">
                                      <span className="font-medium">{t('table.previous')}:</span> {event.previous}
                                    </div>
                                  )}
                                </div>
                                {hasDetails ? (
                                  <button
                                    type="button"
                                    className="shrink-0 text-xs text-[#F2AC59] hover:underline"
                                    onClick={e => {
                                      e.stopPropagation();
                                      toggleExpanded(event.id);
                                    }}
                                  >
                                    {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>

                          {isExpanded && hasDetails ? (
                            <tr className="bg-[#FFF9F0]">
                              <td colSpan={5} className="px-6 py-4 text-sm text-[#4C4C4C]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    {event.details?.sources ? (
                                      <div>
                                        <div className="text-xs font-semibold text-[#6B7280]">Sources</div>
                                        <div className="text-sm">{event.details.sources}</div>
                                      </div>
                                    ) : null}
                                    {event.details?.measures ? (
                                      <div>
                                        <div className="text-xs font-semibold text-[#6B7280]">Measures</div>
                                        <div className="text-sm">{event.details.measures}</div>
                                      </div>
                                    ) : null}
                                    {event.details?.usualEffect ? (
                                      <div>
                                        <div className="text-xs font-semibold text-[#6B7280]">Usual Effect</div>
                                        <div className="text-sm">{event.details.usualEffect}</div>
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="space-y-2">
                                    {event.details?.frequency ? (
                                      <div>
                                        <div className="text-xs font-semibold text-[#6B7280]">Frequency</div>
                                        <div className="text-sm">{event.details.frequency}</div>
                                      </div>
                                    ) : null}
                                    {event.details?.nextReleased ? (
                                      <div>
                                        <div className="text-xs font-semibold text-[#6B7280]">Next Released</div>
                                        <div className="text-sm">{event.details.nextReleased}</div>
                                      </div>
                                    ) : null}
                                    {event.details?.notes ? (
                                      <div>
                                        <div className="text-xs font-semibold text-[#6B7280]">Notes</div>
                                        <div className="text-sm">{event.details.notes}</div>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>

                                {event.details?.whyTraderCare ? (
                                  <div className="mt-4">
                                    <div className="text-xs font-semibold text-[#6B7280]">Why Trader Care</div>
                                    <div className="text-sm">{event.details.whyTraderCare}</div>
                                  </div>
                                ) : null}

                                {Array.isArray(event.details?.history) && event.details!.history!.length > 0 ? (
                                  <div className="mt-4">
                                    <div className="text-xs font-semibold text-[#6B7280] mb-2">History</div>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full text-xs border border-[#E5E7EB] rounded">
                                        <thead className="bg-white">
                                          <tr className="text-left">
                                            <th className="px-3 py-2 border-b border-[#E5E7EB]">Date</th>
                                            <th className="px-3 py-2 border-b border-[#E5E7EB]">Actual</th>
                                            <th className="px-3 py-2 border-b border-[#E5E7EB]">Forecast</th>
                                            <th className="px-3 py-2 border-b border-[#E5E7EB]">Previous</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {event.details!.history!.slice(0, 10).map((h, idx) => (
                                            <tr key={`${event.id}:h:${idx}`} className="bg-white">
                                              <td className="px-3 py-2 border-b border-[#E5E7EB] whitespace-nowrap">
                                                {h.date || '-'}
                                              </td>
                                              <td className="px-3 py-2 border-b border-[#E5E7EB]">{h.actual ?? '-'}</td>
                                              <td className="px-3 py-2 border-b border-[#E5E7EB]">
                                                {h.forecast ?? '-'}
                                              </td>
                                              <td className="px-3 py-2 border-b border-[#E5E7EB]">
                                                {h.previous ?? '-'}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ProfilContainer>
      </div>
    </PageTemplate>
  );
}
