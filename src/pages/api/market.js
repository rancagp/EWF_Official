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
      throw new Error('Invalid API response format');
    }

    const validItems = Array.isArray(dataMap)
      ? dataMap.map(item => normalizeItem('', item))
      : Object.entries(dataMap).map(([key, item]) => normalizeItem(key, item));

    // Sembunyikan simbol tertentu
    const filteredItems = validItems.filter(item => item.symbol !== 'XAG10_BBJ');
    
    // Pastikan ada data yang valid
    if (filteredItems.length === 0) {
      throw new Error('Data quotes kosong');
    }

    return res.status(200).json(filteredItems);
  } catch (error) {
    console.error('Error in market API route:', error.message);
    return res.status(502).json({ message: 'Gagal mengambil live quotes' });
  }
}
