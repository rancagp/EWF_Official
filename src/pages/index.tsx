// Home

import { useState, useEffect } from "react";
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageTemplate from "@/components/templates/PageTemplate";
import CarouselWithContent from "@/components/organisms/CarouselWithContent";
import ProdukContainer from "@/components/organisms/ProdukContainer";
import BeritaSection from "@/components/organisms/BeritaSection";
import AboutUs from "@/components/organisms/AboutUs";
import Iso from "@/components/organisms/Market";
import LiveQuotesCta from "@/components/organisms/LiveQuotesCta";
import Pengumuman from "@/components/organisms/Pengumuman";
import WelcomeModal from "@/components/moleculs/WelcomeModal";
import WakilPialangSection from "@/components/organisms/WakilPialangSection";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', [
        'common', 
        'pengumuman', 
        'market',
        'berita',
        'produk',
        'aboutus',
        'welcome',
        'footer',
        'wakil_pialang'
      ])),
    },
  };
};


export default function HomePage() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Buka modal otomatis saat halaman load
    setShowModal(true);
  }, []);

  const handleCloseModal = () => setShowModal(false);

  return (
    <PageTemplate>
      <div className="fixed top-4 right-4 z-50">
      </div>
      
      {/* Welcome Modal */}
      <WelcomeModal isOpen={showModal} onClose={handleCloseModal} />

      {/* Carousel */}
      <CarouselWithContent />

      {/* Content */}
      <div className="py-10 bg-gray-50 space-y-10">
        <div className="space-y-10 mb-20">
          <div className="sm:px-6 md:px-10 lg:px-20 xl:px-36 2xl:px-52">
            <AboutUs />
          </div>

          <hr className="border-gray-200" />

          <div className="sm:px-6 md:px-10 lg:px-20 xl:px-36 2xl:px-52">
            <ProdukContainer />
          </div>

          <hr className="border-gray-200" />

          <div className="sm:px-6 md:px-10 lg:px-20 xl:px-36 2xl:px-52">
            <BeritaSection limit={3} className="mx-auto flex flex-col gap-7" />
          </div>
        </div>

        <hr className="border-gray-200 " />

        <Iso />

        <LiveQuotesCta />

        <hr className="border-gray-200" />

        <div className="sm:px-6 md:px-10 lg:px-20 xl:px-36 2xl:px-52">
          <WakilPialangSection />
        </div>

        <hr className="border-gray-200" />

        <div className="sm:px-6 md:px-10 lg:px-20 xl:px-36 2xl:px-52 my-5">
          <Pengumuman showHeader={true} className="mx-auto px-4" />
        </div>
      </div>
    </PageTemplate>
  );
}
