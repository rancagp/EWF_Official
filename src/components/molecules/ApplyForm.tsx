import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import axios from 'axios';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  experience: string;
  noticePeriod: string;
  referral: string;
  motivation: string;
  termsAgreed: boolean;
}

interface ApplyFormProps {
  position: string;
  location: string;
  onClose: () => void;
}

const ApplyForm: React.FC<ApplyFormProps> = ({ position, location, onClose }) => {
  const { t } = useTranslation('common');
  const [isSubmitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    experience: '',
    noticePeriod: '',
    referral: '',
    motivation: '',
    termsAgreed: false,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.termsAgreed) {
      alert('Anda harus menyetujui syarat dan ketentuan');
      return;
    }

    try {
      setSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('position', position);
      formDataToSend.append('location', location);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('noticePeriod', formData.noticePeriod);
      formDataToSend.append('motivation', formData.motivation);
      formDataToSend.append('referral', formData.referral || '');
      
      if (cvFile) {
        formDataToSend.append('cv', cvFile);
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/karier/apply`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data?.success) {
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          experience: '',
          noticePeriod: '',
          referral: '',
          motivation: '',
          termsAgreed: false,
        });
        setCvFile(null);
        
        alert('Lamaran berhasil dikirim. Kami akan segera menghubungi Anda.');
        onClose();
      } else {
        throw new Error(response.data?.message || 'Gagal mengirim lamaran');
      }
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Terjadi kesalahan saat mengirim lamaran. Silakan coba lagi nanti.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-sm space-y-4">
      {/* Baris 1: Nama Lengkap - Nomor Telepon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-[#4C4C4C] mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F2AC59] focus:outline-none focus:ring-1 focus:ring-[#F2AC59]"
            value={formData.fullName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#4C4C4C] mb-1">
            Nomor Telepon <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F2AC59] focus:outline-none focus:ring-1 focus:ring-[#F2AC59]"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Baris 2: Email - Unggah CV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#4C4C4C] mb-1">
            Email Aktif <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F2AC59] focus:outline-none focus:ring-1 focus:ring-[#F2AC59]"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4C4C4C] mb-1">
            Unggah CV (PDF, max 5MB) <span className="text-red-500">*</span>
          </label>
          <div className="flex mt-1">
            <label className="inline-flex items-center px-4 py-2 border border-r-0 border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#F2AC59] focus:border-[#F2AC59] cursor-pointer">
              Pilih File
              <input
                type="file"
                className="sr-only"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </label>
            <div className="flex-1 min-w-0">
              <div className="relative px-3 py-2 h-10 border border-gray-300 rounded-r-md border-l-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-gray-500 bg-white">
                {cvFile ? cvFile.name : 'Tidak ada file dipilih'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Baris 3: Pengalaman - Pemberitahuan Kerja */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-[#4C4C4C] mb-1">
            Pengalaman di Posisi Ini <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="experience"
            name="experience"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F2AC59] focus:outline-none focus:ring-1 focus:ring-[#F2AC59]"
            value={formData.experience}
            onChange={handleInputChange}
            placeholder="Contoh: 2 tahun sebagai Frontend Developer"
          />
        </div>

        <div>
          <label htmlFor="noticePeriod" className="block text-sm font-medium text-[#4C4C4C] mb-1">
            Pemberitahuan Kerja <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="noticePeriod"
            name="noticePeriod"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F2AC59] focus:outline-none focus:ring-1 focus:ring-[#F2AC59]"
            value={formData.noticePeriod}
            onChange={handleInputChange}
            placeholder="Contoh: 1 bulan"
          />
        </div>
      </div>

      {/* Baris 4: Sumber Lowongan */}
      <div>
        <label htmlFor="referral" className="block text-sm font-medium text-[#4C4C4C] mb-1">
          Sumber Lowongan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="referral"
          name="referral"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F2AC59] focus:outline-none focus:ring-1 focus:ring-[#F2AC59]"
          value={formData.referral}
          onChange={handleInputChange}
          placeholder="Dari mana Anda mengetahui lowongan ini?"
        />
      </div>

      {/* Motivasi */}
      <div className="mt-2">
        <label htmlFor="motivation" className="block text-sm font-medium text-[#4C4C4C] mb-1">
          Motivasi Bergabung <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          id="motivation"
          name="motivation"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-[#F2AC59] focus:outline-none focus:ring-1 focus:ring-[#F2AC59]"
          value={formData.motivation}
          onChange={handleInputChange}
        ></textarea>
      </div>

      {/* Syarat & Ketentuan */}
      <div className="flex items-start mt-2">
        <div className="flex items-start h-5">
          <input
            id="termsAgreed"
            name="termsAgreed"
            type="checkbox"
            required
            className="h-4 w-4 text-[#F2AC59] focus:ring-[#F2AC59] border-gray-300 rounded"
            checked={formData.termsAgreed}
            onChange={handleInputChange}
          />
        </div>
        <div className="ml-2 text-xs leading-tight">
          <label htmlFor="termsAgreed" className="font-medium text-[#4C4C4C]">
            Saya telah membaca dan menyetujui{' '}Syarat & Ketentuan dan{' '} Kebijakan Privasi <span className="text-red-500">*</span>
          </label>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${
            isSubmitting ? 'bg-gray-400' : 'bg-[#F2AC59] hover:bg-[#e09b4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F2AC59]'
          } sm:ml-3 sm:w-auto sm:text-sm`}
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Lamaran'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-[#4C4C4C] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F2AC59] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Batal
        </button>
      </div>
    </form>
  );
};

export default ApplyForm;
