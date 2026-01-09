import { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'down' | 'neutral';

export interface MarketItem {
  symbol: string;
  last: number;
  percentChange: number;
  direction?: Direction;
}

interface SocketState {
  data: MarketItem[];
  error: string;
  connected: boolean;
}

const WS_URL = 'wss://wsprc.royalassetindo.co.id';
const HIDDEN_SYMBOLS = new Set(['XAG10_BBJ', 'XAGF_BBJ']);

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toNullableNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const stripPercent = (value: unknown) => {
  if (typeof value === 'string') {
    return value.replace('%', '').trim();
  }
  return value;
};

const normalizeItem = (symbolKey: string, item: Record<string, unknown>): MarketItem => {
  const last = toNullableNumber(item.last ?? item.Last ?? item.price ?? item.buy ?? item.bid);
  const prevClose = toNullableNumber(item.prevClose ?? item.PrevClose ?? item.close ?? item.cprice);
  const rawPercent = toNullableNumber(
    stripPercent(
      item.percentChange ??
        item.changePercent ??
        item.percent ??
        item.percent_change ??
        item.pct_change ??
        item.pct ??
        item.price_change
    )
  );

  const computedPercent =
    rawPercent !== null
      ? rawPercent
      : last !== null && prevClose !== null && prevClose !== 0
        ? ((last - prevClose) / prevClose) * 100
        : 0;

  return {
    symbol: String(item.symbol || item.Symbol || item.name || symbolKey || ''),
    last: toNumber(last),
    percentChange: toNumber(computedPercent)
  };
};

const extractItems = (payload: unknown): MarketItem[] | null => {
  if (!payload) return null;

  const raw = typeof payload === 'string' ? payload : null;
  if (raw) {
    try {
      return extractItems(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  if (Array.isArray(payload)) {
    return payload
      .filter((item) => item && typeof item === 'object')
      .map((item) => normalizeItem('', item as Record<string, unknown>));
  }

  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const nested =
      (obj.data as unknown) ||
      (obj.quotes as unknown) ||
      (obj.result as unknown) ||
      (obj.payload as unknown) ||
      (obj.message as unknown);

    if (nested) return extractItems(nested);

    const entries = Object.entries(obj);
    if (entries.length > 0) {
      return entries
        .filter(([, value]) => value && typeof value === 'object')
        .map(([key, value]) => normalizeItem(key, value as Record<string, unknown>));
    }
  }

  return null;
};

export function useMarketSocket() {
  const [state, setState] = useState<SocketState>({
    data: [],
    error: '',
    connected: false
  });
  const prevDataRef = useRef<MarketItem[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isClosed = false;

    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.addEventListener('open', () => {
        setState((prev) => ({ ...prev, connected: true, error: '' }));
      });

      ws.addEventListener('message', (event) => {
        const items = extractItems(event.data);
        if (!items || items.length === 0) return;

        const filtered = items.filter((item) => item.symbol && !HIDDEN_SYMBOLS.has(item.symbol));
        if (filtered.length === 0) return;

        const dataWithDirection = filtered.map((item) => {
          const prevItem = prevDataRef.current.find((prev) => prev.symbol === item.symbol);
          let direction: Direction = 'neutral';

          if (prevItem) {
            if (item.last > prevItem.last) direction = 'up';
            else if (item.last < prevItem.last) direction = 'down';
          }

          return { ...item, direction };
        });

        prevDataRef.current = dataWithDirection;
        setState((prev) => ({
          ...prev,
          data: dataWithDirection,
          error: ''
        }));
      });

      ws.addEventListener('error', () => {
        setState((prev) => ({ ...prev, error: 'Koneksi market bermasalah.' }));
      });

      ws.addEventListener('close', () => {
        setState((prev) => ({ ...prev, connected: false }));
        if (!isClosed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      });
    };

    connect();

    return () => {
      isClosed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
    };
  }, []);

  return state;
}
