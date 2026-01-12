import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';

type Direction = 'up' | 'down' | 'neutral';

type MarketItem = {
  symbol: string;
  last: number;
  percentChange: number;
  direction?: Direction;
  valueChange?: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  bid?: number;
  ask?: number;
  time?: string;
};

function formatPrice(symbol: string, price: number | undefined): string {
  if (price === undefined || price === null || Number.isNaN(price)) return '-';
  if (symbol?.includes('IDR')) return `Rp${price.toLocaleString('id-ID')}`;
  if (symbol?.includes('USD')) return `$${price.toLocaleString('en-US')}`;
  return price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTime(value: string | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function MarketTable() {
  const { t } = useTranslation('market');
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const prevDataRef = useRef<MarketItem[]>([]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/market');
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error ${res.status}: ${errorText || res.statusText || t('errorFetching')}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error(t('invalidDataFormat'));
        }

        const processedBase: MarketItem[] = data.map((item: any) => ({
          symbol: String(item.symbol || ''),
          last: Number(item.last) || 0,
          percentChange: Number(item.percentChange) || 0,
          valueChange: Number(item.valueChange) || 0,
          high: Number(item.high) || 0,
          low: Number(item.low) || 0,
          open: Number(item.open) || 0,
          prevClose: Number(item.prevClose) || 0,
          bid: Number(item.bid) || 0,
          ask: Number(item.ask) || 0,
          time: String(item.time || ''),
        }));

        const processed: MarketItem[] = processedBase.map((item) => {
          const prevItem = prevDataRef.current.find((p) => p.symbol === item.symbol);
          let direction: Direction = 'neutral';
          if (prevItem) {
            if (item.last > prevItem.last) direction = 'up';
            else if (item.last < prevItem.last) direction = 'down';
          }
          return { ...item, direction };
        });

        setMarketData(processed);
        prevDataRef.current = processed;
        setErrorMessage('');
      } catch (error: any) {
        console.error('Error:', error);
        setErrorMessage(error.message || t('error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const intervalId = setInterval(fetchMarketData, 5000);
    return () => clearInterval(intervalId);
  }, [t]);

  const latestTime = useMemo(() => {
    const times = marketData.map((item) => new Date(item.time || '').getTime()).filter((n) => !Number.isNaN(n));
    if (times.length === 0) return '';
    return new Date(Math.max(...times)).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [marketData]);

  if (isLoading) {
    return <p className="text-gray-600">{t('loading')}</p>;
  }

  if (errorMessage) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 mb-4">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          {t('reload', 'Reload')}
        </button>
      </div>
    );
  }

  if (marketData.length === 0) {
    return <p className="text-gray-600">{t('empty', 'Tidak ada data')}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="inline-flex items-center w-fit px-4 py-2 text-xs font-bold tracking-wide uppercase text-[#4C4C4C] bg-[#F2AC59]/10 rounded-full">
          <span className="w-2 h-2 bg-[#F2AC59] rounded-full mr-2" />
          {t('marketUpdate', 'Market Update')}
        </div>
        <div className="text-xs text-gray-500">
          {t('lastUpdated')} {latestTime || '-'}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('table.symbol', 'Simbol')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('table.last', 'Terakhir')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('table.open', 'Open')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('table.high', 'Tertinggi')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('table.low', 'Terendah')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('table.close', 'Close')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('table.percent', '%')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {marketData.map((item) => {
              const direction: Direction = item.direction || 'neutral';
              const isPositive = item.percentChange >= 0;

              return (
                <tr key={item.symbol} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.symbol || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          direction === 'up'
                            ? 'text-green-600'
                            : direction === 'down'
                              ? 'text-red-600'
                              : 'text-gray-400'
                        }`}
                      >
                        {direction === 'up' ? '▲' : direction === 'down' ? '▼' : '•'}
                      </span>
                      {formatPrice(item.symbol, item.last)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(item.symbol, item.open)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatPrice(item.symbol, item.high)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatPrice(item.symbol, item.low)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatPrice(item.symbol, item.prevClose)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <span className={isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {isPositive ? '+' : ''}
                      {item.percentChange.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
