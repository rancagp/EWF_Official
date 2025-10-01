const API_BASE_URL = 'https://portalnews.newsmaker.id/api/v1/kalender-ekonomi';
const API_TOKEN = 'EWF-06433b884f930161';

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

export interface EconomicEvent {
  id: number;
  sources: string;
  measures: string;
  usual_effect: string;
  frequency: string;
  next_released: string;
  notes: string | null;
  why_trader_care: string | null;
  date: string;
  time: string;
  country: string;
  impact: 'High' | 'Medium' | 'Low';
  figures: string;
  previous: string;
  forecast: string;
  actual: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse {
  status: string;
  data: EconomicEvent[];
}

export const fetchEconomicCalendar = async (): Promise<EconomicEvent[]> => {
  try {
    const data = await fetchWithAuth(API_BASE_URL);
    if (data.status === 'success') {
      return data.data;
    }
    throw new Error('Gagal mengambil data kalender ekonomi');
  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    throw error;
  }
};

export const filterEventsByDateRange = (
  events: EconomicEvent[],
  startDate: Date,
  endDate: Date
): EconomicEvent[] => {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
};

export const filterEventsByImpact = (
  events: EconomicEvent[],
  impact: string
): EconomicEvent[] => {
  if (!impact) return events;
  return events.filter(event => event.impact.toLowerCase() === impact.toLowerCase());
};

export const filterEventsByCountry = (
  events: EconomicEvent[],
  country: string
): EconomicEvent[] => {
  if (!country) return events;
  return events.filter(event => 
    event.country.toLowerCase().includes(country.toLowerCase())
  );
};
