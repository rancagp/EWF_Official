import { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'down' | 'neutral';

export interface MarketItem {
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
  serverTime?: string;
  serverDateTime?: string;
}

interface SocketState {
  data: MarketItem[];
  error: string;
  connected: boolean;
}

const WS_URL = 'wss://wsprc.royalassetindo.co.id';
const HIDDEN_SYMBOLS = new Set(['XAG10_BBJ', 'XAGF_BBJ']);

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
  const symbol = String(item.symbol || item.Symbol || item.name || symbolKey || '');
  const priceDecimals = decimalsForSymbol(symbol);

  const last = toNullableNumber(item.last ?? item.Last ?? item.price ?? item.buy ?? item.bid);
  const prevClose = toNullableNumber(item.prevClose ?? item.PrevClose ?? item.close ?? item.cprice);
  const open = toNullableNumber(item.open ?? item.Open ?? item.o);
  const high = toNullableNumber(item.high ?? item.High ?? item.h);
  const low = toNullableNumber(item.low ?? item.Low ?? item.l);
  const bid = toNullableNumber(item.bid ?? item.Bid);
  const ask = toNullableNumber(item.ask ?? item.Ask);

  const rawValueChange = toNullableNumber(
    item.valueChange ??
      item.change ??
      item.value_change ??
      item.diff ??
      (last !== null && prevClose !== null ? last - prevClose : null)
  );

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

  const serverTime =
    (item.serverTime as string | undefined) ||
    (item.time as string | undefined) ||
    (item.ServerTime as string | undefined) ||
    undefined;
  const serverDateTime =
    (item.serverDateTime as string | undefined) ||
    (item.server_datetime as string | undefined) ||
    (item.datetime as string | undefined) ||
    (item.ServerDateTime as string | undefined) ||
    undefined;

  return {
    symbol,
    last: roundTo(toNumber(last), priceDecimals),
    high: high === null ? undefined : roundTo(toNumber(high), priceDecimals),
    low: low === null ? undefined : roundTo(toNumber(low), priceDecimals),
    open: open === null ? undefined : roundTo(toNumber(open), priceDecimals),
    prevClose: prevClose === null ? undefined : roundTo(toNumber(prevClose), priceDecimals),
    bid: bid === null ? undefined : roundTo(toNumber(bid), priceDecimals),
    ask: ask === null ? undefined : roundTo(toNumber(ask), priceDecimals),
    valueChange: rawValueChange === null ? undefined : roundTo(toNumber(rawValueChange), priceDecimals),
    percentChange: roundTo(toNumber(computedPercent), 6),
    serverTime,
    serverDateTime
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
