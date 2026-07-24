import { useState, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';
import { apiPut } from '../../services/api';
import ImageCropperModal from '../../components/ui/ImageCropperModal';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  // Avatar upload states
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiPut('/auth/profile', { name, phone });
      setUser(res.data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
      // reset input
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setImageSrc(null); // close modal
    setIsUploading(true);
    const toastId = toast.loading('Saving photo...');
    try {
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(croppedBlob);
      });
      
      const res = await apiPut('/auth/profile', { avatar: base64data });
      setUser(res.data);
      toast.success('Profile photo updated!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save photo', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">Profile Settings</h1>
      
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 max-w-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-8 border-b border-[#F1F5F9]">
          <div className="relative group">
            <Avatar src={user?.avatar} name={user?.name} size="xl" className="ring-4 ring-[#F8FAFC] shadow-sm" />
            <div 
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-white text-xs font-semibold">Edit</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[#0F172A] font-bold text-[20px] mb-1">{user?.name || 'User'}</h2>
            <p className="text-[#64748B] text-[15px] mb-4">{user?.email}</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="font-semibold"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Change Photo'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-[#F8FAFC] border-transparent focus:bg-white" />
          <Input label="Email Address" value={email} disabled className="!bg-[#F1F5F9] opacity-70 cursor-not-allowed text-[#475569]" />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="bg-[#F8FAFC] border-transparent focus:bg-white" />
          
          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg" className="px-8 shadow-[0_4px_14px_rgba(91,75,255,0.3)]">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {imageSrc && (
        <ImageCropperModal
          imageSrc={imageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageSrc(null)}
        />
      )}

      {/* Seller Account Upgrade */}
      {user?.role === 'user' && (
        <div className="mt-8 bg-gradient-to-r from-[#5B4BFF]/5 to-[#7C3AED]/5 border border-[#5B4BFF]/20 rounded-[24px] p-8 max-w-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-gradient-to-br from-[#5B4BFF]/20 to-[#7C3AED]/20 rounded-full blur-[24px]" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🚀</span>
              <h3 className="text-[18px] font-bold text-[#0F172A]">Want to sell on StreamKart?</h3>
            </div>
            <p className="text-[#64748B] text-[15px] mb-6 leading-relaxed">Upgrade your account to a seller profile to access the Seller Dashboard, manage inventory, and receive orders.</p>
            <Button 
              onClick={async () => {
                try {
                  const { becomeSeller } = await import('../../services/auth.service');
                  const res = await becomeSeller();
                  useAuthStore.getState().setUser(res.data);
                  toast.success('You are now a Seller!');
                  window.location.href = '/seller'; // Force a full navigation to ensure sidebar updates
                } catch (err) {
                  toast.error(err.message || 'Failed to upgrade');
                }
              }}
              className="bg-[#0F172A] hover:bg-[#1E293B] shadow-[0_4px_14px_rgba(15,23,42,0.4)] border-none"
            >
              Upgrade to Seller Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
