// pages/api/banners.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type Banner = {
    id: number;
    title: string;
    description: string;
    image: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Banner[] | { error: string }>
) {
    try {
        const response = await fetch('https://ewf-admin.newsmaker.id/api/banners');
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Gagal mengambil data banner' });
        }

        const result = await response.json();
        
        // Pastikan URL gambar lengkap
        const banners = result.data.map((banner: Banner) => {
            // Jika sudah URL lengkap, kembalikan langsung
            if (banner.image.startsWith('http')) {
                return banner;
            }
            
            // Hapus semua awalan yang tidak diinginkan
            let cleanPath = banner.image
                .replace(/^(\/|\\)*/, '') // Hapus semua slash di awal
                .replace(/^(public|storage)(\/|\\)*/i, ''); // Hapus awalan public/ atau storage/
            
            // Pastikan tidak ada duplikasi 'storage/'
            if (cleanPath.startsWith('storage/')) {
                cleanPath = cleanPath.replace(/^storage\//, '');
            }
                
            // Cek apakah URL sudah lengkap
            if (banner.image.startsWith('http')) {
                return banner;
            }
            
            // Buat URL lengkap dengan path storage yang benar
            const fullUrl = `https://ewf-admin.newsmaker.id/storage/banners/${cleanPath}`;
            
            console.log('Processed image URL:', {
                original: banner.image,
                cleanPath,
                fullUrl
            });
                
            return {
                ...banner,
                image: fullUrl
            };
        });

        return res.status(200).json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
}
