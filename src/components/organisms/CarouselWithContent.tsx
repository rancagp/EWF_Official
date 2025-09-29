"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getBanners } from "@/services/bannerService";
import { debounce } from "@/utils/debounce";
import Image from "next/image";

interface Banner {
    id: number;
    title: string;
    description: string;
    image: string;
    order: number;
    is_active: boolean;
    hasError?: boolean;
    key?: string; // Untuk memaksa re-render gambar
    created_at?: string;
    updated_at?: string;
}

interface CTAButton {
    label: string;
    link: string;
}

interface Slide {
    title: string;
    description: string;
    image: string;
    hasError?: boolean;
    key?: string; // Untuk memaksa re-render gambar
}

const defaultBanners: Banner[] = [
    {
        id: 1,
        title: "Real Time Online Trading",
        description: "Bergabunglah dan cobalah alat perdagangan online kami di manapun Anda berada. Hubungi marketing kami untuk memulai panduan yang tepat tentang online trading kami",
        image: "/assets/corousel-1.png",
        order: 1,
        is_active: true,
        hasError: false
    },
    {
        id: 2,
        title: "Layanan Terbaik",
        description: "Kami akan selalu memberikan layanan terbaik bagi seluruh calon nasabah dan nasabah terutama dalam hal kemudahan bertransaksi real account maupun demo account didukung oleh SDM berkualitas yang telah resmi menjadi wakil pialang berjangka melalui fit dan proper test dari Bappebti.",
        image: "/assets/corousel-2.png",
        order: 2,
        is_active: true,
        hasError: false
    }
];

const CTA_ITEMS = [
    { label: "Daftar Sekarang", link: "https://regol.equityworld-futures.co.id/" },
    { label: "Demo", link: "https://demo.ew-futures.com/login" },
    { label: "Live", link: "https://etrade.ew-futures.com/login" },
];

export default function CarouselWithContent() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [index, setIndex] = useState(0);
    const [transitioning, setTransitioning] = useState(true);
    const [isTabActive, setIsTabActive] = useState(true);
    
    // Refs
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMounted = useRef(true);
    
    // Fungsi untuk memuat banner
    const fetchBanners = useCallback(async () => {
        console.log('Memulai pengambilan banner...');
        
        try {
            console.log('Mengambil data dari API...');
            const response = await getBanners();
            
            if (!isMounted.current) return;
            
            console.log('Response dari API:', response);
            
            // Pastikan response adalah array
            if (!Array.isArray(response)) {
                throw new Error('Format data banner tidak valid');
            }
            
            // Proses data banner
            const bannersData = response
                .filter(banner => banner?.is_active && banner?.image)
                .map(banner => {
                    let imageUrl = banner.image.trim();
                    
                    // Pastikan URL menggunakan HTTPS untuk production
                    if (process.env.NODE_ENV === 'production') {
                        imageUrl = imageUrl.replace('http://', 'https://');
                    }
                    
                    // Tambahkan timestamp cache-busting
                    const timestamp = new Date().getTime();
                    imageUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
                    
                    return {
                        id: banner.id,
                        title: banner.title || 'No Title',
                        description: banner.description || '',
                        image: imageUrl,
                        key: `${banner.id}-${new Date().getTime()}`, // Unik key untuk setiap gambar
                        order: banner.order || 0,
                        is_active: true,
                        hasError: false
                    };
                })
                .sort((a, b) => a.order - b.order);
            
            console.log('Banner yang akan ditampilkan:', bannersData);
            
            // Gunakan banner dari API jika ada, jika tidak gunakan default
            setBanners(bannersData.length > 0 ? bannersData : defaultBanners);
        } catch (err) {
            console.error('Gagal mengambil data banner:', err);
            if (isMounted.current) {
                const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat banner';
                console.log('Menampilkan banner default karena error:', errorMessage);
                setError('Gagal memuat banner. Menampilkan banner default.');
                setBanners(defaultBanners);
            }
        } finally {
            console.log('Mengubah status loading menjadi false');
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, []);
    
    // Debug: Pantau perubahan pada state banners
    useEffect(() => {
        console.log('State banners berubah:', banners);
        console.log('Jumlah banner:', banners.length);
        console.log('Isi banners:', JSON.stringify(banners, null, 2));
    }, [banners]);

    // Ambil data banner dari API
    useEffect(() => {
        console.log('Komponen Carousel dipasang, memulai fetchBanners');
        
        // Pastikan komponen terpasang
        isMounted.current = true;
        
        // Reset state sebelum fetch
        setBanners([]);
        setLoading(true);
        setError(null);
        
        // Panggil fetchBanners
        fetchBanners();
        
        // Cleanup function
        return () => {
            console.log('Komponen Carousel dilepas, membersihkan resource');
            isMounted.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []); // Hanya dijalankan sekali saat komponen dipasang

    // Inisialisasi slides dari data banner
    const slides: Slide[] = useMemo(() => {
        console.log('Menginisialisasi slides dari banners:', banners);
        
        // Pastikan banners adalah array yang valid
        if (!Array.isArray(banners) || banners.length === 0) {
            console.log('Tidak ada banner yang tersedia');
            return [];
        }
        
        console.log('Memproses', banners.length, 'banner');
        
        try {
            return banners
                .filter(banner => {
                    if (!banner) return false;
                    const hasImage = banner.image && typeof banner.image === 'string' && banner.image.trim() !== '';
                    if (!hasImage) {
                        console.warn('Banner tidak memiliki gambar yang valid:', banner);
                        return false;
                    }
                    return true;
                })
                .map(banner => {
                    const slide: Slide = {
                        title: banner.title?.trim() || 'No Title',
                        description: banner.description?.trim() || '',
                        image: banner.image.trim()
                    };
                    
                    // Hanya tambahkan properti opsional jika ada nilainya
                    if (banner.hasError !== undefined) {
                        slide.hasError = banner.hasError;
                    }
                    if (banner.key) {
                        slide.key = banner.key;
                    }
                    
                    return slide;
                });
        } catch (error) {
            console.error('Error saat memproses banner:', error);
            return [];
        }
    }, [banners]);

    const totalSlides = Math.max(0, slides.length);
    
    // Debug: Pantau perubahan pada slides
    useEffect(() => {
        console.log('Slides berubah:', slides);
        console.log('Jumlah slides:', slides.length);
        console.log('Isi slides:', JSON.stringify(slides, null, 2));
    }, [slides]);
    
    // Buat array slides untuk infinite carousel
    const fullSlides = useMemo(() => {
        console.log('Membuat fullSlides dari slides:', slides);
        
        if (!Array.isArray(slides) || slides.length === 0) {
            console.log('Tidak ada slide yang tersedia untuk fullSlides');
            return [];
        }
        
        console.log('Membuat fullSlides dengan', slides.length, 'slide');
        
        // Jika hanya ada 1 slide, tidak perlu clone
        if (slides.length === 1) {
            console.log('Hanya 1 slide, tidak perlu clone');
            return [...slides];
        }
        
        // Tambahkan clone dari slide pertama di akhir dan clone dari slide terakhir di awal
        const result = [
            { ...slides[slides.length - 1], __isClone: true },
            ...slides,
            { ...slides[0], __isClone: true }
        ];
        
        console.log('FullSlides berhasil dibuat:', result);
        return result;
    }, [slides]);

    const goTo = useCallback((newIndex: number) => {
        // Pastikan fullSlides sudah terisi
        if (!fullSlides || fullSlides.length === 0) {
            console.log('Tidak ada slide yang tersedia');
            console.warn('No slides available');
            return;
        }
        
        // Pastikan index tidak melebihi batas
        const safeIndex = Math.max(0, Math.min(newIndex, fullSlides.length - 1));
        
        if (newIndex !== safeIndex) {
            console.warn('Adjusted index from', newIndex, 'to', safeIndex);
        }
        
        setIndex(safeIndex);
        setTransitioning(true);
    }, [fullSlides]);

    const [canNavigate, setCanNavigate] = useState(true);
    const navigationCooldown = useRef<NodeJS.Timeout | null>(null);

    // Reset navigation cooldown
    const resetNavigationCooldown = useCallback(() => {
        if (navigationCooldown.current) {
            clearTimeout(navigationCooldown.current);
        }
        navigationCooldown.current = setTimeout(() => {
            setCanNavigate(true);
        }, 800); // 800ms cooldown between navigations
    }, []);

    // Fungsi untuk navigasi ke slide berikutnya
    const next = useCallback(() => {
        if (!canNavigate || fullSlides.length <= 1) return;
        setCanNavigate(false);
        const newIndex = (index + 1) % fullSlides.length;
        goTo(newIndex);
        resetNavigationCooldown();
    }, [index, canNavigate, goTo, resetNavigationCooldown, fullSlides.length]);

    // Fungsi untuk navigasi ke slide sebelumnya
    const prev = useCallback(() => {
        if (!canNavigate || fullSlides.length <= 1) return;
        setCanNavigate(false);
        const newIndex = (index - 1 + fullSlides.length) % fullSlides.length;
        goTo(newIndex);
        resetNavigationCooldown();
    }, [index, canNavigate, goTo, resetNavigationCooldown, fullSlides.length]);

    // Handle reset index when slides change
    useEffect(() => {
        console.log('fullSlides length changed:', fullSlides.length, 'current index:', index);
        
        if (fullSlides.length <= 1) return;
            
        if (index === 0) {
            // Set index ke 1 karena index 0 adalah clone dari slide terakhir
            console.log('Reset index from 0 to 1');
            setIndex(1);
        } else if (index >= fullSlides.length) {
            // Jika index melebihi jumlah slide, reset ke slide terakhir yang asli
            console.log('Reset index from', index, 'to', fullSlides.length - 2);
            setIndex(Math.max(1, fullSlides.length - 2));
        }
    }, [fullSlides.length]);

    const handleTransitionEnd = useCallback(() => {
        // Pastikan fullSlides memiliki konten yang valid
        if (fullSlides.length <= 1) {
            setTransitioning(false);
            return;
        }

        // Reset index jika sampai di clone
        if (index === 0) {
            console.log('Reset ke slide terakhir');
            setIndex(totalSlides);
        } else if (index >= totalSlides + 1) {
            console.log('Reset ke slide pertama');
            setIndex(1);
            // ke clone depan → reset ke slide pertama
            setTransitioning(false);
            requestAnimationFrame(() => {
                setIndex(1);
                requestAnimationFrame(() => {
                    setTransitioning(true);
                });
            });
        } else {
            setTransitioning(false);
        }
    }, [index, totalSlides, fullSlides.length]);

    // Handle tab visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isVisible = !document.hidden;
            console.log('Tab visibility changed:', { isVisible, currentIndex: index });
            setIsTabActive(isVisible);
            
            if (isVisible) {
                // Reset timer when tab becomes visible
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                
                if (transitioning) {
                    timeoutRef.current = setTimeout(next, 5000);
                } else if (fullSlides.length > 1) {
                    // Pastikan index valid
                    const validIndex = Math.max(1, Math.min(index, fullSlides.length - 2));
                    if (validIndex !== index) {
                        setIndex(validIndex);
                    }
                    
                    // Mulai autoplay setelah 5 detik
                    timeoutRef.current = setTimeout(next, 5000);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [transitioning, next, index, fullSlides.length]);

    // Autoplay
    useEffect(() => {
        if (!isTabActive || fullSlides.length <= 1) return;
        
        const startAutoplay = () => {
            if (transitioning) return;
            
            timeoutRef.current = setTimeout(() => {
                if (isTabActive && !transitioning && fullSlides.length > 1) {
                    // Gunakan fungsi next yang sudah didefinisikan
                    next();
                }
            }, 5000); // 5 detik delay antar slide
        };

        // Mulai autoplay setelah transisi selesai
        if (transitioning) {
            const timer = setTimeout(() => {
                // Jangan mulai autoplay jika ini adalah slide kloning
                if (index > 0 && index < fullSlides.length - 1) {
                    startAutoplay();
                }
            }, 1000); // Sesuaikan dengan durasi transisi CSS
            
            return () => clearTimeout(timer);
        } else if (index > 0 && index < fullSlides.length - 1) {
            // Hanya mulai autoplay jika bukan slide kloning
            startAutoplay();
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [index, transitioning, isTabActive, next]);

    // Debounced navigation handlers
    const debouncedGoToNext = useCallback(debounce(next, 300), [next]);
    const debouncedGoToPrev = useCallback(debounce(prev, 300), [prev]);

    const handleImageError = useCallback((viewIndex: number) => {
        console.log('Gambar gagal dimuat:', viewIndex);

        // Map index pada tampilan (fullSlides) ke index asli banner
        const hasClones = slides.length > 1 && fullSlides.length === slides.length + 2;
        let bannerIndex = viewIndex;
        if (hasClones) {
            if (viewIndex === 0) {
                // Clone dari slide terakhir
                bannerIndex = slides.length - 1;
            } else if (viewIndex === fullSlides.length - 1) {
                // Clone dari slide pertama
                bannerIndex = 0;
            } else {
                // Index normal digeser 1 ke kiri karena ada clone di depan
                bannerIndex = viewIndex - 1;
            }
        }

        setBanners((prev) => {
            if (!Array.isArray(prev) || prev.length === 0) return prev;
            if (bannerIndex < 0 || bannerIndex >= prev.length) return prev;

            const copy = [...prev];
            const target = copy[bannerIndex];
            if (!target) return prev;

            copy[bannerIndex] = { ...target, hasError: true };
            return copy;
        });
    }, [slides.length, fullSlides.length]);

    // Tampilkan loading hanya jika benar-benar loading dan belum ada banner
    if (loading && banners.length === 0) {
        console.log('Menampilkan loading state');
        return (
            <div className="relative w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500">
                <div className="animate-pulse">Memuat banner...</div>
            </div>
        );
    }
    
    // Jika tidak loading tapi tidak ada banner, tampilkan pesan
    if (banners.length === 0) {
        console.log('Tidak ada banner yang tersedia untuk ditampilkan');
        return (
            <div className="relative w-full h-96 bg-gray-200 flex items-center justify-center text-red-500">
                Tidak ada banner yang tersedia
            </div>
        );
    }

    if (error || totalSlides === 0) {
        return (
            <div className="relative w-full h-96 bg-gray-200 flex items-center justify-center text-red-500">
                {error || 'Tidak ada banner yang tersedia'}
            </div>
        );
    }

    return (
        <div className="relative w-full overflow-hidden text-white">
            <div
                className="flex"
                style={{
                    transform: `translateX(-${index * 100}%)`,
                    transition: transitioning ? "transform 2s ease-in-out" : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
            >
                {fullSlides.map((slide: Slide, i: number) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-full flex flex-col-reverse md:flex-row items-center justify-center gap-8 px-6 py-8 md:px-16 lg:px-32"
                    >
                        {/* Teks */}
                        <div className="text-center md:text-left max-w-xl">
                            <h1 className="text-2xl md:text-4xl font-bold mb-4">{slide.title}</h1>
                            <p className="text-base md:text-lg mb-6">{slide.description}</p>
                            <div className="flex flex-col md:flex-row gap-3">
                                {CTA_ITEMS.map((item: CTAButton, i: number) => (
                                    <a
                                        key={i}
                                        href={item.link}
                                        target="_blank"
                                        className="inline-block bg-white hover:bg-gray-100 transition text-[#4C4C4C] rounded-full px-5 py-3 font-semibold shadow"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Gambar */}
                        <div className="mt-8 md:mt-0 w-full md:w-1/2 flex-shrink-0">
                            <div className="relative w-full h-[300px] md:h-[450px] lg:h-[420px]">
                                {slide.hasError ? (
                                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">Gambar tidak tersedia</span>
                                    </div>
                                ) : (
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        className="object-contain"
                                        priority={i === 0}
                                        onError={(e) => {
                                            console.error('Gagal memuat gambar:', slide.image);
                                            handleImageError(i);
                                        }}
                                        unoptimized={process.env.NODE_ENV === 'development'}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        aria-label={`Slide ${i + 1}`}
                        onClick={() => goTo(i + 1)}
                        className={`h-3 w-3 rounded-full transition-all ${index === i + 1 ? "bg-white scale-110" : "bg-white/40"}`}
                    />
                ))}
            </div>

            {/* Tombol Navigasi */}
            <button
                aria-label="Previous Slide"
                onClick={debouncedGoToPrev}
                disabled={!canNavigate}
                className={`absolute top-1/2 left-4 -translate-y-1/2 text-white rounded-full p-2 transition-all duration-300 ${
                    canNavigate 
                        ? 'bg-white/30 hover:bg-white/50 cursor-pointer' 
                        : 'bg-white/20 cursor-not-allowed opacity-70'
                }`}
            >
                &#10094;
            </button>
            <button
                aria-label="Next Slide"
                onClick={debouncedGoToNext}
                disabled={!canNavigate}
                className={`absolute top-1/2 right-4 -translate-y-1/2 text-white rounded-full p-2 transition-all duration-300 ${
                    canNavigate 
                        ? 'bg-white/30 hover:bg-white/50 cursor-pointer' 
                        : 'bg-white/20 cursor-not-allowed opacity-70'
                }`}
            >
                &#10095;
            </button>
        </div>
    );
}
