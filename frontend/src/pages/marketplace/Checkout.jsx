import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import { HiShieldCheck, HiLockClosed, HiOutlineQrcode, HiOutlineDocumentDuplicate, HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import useCart from '../../hooks/useCart';
import useAuthStore from '../../store/authStore';
import api, { apiPost } from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotBase64, setScreenshotBase64] = useState(null);
  
  const { items: cartItems, total: subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const bundleId = location.state?.bundleId;
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data: bundle } = useQuery({
    queryKey: ['bundle', bundleId],
    queryFn: async () => {
      const res = await api.get(`/bundles/${bundleId}`);
      return res.data;
    },
    enabled: !!bundleId,
  });

  const { data: settingsRes } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      const res = await api.get('/payments/settings');
      return res.data;
    }
  });

  const settings = settingsRes || {};
  const cartSubtotal = bundleId && bundle ? bundle.bundlePrice : subtotal;
  const platformFee = cartSubtotal * 0.02;
  const total = cartSubtotal + platformFee;

  const handleCopyUpi = () => {
    if (settings.upiId) {
      navigator.clipboard.writeText(settings.upiId);
      toast.success('UPI ID copied to clipboard!');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setScreenshotPreview(URL.createObjectURL(file));
        setScreenshotBase64(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitProof = async () => {
    const reuploadOrder = location.state?.reuploadOrder;

    if (!reuploadOrder && !bundleId && cartItems.length === 0) return toast.error('Your cart is empty');
    if (!screenshotBase64) return toast.error('Please upload a payment screenshot');

    try {
      setIsProcessing(true);
      
      let orderIds = [];
      let bundleOrderIds = [];

      if (reuploadOrder) {
        if (reuploadOrder.orderType === 'BundleOrder' || reuploadOrder.isBundle) {
          bundleOrderIds.push(reuploadOrder.orderId);
        } else {
          orderIds.push(reuploadOrder.orderId);
        }
      } else if (bundleId) {
        // Handle direct Bundle Checkout
        const { data: dbOrder } = await apiPost('/bundle-orders', {
          bundleId,
          paymentMethod: 'upi'
        });
        bundleOrderIds.push(dbOrder._id);
      } else {
        // Handle Mixed Cart Checkout
        const productItems = cartItems.filter(item => !item.bundlePrice);
        const bundleItems = cartItems.filter(item => !!item.bundlePrice);

        const productOrderPromises = productItems.map(item => 
          apiPost('/orders', { productId: item._id, paymentMethod: 'upi' })
        );
        const bundleOrderPromises = bundleItems.map(item => 
          apiPost('/bundle-orders', { bundleId: item._id, paymentMethod: 'upi' })
        );

        const dbOrdersResponses = await Promise.all(productOrderPromises);
        const dbBundleResponses = await Promise.all(bundleOrderPromises);

        orderIds = dbOrdersResponses.map(res => res.data._id);
        bundleOrderIds = dbBundleResponses.map(res => res.data._id);
      }

      // Submit proof
      await apiPost('/payments/submit-proof', {
        orderIds,
        bundleOrderIds,
        screenshot: screenshotBase64,
        upiReference: '', // Could add an input for this later if needed
      });

      // Track pending orders for the PaymentApprovalHandler to poll globally
      try {
        const existingPending = JSON.parse(localStorage.getItem('streamkart_pending_orders') || '[]');
        const newPending = [...new Set([...existingPending, ...orderIds, ...bundleOrderIds])];
        localStorage.setItem('streamkart_pending_orders', JSON.stringify(newPending));
      } catch (e) {}

      if (!reuploadOrder) {
        clearCart();
      }
      navigate('/payment-pending', { state: { orderIds, bundleOrderIds } });
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment proof');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {location.state?.reuploadOrder && (
        <div className="mb-8 p-5 bg-[#FEF2F2] border border-[#FECACA] rounded-[20px] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[#991B1B] text-base mb-1">
              Re-upload Payment Proof for {location.state.reuploadOrder.productName || 'Order'}
            </h3>
            <p className="text-sm font-medium text-[#7F1D1D]">
              Reason for rejection: {location.state.reuploadOrder.rejectionReason}
            </p>
          </div>
          <span className="px-3 py-[#6px] bg-[#EF4444] text-white text-xs font-extrabold rounded-full uppercase tracking-wider">
            Re-upload Mode
          </span>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between mb-10 pb-5 border-b border-[#F1F5F9]">
        <Link to="/" className="text-[22px] font-extrabold text-[#0F172A] tracking-tight"><span className="text-[#5B4BFF]">Stream</span>Kart</Link>
        <div className="flex items-center gap-2 text-[#64748B] text-[13px] font-semibold tracking-wide uppercase"><HiLockClosed className="w-4 h-4 text-[#5B4BFF]" /> Secure Checkout</div>
        <Link to="/cart" className="text-[14px] text-[#64748B] hover:text-[#0F172A] font-medium transition-colors">Return to Cart</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left — Payment Info */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-8 lg:p-12 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <h2 className="text-[26px] font-extrabold text-[#0F172A] mb-3 tracking-[-0.02em]">Complete Your Payment</h2>
            <p className="text-[#64748B] leading-relaxed text-[15px] mb-8">
              {settings.instructions || 'Scan the QR code or use the UPI ID below to make the payment. After payment, upload a clear screenshot.'}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-[20px] shadow-sm border border-[#E2E8F0] flex-shrink-0">
                {settings.qrCode ? (
                  <img src={settings.qrCode} alt="Payment QR Code" className="w-48 h-48 object-contain rounded-[12px]" />
                ) : (
                  <div className="w-48 h-48 bg-[#F1F5F9] rounded-[12px] flex items-center justify-center text-[#94A3B8]">
                    <HiOutlineQrcode className="w-12 h-12 opacity-50 mb-2" />
                  </div>
                )}
              </div>

              {/* UPI ID Details */}
              <div className="flex-1 w-full space-y-6">
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Account Name</div>
                  <div className="text-[18px] font-bold text-[#0F172A]">{settings.accountName || 'StreamKart Official'}</div>
                </div>
                
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">UPI ID</div>
                  <div className="flex items-center">
                    <code className="bg-white px-4 py-2.5 rounded-l-[12px] border border-[#E2E8F0] border-r-0 text-[#5B4BFF] font-bold text-[15px] flex-1">
                      {settings.upiId || 'streamkart@upi'}
                    </code>
                    <button 
                      onClick={handleCopyUpi}
                      className="bg-[#0F172A] text-white px-5 py-2.5 rounded-r-[12px] font-bold text-[13px] hover:bg-[#1E293B] transition-colors flex items-center gap-2 h-full"
                    >
                      <HiOutlineDocumentDuplicate className="w-4 h-4" /> Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-[#E2E8F0] text-[13px] text-[#64748B] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-2"><HiShieldCheck className="w-4 h-4 text-[#22C55E]" /> Manual Verification</span>
              <span className="flex items-center gap-2"><HiLockClosed className="w-4 h-4 text-[#5B4BFF]" /> Secure Upload</span>
            </div>
          </div>
        </div>

        {/* Right — Order Summary & Proof Upload */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 lg:p-10 sticky top-24 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]" />
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-8">Order Summary</h2>

            {cartItems.length === 0 && !bundleId ? (
              <p className="text-[#94A3B8] text-sm mb-6 pb-6 border-b border-[#F1F5F9]">Your cart is empty.</p>
            ) : (
              <div className="space-y-4 mb-6 pb-6 border-b border-[#F1F5F9]">
                {bundle ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-[10px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center overflow-hidden flex-shrink-0">
                       <span className="text-[#94A3B8] font-extrabold text-xl">{bundle.title?.[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0F172A] font-bold text-[14px] truncate">{bundle.title}</p>
                    </div>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-[10px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.logo || item.thumbnail ? (
                          <img src={item.logo || item.thumbnail} alt={item.title} className="max-h-full max-w-full object-cover p-1.5" />
                        ) : (
                          <span className="text-[#94A3B8] font-extrabold text-xl">{item.title?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0F172A] font-bold text-[14px] truncate">{item.title}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-between items-baseline mb-8">
              <span className="text-[#0F172A] font-bold text-[17px]">Total Payable</span>
              <div className="text-right">
                <p className="text-[#0F172A] font-extrabold text-[32px] tracking-[-0.02em] leading-none mb-1">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[#94A3B8] text-[11px] font-bold tracking-[0.08em]">BILLED IN INR</p>
              </div>
            </div>

            {/* File Uploader */}
            <div className="mb-8">
              <label className="block text-[13px] font-bold text-[#334155] mb-3 uppercase tracking-[0.08em]">Payment Screenshot</label>
              
              {!screenshotPreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#CBD5E1] rounded-[16px] bg-[#F8FAFC] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F1F5F9] hover:border-[#94A3B8] transition-colors"
                >
                  <HiOutlinePhotograph className="w-10 h-10 text-[#94A3B8] mb-3" />
                  <p className="text-[14px] font-bold text-[#334155]">Click to upload proof</p>
                  <p className="text-[12px] font-medium text-[#64748B] mt-1">JPG, PNG up to 10MB</p>
                </div>
              ) : (
                <div className="relative border border-[#E2E8F0] rounded-[16px] overflow-hidden bg-[#F8FAFC] p-2">
                  <div className="relative aspect-video rounded-[12px] overflow-hidden bg-white">
                    <img src={screenshotPreview} alt="Screenshot" className="w-full h-full object-contain" />
                  </div>
                  <button 
                    onClick={removeScreenshot}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[#0F172A] p-2 rounded-full shadow-sm hover:bg-white hover:text-red-600 transition-colors"
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={handleFileChange} />
            </div>

            <Button 
              size="lg" 
              className="w-full py-4 text-[15px] font-extrabold shadow-[0_4px_14px_rgba(91,75,255,0.4)]" 
              onClick={handleSubmitProof} 
              disabled={isProcessing || !screenshotBase64}
              loading={isProcessing}
            >
              Submit Payment for Verification
            </Button>
            
            <p className="text-[12px] text-[#94A3B8] text-center leading-relaxed mt-5">
              Your payment will be manually reviewed by our team. Access will be granted upon successful verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
