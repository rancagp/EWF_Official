let lastGoodData = [];
let lastFetchedAt = 0;
const MIN_REFRESH_MS = 2000;
const HIDDEN_SYMBOLS = new Set(['XAG10_BBJ', 'XAGF_BBJ']);

export default async function handler(req, res) {
  try {
    const LIVE_QUOTES_URL = "https://endpoapi-production-3202.up.railway.app/api/live-quotes";
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    const now = Date.now();
    if (lastGoodData.length > 0 && now - lastFetchedAt < MIN_REFRESH_MS) {
      return res.status(200).json(lastGoodData);
    }

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
    
    if (result.status !== 'success' || !Array.isArray(result.data)) {
      throw new Error('Invalid API response format');
    }
    
    // Proses data
    const validItems = result.data.map(item => ({
      symbol: String(item.symbol || ''),
      last: Number(item.last) || 0,
      high: Number(item.high) || 0,
      low: Number(item.low) || 0,
      open: Number(item.open) || 0,
      time: item.serverDateTime || item.serverTime || new Date().toISOString(),
      prevClose: Number(item.prevClose) || 0,
      valueChange: Number(item.valueChange) || 0,
      percentChange: Number(item.percentChange) || 0,
      Volume: Number(item.Volume) || 0,
      bid: Number(item.bid) || 0,
      ask: Number(item.ask) || 0
    }));

    // Sembunyikan simbol tertentu
    const filteredItems = validItems.filter(item => !HIDDEN_SYMBOLS.has(item.symbol));
    
    // Pastikan ada data yang valid
    if (filteredItems.length > 0) {
      lastGoodData = filteredItems;
      lastFetchedAt = now;
      return res.status(200).json(filteredItems);
    }

    throw new Error('Data quotes kosong');
  } catch (error) {
    console.error('Error in market API route:', error.message);
    return res.status(502).json({ message: 'Gagal mengambil live quotes' });
  }
}
