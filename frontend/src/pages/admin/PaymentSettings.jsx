import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const PaymentSettings = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    upiId: '',
    accountName: '',
    instructions: '',
  });
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [qrCodePreview, setQrCodePreview] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminPaymentSettings'],
    queryFn: async () => {
      const res = await api.get('/payments/settings');
      return res.data;
    }
  });

  useEffect(() => {
    if (data) {
      setFormData({
        upiId: data.upiId || '',
        accountName: data.accountName || '',
        instructions: data.instructions || '',
      });
      if (data.qrCode) {
        setQrCodePreview(data.qrCode);
        setQrCodeBase64(data.qrCode);
      }
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => await api.put('/payment-verifications/settings', payload),
    onSuccess: () => {
      toast.success('Payment settings updated successfully');
      queryClient.invalidateQueries(['adminPaymentSettings', 'paymentSettings']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be under 5MB');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setQrCodePreview(URL.createObjectURL(file));
        setQrCodeBase64(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);
    }
  };

  const removeQrCode = () => {
    setQrCodePreview('');
    setQrCodeBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      ...formData,
      qrCode: qrCodeBase64
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Payment Settings</h1>
        <p className="text-[#64748B] text-[15px]">Configure the UPI payment details shown to buyers during checkout.</p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Account Name"
              placeholder="e.g. StreamKart Official"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              required
            />
            <Input 
              label="UPI ID"
              placeholder="e.g. streamkart@upi"
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2">Payment Instructions</label>
            <textarea
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-3 text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B4BFF]/20 focus:border-[#5B4BFF] transition-all resize-y min-h-[100px]"
              placeholder="Instructions for the buyer..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2">QR Code Image</label>
            {!qrCodePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#CBD5E1] rounded-[16px] bg-[#F8FAFC] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F1F5F9] transition-colors w-48 h-48"
              >
                <HiOutlinePhotograph className="w-8 h-8 text-[#94A3B8] mb-2" />
                <p className="text-[13px] font-bold text-[#334155]">Upload QR</p>
              </div>
            ) : (
              <div className="relative border border-[#E2E8F0] rounded-[16px] overflow-hidden bg-white p-2 w-48 h-48 flex items-center justify-center shadow-sm">
                <img src={qrCodePreview} alt="QR Code" className="max-w-full max-h-full object-contain" />
                <button 
                  type="button"
                  onClick={removeQrCode}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[#0F172A] p-1.5 rounded-full shadow-sm hover:text-red-600 transition-colors"
                >
                  <HiOutlineX className="w-4 h-4" />
                </button>
              </div>
            )}
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="pt-6 border-t border-[#E2E8F0] flex justify-end">
            <Button type="submit" size="lg" loading={updateMutation.isPending}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentSettings;
