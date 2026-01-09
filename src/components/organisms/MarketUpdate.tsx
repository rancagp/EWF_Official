import { useEffect, useState } from "react";
import { fetchLatestNews, NewsItem } from "@/services/newsService";
interface MarketItem {
  symbol: string;
  last: number;
  percentChange: number;
}

interface NewsItemWithCategory extends Omit<NewsItem, 'category_id'> {
  kategori: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function MarketUpdate() {
    const [marketData, setMarketData] = useState<MarketItem[]>([]);
    const [latestNews, setLatestNews] = useState<NewsItemWithCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Fungsi untuk update berita
    const updateNews = (news: NewsItem[]) => {
        const newsWithCategory = news
            .sort((a, b) => a.id - b.id) // Sort by ID in ascending order (oldest first)
            .slice(-3) // Take the 3 most recent news (last 3 items)
            .map(item => ({
                ...item,
                kategori: item.kategori || { 
                    id: 0, 
                    name: 'Berita', 
                    slug: 'berita' 
                }
            }));
        setLatestNews(newsWithCategory);
    };

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const res = await fetch('/api/market');

                if (!res.ok) {
                    const errorText = `${res.status} ${res.statusText}`;
                    console.error('Respon error:', errorText);
                    setErrorMessage(errorText);
                    setMarketData([]);
                    return;
                }

                const data = await res.json();

                const filteredData = data
                    .filter((item: any) => item?.symbol && typeof item.last === 'number')
                    .map((item: any): MarketItem => ({
                        symbol: String(item.symbol),
                        last: Number(item.last),
                        percentChange: Number(item.percentChange) || 0,
                    }));

                setMarketData(filteredData);
                setErrorMessage(""); // clear error
            } catch (error: any) {
                console.error('Fetch gagal:', error);
                setErrorMessage(error?.message || "Gagal memuat data");
                setMarketData([]);
            }
        };

        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchMarketData(),
                    fetchLatestNews(5).then(updateNews),
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Fetch data market lebih sering (setiap 10 detik)
        const marketInterval = setInterval(() => {
            fetchMarketData();
        }, 10000);

        // Fetch data berita lebih jarang (setiap 5 menit)
        const newsInterval = setInterval(() => {
            fetchLatestNews(5).then(updateNews);
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(marketInterval);
            clearInterval(newsInterval);
        };
    }, []);

    useEffect(() => {
        if (marketData.length > 0 || latestNews.length > 0) {
            setLoading(false);
        }
    }, [marketData, latestNews]);

    const formatPrice = (symbol: string, price: number): string => {
        if (!price && price !== 0) return '-';
        if (symbol.includes('IDR')) return `Rp${price.toLocaleString('id-ID')}`;
        if (symbol.includes('BTC')) return `$${price.toLocaleString('en-US')}`;
        return `$${price.toFixed(2)}`;
    };

    const formatPercent = (percent: number): string => {
        if (percent === null || percent === undefined) return '0.00%';
        const formatted = Number(percent).toFixed(2);
        const sign = percent > 0 ? '+' : '';
        return `${sign}${formatted}%`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Sort news by ID in descending order (newest first)
    const sortedNews = [...latestNews].sort((a, b) => b.id - a.id);

    // Combine news and market data into a single array of items to display (news first, then market data)
    const tickerItems = [
        ...sortedNews.map(news => ({
            type: 'news',
            id: `news-${news.id}`,
            content: (
                <div key={`news-${news.id}`} className="flex items-center h-full">
                    <div className="flex items-center gap-2 px-4">
                        <span className="text-[#F2AC59] font-semibold">
                            {news.kategori?.name || 'Berita'}:
                        </span>
                        <span className="whitespace-nowrap">
                            {news.title}
                        </span>
                    </div>
                    <span className="mx-4 h-full text-[#9B9FA7]">|</span>
                </div>
            )
        })),
        ...marketData.map(item => ({
            type: 'market',
            id: `market-${item.symbol}`,
            content: (
                <div key={`market-${item.symbol}`} className="flex items-center h-full">
                    <div className="flex items-center gap-2 px-4">
                        <span className="font-semibold">{item.symbol}:</span>
                        <span>{formatPrice(item.symbol, item.last)}</span>
                        <span className={`font-medium ${item.percentChange > 0 ? 'text-green-300' :
                                item.percentChange < 0 ? 'text-red-300' :
                                    'text-[#9B9FA7]'
                            }`}>
                            ({formatPercent(item.percentChange)})
                        </span>
                    </div>
                    <span className="mx-4 h-full text-[#9B9FA7]">|</span>
                </div>
            )
        }))
    ];

    return (
        <div className="bg-[#4C4C4C] text-white overflow-hidden shadow group">
            <div className="flex items-center h-10">
                <div className="bg-[#F2AC59] px-4 h-full flex items-center font-bold text-xs sm:text-sm md:text-base whitespace-nowrap text-white">
                    TOP NEWS
                </div>

                <div className="relative overflow-hidden w-full bg-[#4C4C4C] h-10 flex items-center min-w-0">
                    {errorMessage ? (
                        <div className="px-4 text-xs sm:text-sm md:text-base font-semibold text-white">
                            {errorMessage}
                        </div>
                    ) : loading ? (
                        <div className="px-4 text-xs sm:text-sm md:text-base font-semibold text-white">
                            Memuat data...
                        </div>
                    ) : tickerItems.length === 0 ? (
                        <div className="px-4 text-xs sm:text-sm md:text-base font-semibold text-white">
                            Tidak ada data yang tersedia
                        </div>
                    ) : (
                        <div 
                        className="relative flex whitespace-nowrap items-center text-xs sm:text-sm md:text-base h-full"
                        onMouseEnter={() => {
                            const container = document.querySelector('.marquee-container');
                            container?.classList.add('paused');
                        }}
                        onMouseLeave={() => {
                            const container = document.querySelector('.marquee-container');
                            container?.classList.remove('paused');
                        }}
                    >
                        <style jsx>{`
                            .marquee-container {
                                display: flex;
                                animation: scroll 60s linear infinite;
                            }
                            @keyframes scroll {
                                0% { transform: translateX(0); }
                                100% { transform: translateX(-50%); }
                            }
                            .marquee-container.paused {
                                animation-play-state: paused;
                            }
                            .marquee-item {
                                white-space: nowrap;
                                padding-right: 2rem;
                            }
                        `}</style>
                        <div className="marquee-container">
                            {[...tickerItems, ...tickerItems].map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="marquee-item flex items-center">
                                    {item.content}
                                </div>
                            ))}
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
