// Sample data sebagai fallback jika API eksternal bermasalah
const sampleData = [
  {
    symbol: "Gold",
    last: 4037.75,
    high: 4041.23,
    low: 4001.8,
    open: 4020.8,
    prevClose: 4040.4,
    valueChange: -2.65,
    percentChange: -0.07
  },
  {
    symbol: "USD/IDR",
    last: 16528,
    high: 16574,
    low: 16496,
    open: 16574,
    prevClose: 16575,
    valueChange: -47,
    percentChange: -0.28
  },
  {
    symbol: "EURUSD",
    last: 1.1647,
    high: 1.1648,
    low: 1.1626,
    open: 1.1626,
    prevClose: 1.1626,
    valueChange: 0.0021,
    percentChange: 0.18
  }
];

export default async function handler(req, res) {
  try {
    const LIVE_QUOTES_URL = "https://endpoapi-production-3202.up.railway.app/api/live-quotes";
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    const normalizeItem = (symbolKey, item) => ({
      symbol: String(
        item.symbol || item.Symbol || item.name || symbolKey || ''
      ),
      last: Number(item.last ?? item.Last ?? item.price ?? item.buy ?? item.bid ?? 0) || 0,
      high: Number(item.high ?? item.High ?? item.hprice ?? 0) || 0,
      low: Number(item.low ?? item.Low ?? item.lprice ?? 0) || 0,
      open: Number(item.open ?? item.Open ?? item.oprice ?? 0) || 0,
      time: item.time || item.Time || item.date_time || new Date().toISOString(),
      prevClose: Number(item.prevClose ?? item.PrevClose ?? 0) || 0,
      valueChange: Number(item.valueChange ?? item.change ?? item.Change ?? item.price_change ?? 0) || 0,
      percentChange: Number(item.percentChange ?? item.changePercent ?? item.percent ?? 0) || 0,
      Volume: Number(item.Volume ?? item.volume ?? 0) || 0,
      bid: Number(item.bid ?? item.Bid ?? item.buy ?? 0) || 0,
      ask: Number(item.ask ?? item.Ask ?? item.sell ?? 0) || 0
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('timeout'), 5000);

    // Coba ambil data dari API live quotes
    const response = await fetch(LIVE_QUOTES_URL, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'EWF-Official/1.0'
      },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    const dataMap = result?.data && typeof result.data === 'object' ? result.data : result;
    if (!dataMap || typeof dataMap !== 'object') {
      console.error('Invalid API response format, using sample data');
      return res.status(200).json(sampleData);
    }

    const validItems = Array.isArray(dataMap)
      ? dataMap.map(item => normalizeItem('', item))
      : Object.entries(dataMap).map(([key, item]) => normalizeItem(key, item));

    // Sembunyikan simbol tertentu
    const filteredItems = validItems.filter(item => item.symbol !== 'XAG10_BBJ');
    
    // Pastikan ada data yang valid
    if (filteredItems.length > 0) {
      return res.status(200).json(filteredItems);
    } else {
      // Jika tidak ada data valid, kembalikan sample data
      return res.status(200).json(sampleData);
    }
  } catch (error) {
    console.error('Error in market API route:', error.message);
    // Kembalikan sample data jika terjadi error
    return res.status(200).json(sampleData);
  }
}
