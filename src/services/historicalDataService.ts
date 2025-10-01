const API_URL = 'https://endpoapi-production-3202.up.railway.app/api/historical';

// Interface for the data item in the API response
export interface HistoricalDataItem {
  id: number;
  symbol: string;
  date: string;
  event: string | null;
  open: number;
  high: number;
  low: number;
  close: number;
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
    const response = await fetch(`${API_URL}?dateFrom=${dateFrom}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: HistoricalDataResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};
