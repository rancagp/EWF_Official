import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useMarketSocket, MarketItem } from '@/hooks/useMarketSocket';

const LastUpdatedTime = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { t } = useTranslation('market');
  
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  if (!currentTime) return null;
  
  return (
    <div className="mt-8 text-center">
      <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
        <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
        <span className="text-sm text-gray-600 font-medium">
          {t('lastUpdated')} <span className="text-gray-900">{currentTime}</span>
        </span>
      </div>
    </div>
  );
};

const MarketCard = ({ item, index }: { item: MarketItem; index: number }) => {
  const isPositive = item.percentChange >= 0;
  const [currentTime, setCurrentTime] = useState<string>('');
  
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatPrice = (symbol: string, price: number | undefined): string => {
    // Handle undefined or null price
    if (price === undefined || price === null) return '-.-';
    
    try {
      if (symbol?.includes('IDR')) return `Rp${price.toLocaleString('id-ID')}`;
      if (symbol?.includes('USD')) return `$${price.toLocaleString('en-US')}`;
      return price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (error) {
      console.error('Error formatting price:', { symbol, price, error });
      return price.toString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ 
        y: -3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}
      className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Card Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {formatPrice(item.symbol, item.last)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{item.symbol}</p>
          </div>
          
          {/* Status Dot */}
          <div className={`w-3 h-3 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div>
      </div>
      
      {/* Divider */}
      <div className="border-t border-gray-100 mx-5"></div>
      
      {/* Card Footer */}
      <div className="px-5 py-3 bg-[#4C4C4C] bg-opacity-10 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-400' : 'text-red-600'
            }`}>
              {isPositive ? '↑' : '↓'} {Math.abs(item.percentChange).toFixed(2)}%
            </span>
            <span className="text-xs text-white ml-1">
              {isPositive ? 'Naik' : 'Turun'} • {currentTime}
            </span>
          </div>
          
          {/* Mini Chart Placeholder */}
          <div className="flex items-end h-8 space-x-px">
            {[3, 6, 4, 8, 5, 9, 7].map((h, i) => (
              <div 
                key={i}
                className={`w-1 rounded-t-sm ${
                  isPositive ? 'bg-green-200' : 'bg-red-200'
                }`}
                style={{ height: `${h}px` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Market() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation('market');
  const { data: marketData, error, connected } = useMarketSocket();

  useEffect(() => {
    if (marketData.length > 0 || error) {
      setIsLoading(false);
    } else if (!connected) {
      setIsLoading(true);
    }
  }, [marketData, error, connected]);

  return (
    <section className="bg-gray-50 py-12 md:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          
            <span className="inline-flex items-center w-fit px-4 py-2 mb-2 text-xs font-bold tracking-wide uppercase text-[#4C4C4C] bg-[#F2AC59]/10 rounded-full">
               <span className="w-2 h-2 bg-[#F2AC59] rounded-full mr-2"></span>
               {t('marketUpdate', 'Market Update')}
             </span>
          
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t('subtitle', 'Update harga real-time untuk instrumen keuangan terkini')}
          </p>
          <div className="mt-6 flex justify-center space-x-4">
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {t('reload', 'Muat Ulang')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {marketData.map((item, index) => (
                <MarketCard key={`${item.symbol}-${index}`} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        <LastUpdatedTime />
      </div>
    </section>
  );
}
