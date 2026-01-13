const API_BASE_URL = 'https://endpoapi-production-3202.up.railway.app/api/calendar';

export type CalendarFilterKey = 'today' | 'thisWeek' | 'nextWeek' | 'previousWeek';

const ENDPOINT_BY_FILTER: Record<CalendarFilterKey, string> = {
  today: `${API_BASE_URL}/today`,
  thisWeek: `${API_BASE_URL}/this-week`,
  nextWeek: `${API_BASE_URL}/next-week`,
  previousWeek: `${API_BASE_URL}/previous-week`,
};

const fetchJson = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store' as const,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on ${url}`);
  }

  return response.json();
};

export interface EconomicEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  country: string;
  impact: 'High' | 'Medium' | 'Low' | '';
  figures: string;
  previous?: string;
  forecast?: string;
  actual?: string;
  details?: {
    sources?: string;
    measures?: string;
    usualEffect?: string;
    frequency?: string;
    nextReleased?: string;
    notes?: string | null;
    whyTraderCare?: string | null;
    history?: Array<{
      date?: string;
      previous?: string;
      forecast?: string;
      actual?: string;
    }>;
  };
}

type RemoteCalendarItem = {
  time?: string;
  date?: string;
  currency?: string;
  impact?: string;
  event?: string;
  previous?: string;
  forecast?: string;
  actual?: string;
  details?: {
    sources?: string;
    measures?: string;
    usualEffect?: string;
    frequency?: string;
    nextReleased?: string;
    notes?: string | null;
    whyTraderCare?: string | null;
    history?: Array<{
      date?: string;
      previous?: string;
      forecast?: string;
      actual?: string;
    }>;
  };
};

type RemoteCalendarResponse = {
  status: string;
  updatedAt?: string;
  total?: number;
  data?: RemoteCalendarItem[];
};

const normalizeImpact = (rawImpact: string | undefined): EconomicEvent['impact'] => {
  if (!rawImpact) return '';

  const lowered = rawImpact.toLowerCase();
  if (lowered.includes('high')) return 'High';
  if (lowered.includes('medium')) return 'Medium';
  if (lowered.includes('low')) return 'Low';

  const starCount = (rawImpact.match(/★/g) || []).length;
  const questionCount = (rawImpact.match(/\?/g) || []).length;
  const level = starCount || questionCount;

  if (level >= 3) return 'High';
  if (level === 2) return 'Medium';
  if (level === 1) return 'Low';
  return '';
};

const normalizeTime = (rawTime: string | undefined) => {
  if (!rawTime) return '';
  // API sometimes returns `YYYY-MM-DD HH.mm` in `time`
  const parts = rawTime.trim().split(/\s+/);
  return parts.length >= 2 ? parts[parts.length - 1] : rawTime.trim();
};

const ymdFromUpdatedAt = (updatedAt: string | undefined) => {
  if (!updatedAt) return '';
  const match = updatedAt.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
};

export const fetchEconomicCalendar = async (filter: CalendarFilterKey): Promise<EconomicEvent[]> => {
  try {
    const url = ENDPOINT_BY_FILTER[filter];
    const response = (await fetchJson(url)) as RemoteCalendarResponse;

    if (response.status !== 'success') {
      throw new Error('Gagal mengambil data kalender ekonomi');
    }

    const items = Array.isArray(response.data) ? response.data : [];
    const fallbackDate =
      filter === 'today' ? ymdFromUpdatedAt(response.updatedAt) || new Date().toISOString().slice(0, 10) : '';

    return items.map((item, index) => {
      const date = item.date || fallbackDate;
      const time = normalizeTime(item.time);
      const country = item.currency || '';
      const figures = item.event || '';
      const impact = normalizeImpact(item.impact);

      return {
        id: `${filter}:${date}:${time}:${country}:${figures}:${index}`,
        date,
        time,
        country,
        impact,
        figures,
        previous: item.previous,
        forecast: item.forecast,
        actual: item.actual,
        details: item.details,
      };
    });
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
