import React from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useTranslation } from 'next-i18next';

interface CareerCardProps {
  id: number;
  position: string;
  location: string;
  createdAt: string;
  slug: string;
}

const CareerCard: React.FC<CareerCardProps> = ({
  id,
  position,
  location,
  createdAt = new Date().toISOString(),
  slug = '',
}) => {
  const { t } = useTranslation('common');
  
  // Format tanggal sederhana
  let formattedDate = '';
  try {
    const date = new Date(createdAt);
    formattedDate = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = new Date().toLocaleDateString('id-ID');
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {position || t('karier.no_position', 'Posisi tidak tersedia')}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg
                className="w-4 h-4 mr-1.5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                {location || t('karier.no_location', 'Lokasi tidak tersedia')}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col space-y-3">
          <Link 
            href={`/karier/${slug || id}`}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            {t('karier.view_details', 'Lihat Detail')}
          </Link>
          <Link 
            href={`/karier/${slug || id}/lamar`}
            className="inline-flex items-center justify-center px-4 py-2 border border-orange-500 text-sm font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            {t('karier.apply_now', 'Lamar Sekarang')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CareerCard;
