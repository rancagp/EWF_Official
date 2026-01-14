const API_URL = 'https://portalnews.newsmaker.id/api/v1/pivot-history';
const API_TOKEN = 'EWF-06433b884f930161';

// Interface for the data item in the API response
export interface HistoricalDataItem {
  id: number;
  symbol: string;
  date: string;
  event: string | null;
  open: string;
  high: string;
  low: string;
  close: string;
  change: string | null;
  volume: number | null;
  openInterest: number | null;
  createdAt: string;
  updatedAt: string;
}

// Interface for the symbol data in the API response
export interface SymbolData {
  symbol: string;
  data: HistoricalDataItem[];
  updatedAt: string;
}

// Interface for the API response
export interface HistoricalDataResponse {
  status: string;
  totalSymbols: number;
  data: SymbolData[];
}

type PivotHistoryApiItem = {
  id: number;
  tanggal: string;
  open: string | number | null;
  high: string | number | null;
  low: string | number | null;
  close: string | number | null;
  chg: string | null;
  category: string;
  created_at: string;
  updated_at: string;
  volume: number | null;
  open_interest: number | null;
};

type PivotHistoryApiResponse = {
  Code: number;
  status: string;
  data: PivotHistoryApiItem[];
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${API_TOKEN}`);
  headers.set('Accept', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store' as const
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on ${url}`);
  }

  return response.json();
};

// Format date to YYYY-MM-DD for the API
export const getThreeMonthsAgoDate = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  // Set to the first day of the month
  date.setDate(1);
  return date.toISOString().split('T')[0];
};

export const getHistoricalData = async (): Promise<HistoricalDataResponse> => {
  try {
    const dateFrom = getThreeMonthsAgoDate();
    const raw: PivotHistoryApiResponse = await fetchWithAuth(`${API_URL}?dateFrom=${dateFrom}`);

    const groups = new Map<string, HistoricalDataItem[]>();
    for (const item of raw.data ?? []) {
      const symbol = item.category?.trim();
      if (!symbol) continue;
      if (symbol.toUpperCase().startsWith('LSI')) continue;

      const mapped: HistoricalDataItem = {
        id: item.id,
        symbol,
        date: item.tanggal,
        event: null,
        open: item.open === null || item.open === undefined ? '' : String(item.open),
        high: item.high === null || item.high === undefined ? '' : String(item.high),
        low: item.low === null || item.low === undefined ? '' : String(item.low),
        close: item.close === null || item.close === undefined ? '' : String(item.close),
        change: item.chg,
        volume: item.volume,
        openInterest: item.open_interest,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };

      const list = groups.get(symbol);
      if (list) {
        list.push(mapped);
      } else {
        groups.set(symbol, [mapped]);
      }
    }

    const data: SymbolData[] = Array.from(groups.entries()).map(([symbol, items]) => {
      const updatedAt =
        items.reduce<string | null>((latest, current) => {
          if (!latest) return current.updatedAt;
          return new Date(current.updatedAt) > new Date(latest) ? current.updatedAt : latest;
        }, null) ?? new Date(0).toISOString();

      return { symbol, data: items, updatedAt };
    });

    return {
      status: raw.status ?? 'success',
      totalSymbols: data.length,
      data
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};
