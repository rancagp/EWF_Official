import { useState, useEffect } from "react";
import { useTranslation } from 'next-i18next';
import { getHistoricalData, HistoricalDataItem, SymbolData } from '@/services/historicalDataService';
import { FiFilter, FiDownload } from 'react-icons/fi';

interface HistoricalData extends Omit<HistoricalDataItem, 'open' | 'high' | 'low' | 'close' | 'change' | 'volume' | 'openInterest'> {
    open: string;
    high: string;
    low: string;
    close: string;
    change?: string;
    volume?: string | number;
    openInterest?: string | number | null;
    category: string;
    date: string;
    tanggal?: string;
}

/**
 * Parses a date string in format 'DD MMM YYYY' or 'YYYY-MM-DD' to a Date object
 * @param dateString Date string to parse
 * @returns Date object at midnight in local timezone
 */
const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // Try parsing 'DD MMM YYYY' format first (e.g., '30 Sep 2025')
    const dateParts = dateString.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/);
    if (dateParts) {
        const months: { [key: string]: number } = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        const day = parseInt(dateParts[1], 10);
        const month = months[dateParts[2]];
        const year = parseInt(dateParts[3], 10);
        
        if (isNaN(day) || isNaN(year) || month === undefined) {
            console.error('Invalid date format:', dateString);
            return null;
        }
        
        return new Date(year, month, day);
    }
    
    // Try parsing 'YYYY-MM-DD' format
    const isoMatch = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1; // months are 0-indexed
        const day = parseInt(isoMatch[3], 10);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            console.error('Invalid date format:', dateString);
            return null;
        }
        
        return new Date(year, month, day);
    }
    
    console.error('Unsupported date format:', dateString);
    return null;
};

/**
 * Formats a date string to 'DD MMM YYYY' format in Asia/Jakarta timezone
 * @param dateString Date string to format
 * @returns Formatted date string or original string if invalid
 */
const formatDate = (dateString: string): string => {
    const date = parseDate(dateString);
    if (!date) return dateString;
    
    try {
        const options: Intl.DateTimeFormatOptions = { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            timeZone: 'Asia/Jakarta'
        };
        
        return date.toLocaleDateString('en-GB', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

// Convert API data to the format expected by the component
const transformData = (apiData: SymbolData[]): HistoricalData[] => {
    return apiData.flatMap(symbolData => 
        symbolData.data.map(item => {
            // Helper function to safely convert to string
            const safeToString = (value: any): string => {
                return value !== null && value !== undefined ? value.toString() : '';
            };
            
            // Helper function to safely convert to number or null
            const safeToNumber = (value: any): number | null => {
                const num = Number(value);
                return isNaN(num) ? null : num;
            };
            
            const result: HistoricalData = {
                ...item,
                open: safeToString(item.open),
                high: safeToString(item.high),
                low: safeToString(item.low),
                close: safeToString(item.close),
                change: item.change || undefined,
                volume: safeToNumber(item.volume) ?? undefined,
                openInterest: item.openInterest !== undefined ? safeToNumber(item.openInterest) : undefined,
                category: item.symbol,
                date: item.date,
                // Keep for backward compatibility
                tanggal: item.date
            };
            
            return result;
        })
    );
};

export default function HistoricalDataContent() {
    const { t } = useTranslation('historical-data');
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dataHistorical, setDataHistorical] = useState<HistoricalData[]>([]);
    const [apiData, setApiData] = useState<SymbolData[]>([]);
    const [filteredData, setFilteredData] = useState<HistoricalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedInstrument, setSelectedInstrument] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 8;
    
    const [instruments, setInstruments] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await getHistoricalData();
                setApiData(response.data);
                
                // Transform API data to match the expected format
                const transformedData = transformData(response.data);
                
                // Sort data by date (newest first)
                const sortedData = [...transformedData].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                
                // Define the instrument order
                const instrumentOrder = [
                    'LGD Daily',
                    'BCO Daily',
                    'LSI Daily',
                    'HSI Daily',
                    'SNI Daily',
                    'USD/CHF',
                    'USD/JPY',
                    'GBP/USD',
                    'AUD/USD',
                    'EUR/USD'
                ];
                
                // Get unique instruments from the API response
                const uniqueInstruments = Array.from(new Set(response.data.map(item => item.symbol)));
                
                // Sort the instruments based on the defined order
                const sortedInstruments = uniqueInstruments.sort((a, b) => {
                    const indexA = instrumentOrder.indexOf(a);
                    const indexB = instrumentOrder.indexOf(b);
                    
                    // If both are in the order list, sort them according to the list
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    // If only a is in the list, it comes first
                    if (indexA !== -1) return -1;
                    // If only b is in the list, it comes first
                    if (indexB !== -1) return 1;
                    // If neither is in the list, sort alphabetically
                    return a.localeCompare(b);
                });
                
                setInstruments(sortedInstruments);
                
                // Determine default instrument (prefer 'LGD Daily' if available)
                const defaultInstrument = sortedInstruments.includes('LGD Daily')
                    ? 'LGD Daily'
                    : (sortedInstruments[0] || '');

                // Set selected instrument and filter data accordingly
                if (defaultInstrument) {
                    setSelectedInstrument(defaultInstrument);
                }

                setDataHistorical(sortedData);
                setFilteredData(
                    defaultInstrument
                        ? sortedData.filter(item => item.category === defaultInstrument)
                        : sortedData
                );
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Gagal memuat data. Silakan coba lagi nanti.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
        // Apply filters when any filter changes
        if (dataHistorical.length > 0) {
            applyFilters();
        }
    }, [selectedInstrument, fromDate, toDate, dataHistorical]);

    const applyFilters = () => {
        try {
            let result = [...dataHistorical];
            
            // Filter by instrument
            if (selectedInstrument && selectedInstrument.trim() !== '') {
                result = result.filter(item => 
                    item.category === selectedInstrument
                );
            }
            
            // Filter by date range
            if (fromDate) {
                const startDate = new Date(fromDate);
                startDate.setHours(0, 0, 0, 0);
                result = result.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    return itemDate >= startDate;
                });
            }
            
            if (toDate) {
                const endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999);
                result = result.filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate <= endDate;
                });
            }
            
            setFilteredData(result);
            // Setelah filter, reset ke halaman pertama
            setCurrentPage(1);
        } catch (error) {
            console.error('Error in applyFilters:', error);
            setError('Terjadi kesalahan saat memproses filter.');
        }
    };

    const resetFilters = () => {
        setFromDate('');
        setToDate('');
        // Default back to LGD Daily or first instrument
        const defaultInstrument = instruments.includes('LGD Daily') ? 'LGD Daily' : (instruments[0] || '');
        setSelectedInstrument(defaultInstrument);
        setFilteredData(
            defaultInstrument
                ? dataHistorical.filter(item => item.category === defaultInstrument)
                : [...dataHistorical]
        );
        setCurrentPage(1);
    };

    const handleDownload = (filtered = false) => {
        try {
            const dataToDownload = filtered ? [...filteredData] : [...dataHistorical].slice(-30);
            if (dataToDownload.length === 0) {
                throw new Error('Tidak ada data yang tersedia untuk diunduh');
            }
            
            // Create CSV header and rows
            const header = `${t('table.date')},${t('table.symbol')},${t('table.open')},${t('table.high')},${t('table.low')},${t('table.close')},${t('table.change')},${t('table.volume')}\n`;
            
            const rows = dataToDownload.map((row: HistoricalData) => {
                // Format values, handling null/undefined
                const formatValue = (value: any) => value !== null && value !== undefined ? value : '';
                
                return [
                    formatDate(row.date),
                    `"${row.symbol}"`,
                    formatValue(row.open),
                    formatValue(row.high),
                    formatValue(row.low),
                    formatValue(row.close),
                    formatValue(row.change),
                    formatValue(row.volume)
                ].join(',');
            }).join('\n');

            const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `historical-data-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading data:', err);
            setError('Gagal mengunduh data. ' + (err instanceof Error ? err.message : ''));
        }
    };

    // Hitung total halaman
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    // Ambil data untuk halaman saat ini
    const currentItems = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-4 px-1 py-2 md:p-4">
            {/* Filter Section */}
            <div className="flex flex-col md:flex-row gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-1 flex-col md:flex-row gap-2">
                    {/* Instrument Selector */}
                    <div className="w-full md:w-auto">
                        <select
                            id="instrument"
                            value={selectedInstrument}
                            onChange={(e) => setSelectedInstrument(e.target.value)}
                            className="w-full text-xs md:text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F2AC59] focus:border-[#F2AC59]"
                        >
                            {instruments.map((instrument: string) => (
                                <option key={instrument} value={instrument}>
                                    {instrument}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="date"
                            id="from"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="text-xs md:text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F2AC59] focus:border-[#F2AC59] w-full md:w-36"
                        />
                        <span className="text-gray-500">{t('filters.to')}</span>
                        <input
                            type="date"
                            id="to"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="text-xs md:text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F2AC59] focus:border-[#F2AC59] w-full md:w-36"
                        />
                    </div>

                    {/* Apply & Reset Buttons */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={applyFilters}
                            disabled={isLoading}
                            className="flex-1 md:flex-none px-3 py-1.5 bg-[#F2AC59] text-white rounded-md hover:bg-[#E09B4A] transition-colors text-xs md:text-sm whitespace-nowrap flex items-center justify-center gap-1.5"
                        >
                            <FiFilter className="w-3.5 h-3.5" />
                            <span className="truncate">{t('filters.apply')}</span>
                        </button>
                        <button
                            onClick={resetFilters}
                            disabled={isLoading || (!fromDate && !toDate && !selectedInstrument)}
                            className="flex-1 md:flex-none px-3 py-1.5 bg-[#F2AC59] text-white rounded-md hover:bg-[#E09B4A] transition-colors text-xs md:text-sm whitespace-nowrap flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="truncate">{t('filters.reset')}</span>
                        </button>
                    </div>
                </div>

                {/* Download Button - Pushed to right */}
                <div className="flex justify-end">
                    <button
                        onClick={() => handleDownload(true)}
                        disabled={isLoading || filteredData.length === 0}
                        className="px-3 py-1.5 bg-[#F2AC59] text-white rounded-md hover:bg-[#E09B4A] transition-colors text-xs md:text-sm whitespace-nowrap w-full md:w-auto flex items-center gap-1.5 justify-center"
                    >
                        <FiDownload className="w-3.5 h-3.5" />
                        {t('actions.downloadAll')}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F2AC59]"></div>
                </div>
            ) : (
                /* Data Table */
                <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#E5E7EB]">
                            <thead className="bg-[#4C4C4C]">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Open
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        High
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Low
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Close
                                    </th>
                                    {(selectedInstrument === 'HSI Daily' || selectedInstrument === 'SNI Daily') && (
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Change
                                        </th>
                                    )}
                                    {(selectedInstrument === 'HSI Daily' || selectedInstrument === 'SNI Daily') && (
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Volume
                                        </th>
                                    )}
                                    {selectedInstrument === 'HSI Daily' && (
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Open Interest
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#E5E7EB]">
                                {currentItems.map((item, index) => (
                                    <tr key={`${item.id}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB] hover:bg-[#FFF9F5]'}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4C4C4C]">
                                            {formatDate(item.date)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4C4C4C]">
                                            {item.open}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4C4C4C]">
                                            {item.high}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4C4C4C]">
                                            {item.low}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4C4C4C]">
                                            {item.close}
                                        </td>
                                        {(selectedInstrument === 'HSI Daily' || selectedInstrument === 'SNI Daily') && (
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4C4C4C]">
                                                {item.change}
                                            </td>
                                        )}
                                        {(selectedInstrument === 'HSI Daily' || selectedInstrument === 'SNI Daily') && (
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4C4C4C]">
                                                {item.volume ? item.volume.toLocaleString() : '-'}
                                            </td>
                                        )}
                                        {selectedInstrument === 'HSI Daily' && (
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4C4C4C]">
                                                {item.openInterest ? item.openInterest.toLocaleString() : '-'}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > itemsPerPage && (
                        <div className="flex items-center justify-between px-2 py-3 bg-white border-t border-[#E5E7EB] sm:px-6">
                            {/* Mobile Pagination */}
                            <div className="w-full sm:hidden">
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-[#9B9FA7] cursor-not-allowed' : 'text-[#4C4C4C] hover:bg-[#F5F5F5]'}`}
                                    >
                                        &larr; Sebelumnya
                                    </button>
                                    
                                    <div className="text-sm text-[#4C4C4C]">
                                        Halaman {currentPage} dari {totalPages}
                                    </div>
                                    
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-[#9B9FA7] cursor-not-allowed' : 'text-[#4C4C4C] hover:bg-[#F5F5F5]'}`}
                                    >
                                        Selanjutnya &rarr;
                                    </button>
                                </div>
                            </div>
                            
                            {/* Desktop Pagination */}
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-[#4C4C4C]">
                                        Menampilkan <span className="font-medium">
                                            {(currentPage - 1) * itemsPerPage + 1}
                                        </span> - <span className="font-medium">
                                            {Math.min(currentPage * itemsPerPage, filteredData.length)}
                                        </span> dari <span className="font-medium">
                                            {filteredData.length}
                                        </span> hasil
                                    </p>
                                </div>
                                
                                <div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-[#4C4C4C] bg-white border border-[#9B9FA7] rounded-l-md hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Sebelumnya</span>
                                            &larr;
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => paginate(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                        currentPage === pageNum
                                                            ? 'z-10 bg-[#F2AC59] border-[#F2AC59] text-white'
                                                            : 'bg-white border-[#9B9FA7] text-[#4C4C4C] hover:bg-[#F5F5F5]'
                                                    } border`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-[#4C4C4C] bg-white border border-[#9B9FA7] rounded-r-md hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Selanjutnya</span>
                                            &rarr;
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* No Data Message */}
            {!isLoading && filteredData.length === 0 && (
                <div className="text-center py-8">{t('messages.noData')}</div>
            )}
        </div>
    );
}
