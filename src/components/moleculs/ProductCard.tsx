import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        image: string;
        slug: string;
        category: string;
        deskripsi?: string;
    };
    onClick?: (category: string, slug: string) => void;
    className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
    product = { 
        id: 0, 
        name: 'Produk', 
        image: '', 
        slug: 'produk', 
        category: 'produk' 
    }, 
    onClick, 
    className = '' 
}) => {
    const { t } = useTranslation('produk');

    const imageSrc = (() => {
        const image = (product.image || '').trim();
        if (!image) return '/images/placeholder.jpg';
        if (image.startsWith('http://') || image.startsWith('https://')) return image;
        if (image.startsWith('/')) return image;
        return `${process.env.NEXT_PUBLIC_API_BASE_URL}/img/produk/${image}`;
    })();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onClick) {
            onClick(product.category, product.slug);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onClick) {
                onClick(product.category, product.slug);
            }
        }
    };

    return (
        <div 
            className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 ${className}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <Link href={`/produk/${product?.category?.toLowerCase() || 'produk'}/${product?.slug || 'produk'}`} className="flex flex-col h-full">
                {/* Header with gradient overlay */}
                <div className="relative h-52 overflow-hidden">
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F2AC59] text-white shadow-md">
                            {product.category || 'Produk'}
                        </span>
                    </div>
                    
                    {/* Product Image */}
                    <div className="relative h-full w-full">
                        <Image
                            src={imageSrc}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-1 bg-gradient-to-br from-white to-gray-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#F2AC59] transition-colors duration-300">
                        {product.name}
                    </h3>
                    
                    {product.deskripsi && (
                        <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                            {product.deskripsi}
                        </p>
                    )}
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#F2AC59] opacity-10 -translate-y-1/2 translate-x-1/2 rounded-full group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#F2AC59] opacity-5 -translate-x-1/2 translate-y-1/2 rounded-full group-hover:opacity-10 transition-opacity duration-500"></div>
            </Link>
        </div>
    );
};

export default ProductCard;
