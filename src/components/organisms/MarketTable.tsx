import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMarketSocket, MarketItem as SocketMarketItem } from '@/hooks/useMarketSocket';

type Direction = 'up' | 'down' | 'neutral';

type MarketItem = SocketMarketItem & {
  time?: string;
  direction?: Direction;
};

const decimalsForSymbol = (symbol: string) => {
  const upper = (symbol || '').toUpperCase();
  if (upper.startsWith('HKK') || upper.startsWith('JPK')) return 0;
  if (upper.startsWith('AU') || upper.startsWith('EU') || upper.startsWith('GU') || upper.startsWith('UC')) return 4;
  return 2;
};

const roundTo = (value: number, decimals: number) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

function formatPrice(symbol: string, price: number | undefined): string {
  if (price === undefined || price === null || Number.isNaN(price)) return '-';
  const digits = decimalsForSymbol(symbol);
  const rounded = roundTo(price, digits);
  const value = rounded.toFixed(digits); // no thousand separators + decimal separator is `.`
  if (symbol?.includes('IDR')) return `Rp${value}`;
  if (symbol?.includes('USD')) return `$${value}`;
  return value;
}

export default function MarketTable() {
  const { t } = useTranslation('market');
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const prevDataRef = useRef<MarketItem[]>([]);
  const socket = useMarketSocket();

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

        const processedBase: MarketItem[] = data.map((item: any) => {
          const symbol = String(item.symbol || '');
          const digits = decimalsForSymbol(symbol);

          return {
            symbol,
            last: roundTo(Number(item.last) || 0, digits),
            percentChange: roundTo(Number(item.percentChange) || 0, 6),
            valueChange: roundTo(Number(item.valueChange) || 0, digits),
            high: roundTo(Number(item.high) || 0, digits),
            low: roundTo(Number(item.low) || 0, digits),
            open: roundTo(Number(item.open) || 0, digits),
            prevClose: roundTo(Number(item.prevClose) || 0, digits),
            bid: roundTo(Number(item.bid) || 0, digits),
            ask: roundTo(Number(item.ask) || 0, digits),
            serverDateTime: String(item.serverDateTime || item.time || ''),
            serverTime: String(item.serverTime || ''),
            time: String(item.time || ''),
          };
        });

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
    return;
  }, [t]);

  useEffect(() => {
    if (!socket.data || socket.data.length === 0) return;

    setMarketData((prev) => {
      if (prev.length === 0) return prev;

      const dataBySymbol = new Map(socket.data.map((item) => [item.symbol, item]));
      const next = prev.map((row) => {
        const update = dataBySymbol.get(row.symbol);
        if (!update) return row;

        let direction: Direction = row.direction || 'neutral';
        if (update.last > row.last) direction = 'up';
        else if (update.last < row.last) direction = 'down';

        const merged: MarketItem = {
          ...row,
          last: update.last,
          percentChange: update.percentChange,
          direction,
        };

        if (update.open !== undefined) merged.open = update.open;
        if (update.high !== undefined) merged.high = update.high;
        if (update.low !== undefined) merged.low = update.low;
        if (update.prevClose !== undefined) merged.prevClose = update.prevClose;
        if (update.valueChange !== undefined) merged.valueChange = update.valueChange;
        if (update.bid !== undefined) merged.bid = update.bid;
        if (update.ask !== undefined) merged.ask = update.ask;
        if (update.serverTime !== undefined) merged.serverTime = update.serverTime;
        if (update.serverDateTime !== undefined) merged.serverDateTime = update.serverDateTime;

        return merged;
      });

      prevDataRef.current = next;
      return next;
    });
  }, [socket.data]);

  const latestTime = useMemo(() => {
    const stamps = marketData
      .map((item) => item.serverDateTime || item.time || '')
      .filter((value) => typeof value === 'string' && value.trim().length > 0);
    if (stamps.length === 0) return '';

    const dateTimeStamps = stamps.filter((value) => /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(value));
    if (dateTimeStamps.length > 0) return dateTimeStamps.sort().at(-1) || '';

    const parsed = stamps
      .map((value) => {
        const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
        const time = new Date(normalized).getTime();
        return Number.isNaN(time) ? null : time;
      })
      .filter((n): n is number => n !== null);

    if (parsed.length === 0) return stamps[stamps.length - 1] || '';
    return new Date(Math.max(...parsed)).toLocaleString('id-ID', {
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
