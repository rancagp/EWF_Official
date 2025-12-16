"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import MarketUpdate from "./MarketUpdate";

interface MenuItem {
  key: string;
  label: string;
  href?: string;
  submenu?: MenuItem[];
  icon?: string;
  disabled?: boolean;
}

interface NavItem extends Omit<MenuItem, "submenu"> {
  submenu?: NavItem[];
  target?: string;
}

const baseMenuItems: NavItem[] = [
  { key: "home", label: "Beranda", href: "/" },
  {
    key: "about",
    label: "Tentang Kami",
    submenu: [
      { key: "about_companyProfile", label: "Profil Perusahaan", href: "/profil/perusahaan" },
      { key: "about_businessLicense", label: "Legalitas Bisnis", href: "/profil/legalitas-bisnis" },
      { key: "about_brokerRepresentative", label: "Wakil Pialang", href: "/profil/wakil-pialang" },
      { key: "about_regulatoryBody", label: "Badan Regulasi", href: "/profil/badan-regulasi" },
      { key: "about_facilitiesServices", label: "Fasilitas & Layanan", href: "/umum/fasilitas-layanan" },
      {
        key: "about_achievements",
        label: "Pencapaian",
        submenu: [
          { key: "about_achievements_awards", label: "Penghargaan", href: "/profil/pencapaian/penghargaan" },
          { key: "about_achievements_certificates", label: "Sertifikat", href: "/profil/pencapaian/sertifikat" },
        ],
      },
      {
        key: "about_general",
        label: "Umum",
        submenu: [
          { key: "about_general_information", label: "Informasi", href: "/umum/informasi" },
          { key: "about_general_videos", label: "Video", href: "/umum/video" },
        ],
      },
    ],
  },
  {
    key: "products",
    label: "Produk",
    submenu: [
      { key: "products_allProducts", label: "Semua Produk", href: "/produk" },
      { key: "products_jfxProducts", label: "Produk JFX", href: "/produk/jfx" },
      { key: "products_spaProducts", label: "Produk SPA", href: "/produk/spa" },
      { key: "products_productAdvantages", label: "Keunggulan Produk", href: "/produk/keunggulan-produk" },
      { key: "products_transactionIllustration", label: "Ilustrasi Transaksi", href: "/prosedur/ilustrasi-transaksi" },
    ],
  },
  {
    key: "procedures",
    label: "Prosedur",
    submenu: [
      { key: "procedures_onlineRegistration", label: "Pendaftaran Online", href: "/prosedur/registrasi-online" },
      { key: "procedures_withdrawal", label: "Penarikan Dana", href: "/prosedur/penarikan" },
      { key: "procedures_transactionGuide", label: "Panduan Transaksi", href: "/prosedur/petunjuk-transaksi" },
    ],
  },
  {
    key: "analysis",
    label: "Analisis",
    submenu: [
      { key: "analysis_news", label: "Berita", href: "/analisis/berita" },
      { key: "analysis_economicCalendar", label: "Kalender Ekonomi", href: "/analisis/economic-calendar" },
      { key: "analysis_historicalData", label: "Data Historis", href: "/analisis/historical-data" },
      { key: "analysis_pivotFibonacci", label: "Pivot & Fibonacci", href: "/analisis/pivot-fibonacci" },
    ],
  },
  {
    key: "education",
    label: "Edukasi",
    submenu: [
      { key: "education_tradingMechanism", label: "Mekanisme Trading", href: "/edukasi/mekanisme-perdagangan" },
      { key: "education_indexSymbols", label: "Simbol Indeks", href: "/edukasi/symbol-indeks" },
      { key: "education_locoLondonGold", label: "Loco London Gold", href: "/edukasi/loco-london-gold" },
      { key: "education_summerWinter", label: "Summer & Winter", href: "/edukasi/summer-winter" },
      { key: "education_articles", label: "Artikel", href: "/edukasi/artikel" },
      {
        key: "education_marketingTools",
        label: "Alat Pemasaran",
        href: "https://digitalmarketing.equityworld-futures.com/",
        target: "_blank",
      },
    ],
  },
  { key: "about_careers", label: "Karier", href: "/karier" },
  { key: "about_contact", label: "kontak", href: "/hubungi-kami" },
];

const NavBar: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  const [menuItems, setMenuItems] = useState<NavItem[]>(baseMenuItems);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const translatedMenuItems = baseMenuItems.map((item) => ({
      ...item,
      label: t(item.key, item.label),
      submenu: item.submenu?.map((sub) => ({
        ...sub,
        label: t(sub.key, sub.label),
        submenu: sub.submenu?.map((child) => ({
          ...child,
          label: t(child.key, child.label),
        })),
      })),
    }));

    setMenuItems(translatedMenuItems);
  }, [i18n.language, t]);

  const toggleDropdown = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setOpenDropdowns({});
  };

  // 🔧 FIXED: pakai max-h-screen + bg-white + z-20 biar tidak ketutup
  const renderMobileMenu = (items: NavItem[], level = 0, parentKey = "") => {
    return (
      <div className={`${level > 0 ? "pl-4 bg-[#F8F8F8]" : ""} space-y-0.5 py-2`}>
        {items.map((item) => {
          const itemKey = parentKey ? `${parentKey}.${item.key}` : item.key;

          if (item.submenu && item.submenu.length > 0) {
            return (
              <div key={itemKey} className="border-b border-[#9B9FA7]/10 last:border-0">
                <button
                  onClick={(e) => toggleDropdown(itemKey, e)}
                  className="w-full text-left px-6 py-3 text-base font-medium text-[#4C4C4C] hover:text-[#F2AC59] flex justify-between items-center"
                  aria-expanded={openDropdowns[itemKey] || false}
                  aria-controls={`submenu-${itemKey}`}
                >
                  <span>{item.label}</span>
                  <i
                    className={`fas fa-chevron-${openDropdowns[itemKey] ? "up" : "down"} text-xs text-[#4C4C4C] ml-2`}
                  />
                </button>
                <div
                  id={`submenu-${itemKey}`}
                  className={`overflow-hidden transition-all duration-300 bg-white relative z-20 ${
                    openDropdowns[itemKey] ? "max-h-screen" : "max-h-0"
                  }`}
                >
                  {renderMobileMenu(item.submenu, level + 1, itemKey)}
                </div>
              </div>
            );
          }

          if (item.href) {
            return (
              <div key={itemKey} className="border-b border-[#9B9FA7]/10 last:border-0">
                <Link
                  href={item.href}
                  locale={i18n.language}
                  className="block px-6 py-3 text-base font-medium text-[#4C4C4C] hover:text-[#F2AC59] hover:bg-[#F8F8F8] transition-colors"
                  onClick={closeAllMenus}
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </Link>
              </div>
            );
          }

          return (
            <div key={itemKey} className="border-b border-[#9B9FA7]/10 last:border-0">
              <span className="block px-6 py-3 text-base font-medium text-[#4C4C4C]">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isClient) return null;

  return (
    <div
      className={`sticky top-0 z-50 bg-white border-b border-[#9B9FA7]/30 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={`flex justify-between items-center transition-all duration-300 ${
              isScrolled ? "h-14" : "h-20"
            }`}
          >
            <Link href="/" locale={i18n.language} className="flex items-center gap-2 group">
              <div className="flex items-center">
                <img
                  src="/assets/ewf-logo.png"
                  alt="Logo EWF"
                  width={50}
                  height={50}
                  className={`w-auto transition-all duration-300 group-hover:scale-105 ${
                    isScrolled ? "h-10 md:h-12" : "h-12 md:h-14"
                  }`}
                />
                <span className="ml-3 text-xl md:text-2xl font-bold text-[#4C4C4C] tracking-tight">
                  EQUITYWORLD <span className="text-[#F2AC59]">FUTURES</span>
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item, index) => (
                <div key={item.key} className="relative group">
                  <Link
                    href={item.href || "#"}
                    locale={i18n.language}
                    className="px-4 py-2.5 text-sm font-medium text-[#4C4C4C] hover:text-[#F2AC59] transition-colors flex items-center group-hover:bg-[#F8F8F8] rounded-lg"
                    target={item.target}
                    rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  >
                    {item.label}
                    {item.submenu && (
                      <i className="fas fa-chevron-down text-xs text-[#4C4C4C] ml-1 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>
                  {item.submenu && (
                    <div
                      className={`absolute mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform ${
                        index >= menuItems.length - 2 ? "right-0" : "left-0"
                      }`}
                    >
                      {item.submenu.map((sub) => (
                        <div key={sub.key} className="relative group/sub">
                          <div className="flex items-center justify-between w-full">
                            <Link
                              href={sub.href || "#"}
                              locale={i18n.language}
                              className="flex-1 px-4 py-2.5 text-sm text-[#4C4C4D] hover:bg-[#F8F8F8] text-left hover:text-[#F2AC59] rounded-md"
                              target={sub.target}
                              rel={sub.target === "_blank" ? "noopener noreferrer" : undefined}
                            >
                              {sub.label}
                            </Link>
                            {sub.submenu && (
                              <i
                                className={`fas fa-chevron-right text-xs text-[#4C4C4C] mx-3 group-hover/sub:rotate-90 transition-transform duration-200`}
                              />
                            )}
                          </div>
                          {sub.submenu && (
                            <div
                              className={`absolute top-0 w-56 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 transform ${
                                index >= menuItems.length - 2 ? "right-full mr-1" : "left-full ml-1"
                              }`}
                            >
                              {sub.submenu.map((child) => (
                                <Link
                                  key={child.key}
                                  href={child.href || "#"}
                                  locale={i18n.language}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-[#4C4C4C] hover:text-[#F2AC59] hover:bg-[#F8F8F8] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#F2AC59]"
              >
                <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"} text-xl`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-40 md:hidden transition-opacity ${
            menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop overlay */}
          <div className={`absolute inset-0 bg-black/50 ${menuOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`fixed inset-y-0 left-0 z-50 w-2/3 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#9B9FA7]/30">
              <div className="flex items-center">
                <img src="/assets/ewf-logo.png" alt="Logo EWF" className="h-10 w-auto" />
                <span className="ml-2 text-lg font-bold text-[#4C4C4C]">EquityWorld Futures</span>
              </div>
            </div>
            <div className="h-[calc(100%-64px)] overflow-y-auto py-2">
              {renderMobileMenu(menuItems)}
              <div className="p-4 border-t border-[#9B9FA7]/10">
                <div className="text-xs text-[#9B9FA7] text-center">
                  © {new Date().getFullYear()} EquityWorld Futures. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <MarketUpdate />
    </div>
  );
};

export default NavBar;
