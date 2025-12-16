import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

const ApplyForm = dynamic(() => import('./ApplyForm'), {
  ssr: false,
});

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: string;
  location: string;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, position, location }) => {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any, cvFile: File | null) => {
    setIsSubmitting(true);
    
    // Simulasi pengiriman form
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Form submitted:', { ...formData, cvFile });
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay with transition */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="flex items-center justify-center min-h-screen p-4 overflow-y-auto">
        {/* Modal Content */}
        <div 
          className="inline-block w-full max-w-2xl max-h-[80vh] bg-white rounded-lg shadow-xl transform transition-all relative z-50 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white px-5 py-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-2xl font-semibold text-[#4C4C4C] mb-6 border-b pb-3">
                  {position} - {location}
                </h3>
                
                <ApplyForm 
                  position={position}
                  location={location}
                  onClose={onClose}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
