import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiOutlinePhotograph, 
  HiOutlineX, 
  HiShieldCheck, 
  HiCreditCard, 
  HiClipboardCopy,
  HiSparkles,
  HiCheckCircle
} from 'react-icons/hi';
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
      toast.success('Payment gateway settings updated successfully');
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-[-0.03em]">
              UPI Gateway & Payment Config
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#5B4BFF]/10 text-[#5B4BFF] border border-[#5B4BFF]/20">
              <HiSparkles className="w-3.5 h-3.5" /> Buyer Facing
            </span>
          </div>
          <p className="text-[#64748B] text-[14.5px]">
            Configure the verified UPI credentials and QR code shown to buyers during 1-click checkout.
          </p>
        </div>
      </div>

      {/* Grid: Form + Live Buyer Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-8">
          <h2 className="text-[18px] font-extrabold text-[#0F172A] tracking-[-0.01em] mb-6 flex items-center gap-2">
            <HiCreditCard className="w-5 h-5 text-[#5B4BFF]" /> Payment Credentials
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input 
                label="Beneficiary / Account Name"
                placeholder="e.g. StreamKart Official"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
              <Input 
                label="Primary UPI ID (VPA)"
                placeholder="e.g. streamkart@upi"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                Checkout Payment Instructions
              </label>
              <textarea
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all resize-y min-h-[110px] placeholder:text-[#94A3B8]"
                placeholder="Step 1: Scan QR or copy UPI ID. Step 2: Complete payment in your UPI app. Step 3: Upload transaction screenshot proof."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0F172A] mb-2">
                Official Gateway QR Code
              </label>
              {!qrCodePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-[#5B4BFF] rounded-[20px] bg-indigo-50/30 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/60 transition-all w-full sm:w-56 h-56 group"
                >
                  <div className="w-12 h-12 rounded-[14px] bg-white border border-indigo-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                    <HiOutlinePhotograph className="w-6 h-6 text-[#5B4BFF]" />
                  </div>
                  <p className="text-[13.5px] font-extrabold text-[#0F172A]">Upload QR Image</p>
                  <p className="text-[11px] text-[#64748B] mt-1">PNG, JPG up to 5MB</p>
                </div>
              ) : (
                <div className="relative border border-slate-200 rounded-[20px] overflow-hidden bg-white p-3 w-56 h-56 flex items-center justify-center shadow-sm">
                  <img src={qrCodePreview} alt="QR Code" className="max-w-full max-h-full object-contain rounded-[10px]" />
                  <button 
                    type="button"
                    onClick={removeQrCode}
                    className="absolute top-2.5 right-2.5 bg-rose-50 border border-rose-200 text-rose-600 p-1.5 rounded-full shadow-xs hover:bg-rose-100 transition-colors"
                    title="Remove QR Image"
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="pt-6 border-t border-[#F1F5F9] flex justify-end">
              <Button 
                type="submit" 
                size="lg" 
                loading={updateMutation.isPending}
                className="bg-[#5B4BFF] hover:bg-[#4E3EF0] text-white font-bold px-8 shadow-md shadow-[#5B4BFF]/25"
              >
                Save Payment Gateway
              </Button>
            </div>
          </form>
        </div>

        {/* Right Live Preview (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 border border-[#E2E8F0] rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-extrabold text-[#5B4BFF] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-xs">
                Live Checkout Simulator
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Preview
              </span>
            </div>

            <div className="bg-white border border-indigo-100 rounded-[20px] p-5 shadow-sm space-y-4">
              <div className="text-center pb-3 border-b border-[#F1F5F9]">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Pay via UPI</p>
                <p className="text-[16px] font-extrabold text-[#0F172A] mt-0.5">
                  {formData.accountName || 'StreamKart Pay'}
                </p>
              </div>

              {/* QR Preview */}
              <div className="flex justify-center py-1">
                {qrCodePreview ? (
                  <div className="p-3 bg-white border border-indigo-100 rounded-[18px] shadow-sm">
                    <img src={qrCodePreview} alt="QR Live" className="w-40 h-40 object-contain rounded-[8px]" />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-[18px] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-3">
                    <HiCreditCard className="w-8 h-8 text-slate-300 mb-1" />
                    <span className="text-[11px] font-semibold text-slate-400">No QR Uploaded</span>
                  </div>
                )}
              </div>

              {/* Copyable VPA */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">UPI ID</p>
                  <p className="text-[13px] font-bold text-[#5B4BFF] font-mono truncate">
                    {formData.upiId || 'not-configured@upi'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => formData.upiId && toast.success('Simulated copy!')}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#5B4BFF] bg-white border border-indigo-100 rounded-[8px] hover:bg-indigo-50 transition-colors flex items-center gap-1 shadow-2xs flex-shrink-0"
                >
                  <HiClipboardCopy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-indigo-50/40 rounded-[12px] p-3 border border-indigo-100/60">
                <p className="text-[11px] font-bold text-[#475569] mb-1">Buyer Instructions:</p>
                <p className="text-[12px] text-[#64748B] leading-relaxed line-clamp-3">
                  {formData.instructions || 'No special instructions entered yet.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-indigo-100/60 flex items-center gap-2 text-[12px] text-[#64748B]">
            <HiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Updated changes reflect immediately across all buyer checkouts.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
