// Sample data sebagai fallback jika API eksternal bermasalah
// const sampleData = [
//   {
//     symbol: "Gold",
//     last: 4037.75,
//     high: 4041.23,
//     low: 4001.8,
//     open: 4020.8,
//     prevClose: 4040.4,
//     valueChange: -2.65,
//     percentChange: -0.07
//   },
//   {
//     symbol: "USD/IDR",
//     last: 16528,
//     high: 16574,
//     low: 16496,
//     open: 16574,
//     prevClose: 16575,
//     valueChange: -47,
//     percentChange: -0.28
//   },
//   {
//     symbol: "EURUSD",
//     last: 1.1647,
//     high: 1.1648,
//     low: 1.1626,
//     open: 1.1626,
//     prevClose: 1.1626,
//     valueChange: 0.0021,
//     percentChange: 0.18
//   }
// ];

export default async function handler(req, res) {
  try {
    // Coba ambil data dari API eksternal
    const response = await fetch(
      "https://endpoapi-production-3202.up.railway.app/api/live-quotes",
      {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Timeout setelah 3 detik
        signal: AbortSignal.timeout(3000)
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status !== 'success' || !Array.isArray(result.data)) {
      console.error('Invalid API response format, using sample data');
      return res.status(200).json(sampleData);
    }
    
    // Proses data
    const validItems = result.data.map(item => ({
      symbol: String(item.symbol || ''),
      last: Number(item.last) || 0,
        high: Number(item.high) || 0,
        low: Number(item.low) || 0,
        open: Number(item.open) || 0,
        time: item.time || new Date().toISOString(),
        prevClose: Number(item.prevClose) || 0,
        valueChange: Number(item.valueChange) || 0,
        percentChange: Number(item.percentChange) || 0,
        Volume: Number(item.Volume) || 0,
        bid: Number(item.bid) || 0,
        ask: Number(item.ask) || 0
      }));
    
    // Pastikan ada data yang valid
    if (validItems.length > 0) {
      return res.status(200).json(validItems);
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
